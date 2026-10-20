import { Router } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// The Gemini model is configurable via env because model ids get retired:
// this route previously hardcoded 'gemini-2.0-flash', which Google shut down
// on 1 Jun 2026, killing the route. Default is the current GA Flash model —
// override with GEMINI_MODEL instead of editing code next retirement.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_TIMEOUT_MS = 50_000; // stay inside Vercel's 60s function cap

const roadmapStepSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  icon: z.string().max(16),
  status: z.enum(['completed', 'current', 'future']),
});

const roadmapSchema = z.object({
  currentSituation: z.string().min(1).max(1000),
  steps: z.array(roadmapStepSchema).min(1).max(20),
  timelineMonths: z.string().min(1).max(100),
});

// GET /api/roadmap - Get user's roadmap
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch roadmap',
    });
  }
});

// POST /api/roadmap - Create or update the user's roadmap (one active
// roadmap per user; previously every call created another duplicate row
// while GET only ever read the newest)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const validatedData = roadmapSchema.parse(req.body);

    const existing = await prisma.roadmap.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const roadmap = existing
      ? await prisma.roadmap.update({
          where: { id: existing.id },
          data: validatedData,
        })
      : await prisma.roadmap.create({
          data: {
            userId: req.user!.id,
            ...validatedData,
          },
        });

    return res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Error saving roadmap:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save roadmap',
    });
  }
});

// POST /api/roadmap/generate - Generate AI roadmap
router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured. Please contact support.',
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please complete onboarding first.',
      });
    }

    console.log(`Generating AI roadmap for user ${req.user!.id}`);

    // Check if roadmap already exists
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: { userId: req.user!.id },
    });

    if (existingRoadmap) {
      console.log('Roadmap already exists, returning existing one');
      return res.json({
        success: true,
        roadmap: existingRoadmap,
        source: 'existing',
      });
    }

    // Initialize Gemini AI (model id from env — see GEMINI_MODEL above)
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Create comprehensive prompt
    const prompt = `You are an AI career advisor specializing in helping women restart their careers after gaps.

User Profile:
- Age: ${profile.age}
- Location: ${profile.country}
- Education: ${profile.educationLevel}
- Career Gap Reason: ${profile.reasonStopped}
- Skills: ${profile.skills}
- Interests: ${profile.interests}
- Time Availability: ${profile.hoursPerDay}
- Internet Access: ${profile.internetAvailability}
- Career Goal: ${profile.careerGoal}

Create a personalized 5-step comeback roadmap for this person. Each step should be practical, achievable, and tailored to their specific situation.

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "currentSituation": "A one-sentence summary of their current position",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of what they need to do in this step",
      "icon": "📚",
      "status": "future"
    }
  ],
  "timelineMonths": "Expected timeline like '6-8 months'"
}

Make it personal, encouraging, and actionable. Focus on building confidence and skills progressively.`;

    // Call Gemini AI (with a timeout so a hung call cannot ride out the
    // whole serverless function window)
    console.log('Calling Gemini API...');
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out. Please try again.')), GEMINI_TIMEOUT_MS)
      ),
    ]);
    const response = result.response;
    const text = response.text();

    console.log(`Gemini response received (${text.length} chars)`);

    // Clean response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse AI response
    let aiRoadmap;
    try {
      aiRoadmap = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedText);
      throw new Error('AI returned invalid format. Please try again.');
    }

    if (!aiRoadmap || !Array.isArray(aiRoadmap.steps)) {
      throw new Error('AI returned invalid format. Please try again.');
    }

    // Validate with Zod
    const validated = roadmapSchema.parse({
      currentSituation: aiRoadmap.currentSituation,
      steps: aiRoadmap.steps.map((step: any, index: number) => ({
        title: step.title,
        description: step.description,
        icon: step.icon || '🎯',
        status: index === 0 ? 'current' : 'future',
      })),
      timelineMonths: aiRoadmap.timelineMonths,
    });

    // Save to database
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: req.user!.id,
        currentSituation: validated.currentSituation,
        steps: validated.steps as any,
        timelineMonths: validated.timelineMonths,
        completionPercent: 0,
        currentStep: 0,
      },
    });

    console.log('Roadmap saved successfully:', roadmap.id);

    return res.json({
      success: true,
      roadmap,
      source: 'ai',
    });
  } catch (error) {
    // Full error (including stack) stays in the server logs only — it used
    // to be returned to the client in `details`, leaking internals.
    console.error('Error generating roadmap:', error);

    // Only messages written for users in this handler are safe to surface;
    // anything else (Gemini/Prisma internals) becomes a generic message.
    const safeMessages = [
      'AI returned invalid format. Please try again.',
      'AI generation timed out. Please try again.',
    ];
    const errorMessage = error instanceof Error && safeMessages.includes(error.message)
      ? error.message
      : 'Failed to generate roadmap';

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;
