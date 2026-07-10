import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const generateSkillPassportSchema = z.object({
  userId: z.string(),
  selectedRoles: z.array(z.string()),
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Life role to professional skill mapping (always reliable)
const lifeRoleMapping: Record<string, { skill: string; justification: string }> = {
  homemaker: {
    skill: 'Budget & Cash Flow Management',
    justification: 'Managing household expenses requires tracking income, prioritizing needs, and planning for irregular costs — the same skills financial analysts use.',
  },
  caregiver: {
    skill: 'Crisis Management & Problem-Solving',
    justification: 'Responding to urgent needs, staying calm under pressure, and making quick decisions are core leadership competencies.',
  },
  cook: {
    skill: 'Operations & Resource Planning',
    justification: 'Coordinating multiple dishes, timing, and ingredient prep is operations management — used in restaurants, catering, and supply chains.',
  },
  tutor: {
    skill: 'Communication & Instructional Design',
    justification: 'Breaking complex ideas into simple steps and adapting to different learning styles is what professional educators and trainers do.',
  },
  tailor: {
    skill: 'Entrepreneurship & Production Management',
    justification: 'Taking orders, managing materials, meeting deadlines, and pricing work are small business operations — the foundation of entrepreneurship.',
  },
  organizer: {
    skill: 'Stakeholder Coordination & Networking',
    justification: 'Bringing people together, building consensus, and managing group activities are key project management and leadership skills.',
  },
};

// Fallback generated content
function getFallbackContent(skills: string[], careerGoal: string) {
  return {
    resumeSummary: `Resourceful professional with hands-on experience in ${skills.slice(0, 2).join(' and ').toLowerCase()}. Proven track record of managing complex responsibilities while maintaining quality and efficiency. Strong problem-solving abilities developed through real-world application. Seeking opportunities to apply practical skills in a professional setting and contribute to organizational growth.`,
    bio: `I'm a dedicated professional who has built valuable expertise through real-world experience. My background has taught me ${skills[0]?.toLowerCase()}, effective communication, and adaptability. I'm now looking to transition these skills into formal career opportunities where I can grow and make an impact in ${careerGoal.toLowerCase()}.`,
    pitch: `I've spent years managing responsibilities, solving problems, and delivering results in practical settings. I bring experience in ${skills[0]?.toLowerCase()} and a proven ability to learn quickly and adapt. I'm ready to bring that same dedication and skill to your team.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, selectedRoles } = generateSkillPassportSchema.parse(body);

    // Fetch user profile for career goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { success: false, error: 'User or profile not found' },
        { status: 404 }
      );
    }

    // Map selected roles to skills using the reliable mapping
    const mappedSkills = selectedRoles
      .map(roleId => {
        const mapping = lifeRoleMapping[roleId];
        if (!mapping) return null;
        
        return {
          lifeRole: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          mappedSkill: mapping.skill,
          justification: mapping.justification,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (mappedSkills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid roles selected' },
        { status: 400 }
      );
    }

    const skillNames = mappedSkills.map(s => s.mappedSkill);
    const careerGoal = user.profile.careerGoal;

    // Generate professional content using AI
    let generatedContent;

    try {
      const systemPrompt = `You are a professional resume writer specializing in helping women translate life experience into professional language. Write with confidence and specificity — these skills are real and valuable.`;

      const userPrompt = `A woman has these professional skills: ${skillNames.join(', ')}
Her career goal is: ${careerGoal}

Generate three pieces of content in JSON format:
{
  "resumeSummary": "A 50-80 word resume summary paragraph. Third person, professional tone, emphasizing practical experience and transferable skills.",
  "bio": "An 80-100 word LinkedIn-style bio. First person, warm but professional. Tell a brief story of her experience and what she brings.",
  "pitch": "A 30-second elevator pitch as if she's speaking to an interviewer. Confident, specific, and personal."
}

Make each piece specific to HER skills and goal — no generic filler.`;

      // Call Gemini API
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      generatedContent = JSON.parse(result.response.text());

    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      generatedContent = getFallbackContent(skillNames, careerGoal);
    }

    // Save skill entries to database
    await prisma.skillPassportEntry.deleteMany({ where: { userId } });
    
    await prisma.skillPassportEntry.createMany({
      data: mappedSkills.map(skill => ({
        userId,
        lifeRole: skill.lifeRole,
        mappedSkill: skill.mappedSkill,
        justification: skill.justification,
      })),
    });

    // Save generated content
    const savedContent = await prisma.generatedContent.upsert({
      where: { userId },
      create: {
        userId,
        resumeSummary: generatedContent.resumeSummary,
        bio: generatedContent.bio,
        elevatorPitch: generatedContent.pitch || generatedContent.elevatorPitch,
      },
      update: {
        resumeSummary: generatedContent.resumeSummary,
        bio: generatedContent.bio,
        elevatorPitch: generatedContent.pitch || generatedContent.elevatorPitch,
      },
    });

    return NextResponse.json({
      success: true,
      skillEntries: mappedSkills,
      generatedContent: savedContent,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error generating skill passport:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate skill passport' },
      { status: 500 }
    );
  }
}
