import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const [skillEntries, generatedContent] = await Promise.all([
      prisma.skillPassportEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.generatedContent.findUnique({
        where: { userId },
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
        error: 'Failed to fetch skill passport',
      },
      { status: 500 }
    );
  }
}
