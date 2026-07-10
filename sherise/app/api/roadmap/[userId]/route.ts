import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get the most recent roadmap for this user
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
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
        error: error instanceof Error ? error.message : 'Failed to fetch roadmap',
      },
      { status: 500 }
    );
  }
}
