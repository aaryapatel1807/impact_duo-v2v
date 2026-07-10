import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  userId: z.string().optional(), // If not provided, we'll create a new user
  name: z.string().min(1),
  email: z.string().email(),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Create or update user with profile
    const result = await prisma.user.upsert({
      where: { email: validatedData.email },
      update: {
        name: validatedData.name,
        profile: {
          upsert: {
            create: {
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
          },
        },
      },
      create: {
        name: validatedData.name,
        email: validatedData.email,
        profile: {
          create: {
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
        },
        progressLogs: {
          create: {
            tasksCompleted: 0,
            confidenceScore: 5,
            streakCount: 0,
            currentStepIndex: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      userId: result.id,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
      },
      profile: result.profile,
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
        error: 'Failed to save profile',
      },
      { status: 500 }
    );
  }
}
