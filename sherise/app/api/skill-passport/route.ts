import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const skillEntrySchema = z.object({
  lifeRole: z.string(),
  mappedSkill: z.string(),
  justification: z.string(),
});

const skillPassportSchema = z.object({
  skills: z.array(skillEntrySchema),
  generatedContent: z.object({
    resumeSummary: z.string(),
    bio: z.string(),
    elevatorPitch: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validatedData = skillPassportSchema.parse(body);

    // Delete existing entries for this user to replace with new ones
    await prisma.skillPassportEntry.deleteMany({
      where: { userId: user.id },
    });

    // Create new skill passport entries
    const skillEntries = await prisma.skillPassportEntry.createMany({
      data: validatedData.skills.map((skill) => ({
        userId: user.id,
        lifeRole: skill.lifeRole,
        mappedSkill: skill.mappedSkill,
        justification: skill.justification,
      })),
    });

    // Upsert generated content
    const generatedContent = await prisma.generatedContent.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        resumeSummary: validatedData.generatedContent.resumeSummary,
        bio: validatedData.generatedContent.bio,
        elevatorPitch: validatedData.generatedContent.elevatorPitch,
      },
      update: {
        resumeSummary: validatedData.generatedContent.resumeSummary,
        bio: validatedData.generatedContent.bio,
        elevatorPitch: validatedData.generatedContent.elevatorPitch,
      },
    });

    return NextResponse.json({
      success: true,
      skillEntriesCount: skillEntries.count,
      generatedContent,
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

    console.error('Error saving skill passport:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save skill passport',
      },
      { status: 500 }
    );
  }
}
