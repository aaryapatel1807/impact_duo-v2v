import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Fallback roadmap if AI fails (for demo resilience)
function getFallbackRoadmap(profile: any) {
  const isLowInternet = profile.internetAvailability === 'low' || profile.internetAvailability === 'none';
  
  return {
    currentSituation: `You completed ${profile.educationLevel} and paused your education/career — that's a starting point, not a setback. Your skills in ${profile.skills.split(',')[0]?.trim()} show you're already building valuable experience.`,
    steps: isLowInternet ? [
      {
        title: 'Community Center Skills Program',
        description: 'Join local women\'s skill development center for offline training in business basics (weekends, 2 hours)',
        icon: '🏫',
        status: 'current',
      },
      {
        title: 'Radio-based Learning',
        description: 'Enroll in state radio\'s skill program — no internet needed, learn via audio lessons',
        icon: '📻',
        status: 'future',
      },
      {
        title: 'Local Certification',
        description: 'Complete government certification at district office (paperwork + practical assessment)',
        icon: '📜',
        status: 'future',
      },
      {
        title: 'Local Business Network',
        description: 'Join women\'s co-op workspace with shared resources',
        icon: '🏪',
        status: 'future',
      },
      {
        title: 'First Client/Income',
        description: 'Secure regular work through co-op connections + local word-of-mouth',
        icon: '🤝',
        status: 'future',
      },
    ] : [
      {
        title: 'Digital Literacy Foundation',
        description: 'Free online course: Computer basics + Internet safety (3 weeks, self-paced)',
        icon: '💻',
        status: 'current',
      },
      {
        title: 'Skill Training',
        description: 'Online course in your area of interest (6 weeks, 1-2 hours/day)',
        icon: '🎓',
        status: 'future',
      },
      {
        title: 'Build Portfolio',
        description: 'Create online presence showcasing your work',
        icon: '📱',
        status: 'future',
      },
      {
        title: 'Platform Onboarding',
        description: 'Join relevant platform and apply to opportunities',
        icon: '🌐',
        status: 'future',
      },
      {
        title: 'First Paid Work',
        description: 'Complete initial project and get first review',
        icon: '✨',
        status: 'future',
      },
    ],
    timelineMonths: isLowInternet ? '10-12 months' : '6-8 months',
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please complete onboarding.' },
        { status: 404 }
      );
    }

    // Build the AI prompt
    const systemPrompt = `You are a career counselor specializing in helping women return to education and work after life interruptions. You create personalized, realistic comeback roadmaps.

CRITICAL RULE: Adapt to internet availability.
- If internetAvailability is "none" or "low": use ONLY offline resources (community centers, radio programs, SMS courses, local government offices, in-person workshops)
- If internetAvailability is "stable": you may suggest online courses and remote work

Always be empathetic, specific, and realistic.`;

    const userPrompt = `Create a 5-step comeback roadmap for this user:

Age: ${profile.age}
Country: ${profile.country}
Education: ${profile.educationLevel}
Why they stopped: ${profile.reasonStopped}
Current skills: ${profile.skills}
Interests: ${profile.interests}
Available time: ${profile.hoursPerDay}
Internet access: ${profile.internetAvailability}
Career goal: ${profile.careerGoal}

Return a JSON object with this structure:
{
  "currentSituation": "One empathetic sentence summarizing where they're starting from",
  "steps": [
    {
      "title": "Clear step name",
      "description": "Specific, actionable description with duration/format",
      "icon": "Relevant emoji",
      "status": "current" for step 1, "future" for steps 2-5
    }
  ],
  "timelineMonths": "Realistic total duration"
}

Make every step concrete and tied to real programs or platforms.`;

    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const aiResponse = JSON.parse(result.response.text());

      // Save to database
      const roadmap = await prisma.roadmap.create({
        data: {
          userId: user.id,
          currentSituation: aiResponse.currentSituation,
          steps: aiResponse.steps,
          timelineMonths: aiResponse.timelineMonths,
        },
      });

      return NextResponse.json({
        success: true,
        roadmap,
        source: 'ai',
      });

    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      
      // Use fallback roadmap
      const fallbackData = getFallbackRoadmap(profile);
      
      const roadmap = await prisma.roadmap.create({
        data: {
          userId: user.id,
          currentSituation: fallbackData.currentSituation,
          steps: fallbackData.steps,
          timelineMonths: fallbackData.timelineMonths,
        },
      });

      return NextResponse.json({
        success: true,
        roadmap,
        source: 'fallback',
      });
    }

  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
