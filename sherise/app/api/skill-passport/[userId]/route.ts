import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const [skillEntries, generatedContent] = await Promise.all([
      prisma.skillPassportEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.generatedContent.findUnique({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      skillEntries,
      generatedContent,
    });
  } catch (error) {
    console.error('Error fetching skill passport:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch skill passport',
      },
      { status: 500 }
    );
  }
}
