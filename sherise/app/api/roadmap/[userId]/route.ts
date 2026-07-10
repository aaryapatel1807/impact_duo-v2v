import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get the most recent roadmap for this user
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!roadmap) {
      return NextResponse.json({
        success: true,
        roadmap: null,
      });
    }

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roadmap',
      },
      { status: 500 }
    );
  }
}
