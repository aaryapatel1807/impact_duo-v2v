import { Router } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const roadmapStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  status: z.enum(['completed', 'current', 'future']),
});

const roadmapSchema = z.object({
  currentSituation: z.string(),
  steps: z.array(roadmapStepSchema),
  timelineMonths: z.string(),
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
      error: error instanceof Error ? error.message : 'Failed to fetch roadmap',
    });
  }
});

// POST /api/roadmap - Create roadmap
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const validatedData = roadmapSchema.parse(req.body);

    const roadmap = await prisma.roadmap.create({
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
      error: error instanceof Error ? error.message : 'Failed to save roadmap',
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

    // Initialize Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    // Call Gemini AI
    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Gemini Response received:', text.substring(0, 200));

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
    console.error('Error generating roadmap:', error);
    
    // Return specific error messages
    let errorMessage = 'Failed to generate roadmap';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

export default router;
