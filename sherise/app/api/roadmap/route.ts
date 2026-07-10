import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const roadmapStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  status: z.enum(['completed', 'current', 'future']),
});

const roadmapSchema = z.object({
  userId: z.string(),
  currentSituation: z.string(),
  steps: z.array(roadmapStepSchema),
  timelineMonths: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = roadmapSchema.parse(body);

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: validatedData.userId,
        currentSituation: validatedData.currentSituation,
        steps: validatedData.steps,
        timelineMonths: validatedData.timelineMonths,
      },
    });

    return NextResponse.json({
      success: true,
      roadmap,
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

    console.error('Error saving roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save roadmap',
      },
      { status: 500 }
    );
  }
}
