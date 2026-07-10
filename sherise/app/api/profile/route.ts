import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const profileSchema = z.object({
  age: z.coerce.number().int().positive(),
  country: z.string().min(1),
  educationLevel: z.string().min(1),
  reasonStopped: z.string().min(1),
  skills: z.string().min(1),
  interests: z.string().min(1),
  hoursPerDay: z.string().min(1),
  internetAvailability: z.enum(['none', 'low', 'stable']),
  careerGoal: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Get authenticated user from Clerk
    const user = await requireAuth();

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Create or update profile for authenticated user
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        age: validatedData.age,
        country: validatedData.country,
        educationLevel: validatedData.educationLevel,
        reasonStopped: validatedData.reasonStopped,
        skills: validatedData.skills,
        interests: validatedData.interests,
        hoursPerDay: validatedData.hoursPerDay,
        internetAvailability: validatedData.internetAvailability,
        careerGoal: validatedData.careerGoal,
      },
      update: {
        age: validatedData.age,
        country: validatedData.country,
        educationLevel: validatedData.educationLevel,
        reasonStopped: validatedData.reasonStopped,
        skills: validatedData.skills,
        interests: validatedData.interests,
        hoursPerDay: validatedData.hoursPerDay,
        internetAvailability: validatedData.internetAvailability,
        careerGoal: validatedData.careerGoal,
      },
    });

    // Initialize progress log if it doesn't exist
    const existingProgress = await prisma.progressLog.findFirst({
      where: { userId: user.id },
    });

    if (!existingProgress) {
      await prisma.progressLog.create({
        data: {
          userId: user.id,
          tasksCompleted: 0,
          confidenceScore: 5,
          streakCount: 0,
          currentStepIndex: 0,
          xpEarned: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error saving profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save profile',
      },
      { status: 500 }
    );
  }
}
