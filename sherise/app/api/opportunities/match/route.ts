import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface MatchResult {
  eligible: OpportunityWithMatch[];
  almost: OpportunityWithMatch[];
  future: OpportunityWithMatch[];
}

interface OpportunityWithMatch {
  id: string;
  title: string;
  organization: string;
  type: string;
  description: string;
  region: string[];
  minAge: number | null;
  maxAge: number | null;
  minEducation: string[];
  tags: string[];
  url: string;
  deadline: string | null;
  matchStatus: string;
  missingCriteria: string[];
}

// Education level hierarchy (lowest to highest)
const EDUCATION_LEVELS = [
  'Primary (Grade 1-5)',
  'Middle School (Grade 6-8)', 
  'High School (Grade 9-10)',
  'Higher Secondary (Grade 11-12)',
  'Diploma/Certificate',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate'
];

function getEducationIndex(level: string): number {
  return EDUCATION_LEVELS.indexOf(level);
}

function meetsEducationRequirement(userEducation: string, requiredLevels: string[]): boolean {
  const userIndex = getEducationIndex(userEducation);
  return requiredLevels.some(required => {
    const requiredIndex = getEducationIndex(required);
    return userIndex >= requiredIndex;
  });
}

function calculateOpportunityMatch(
  opportunity: any,
  profile: any,
  currentStepIndex: number
): { status: string; missingCriteria: string[] } {
  const missingCriteria: string[] = [];
  
  // Age check
  if (opportunity.minAge && profile.age < opportunity.minAge) {
    missingCriteria.push(`Minimum age: ${opportunity.minAge}`);
  }
  if (opportunity.maxAge && profile.age > opportunity.maxAge) {
    missingCriteria.push(`Maximum age: ${opportunity.maxAge}`);
  }
  
  // Education check
  if (opportunity.minEducation.length > 0 && 
      !meetsEducationRequirement(profile.educationLevel, opportunity.minEducation)) {
    missingCriteria.push(`Education level: ${opportunity.minEducation.join(' or ')}`);
  }
  
  // Region check (simple country matching for now)
  if (opportunity.region.length > 0 && 
      !opportunity.region.some((region: string) => 
        region.toLowerCase() === profile.country.toLowerCase() ||
        region.toLowerCase() === 'global' ||
        region.toLowerCase() === 'international'
      )) {
    missingCriteria.push(`Region: ${opportunity.region.join(' or ')}`);
  }
  
  // Skills/interests matching (at least 1 tag should match)
  if (opportunity.tags.length > 0) {
    const userSkills = profile.skills.toLowerCase().split(',').map((s: string) => s.trim());
    const userInterests = profile.interests.toLowerCase().split(',').map((i: string) => i.trim());
    const userTokens = [...userSkills, ...userInterests];
    
    const hasMatchingTag = opportunity.tags.some((tag: string) => 
      userTokens.some(token => 
        token.includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(token)
      )
    );
    
    if (!hasMatchingTag) {
      missingCriteria.push(`Skills/interests: ${opportunity.tags.join(', ')}`);
    }
  }
  
  // Determine status based on missing criteria and progress
  if (missingCriteria.length === 0) {
    return { status: 'eligible', missingCriteria: [] };
  } else if (missingCriteria.length <= 2 && currentStepIndex >= 1) {
    // "Almost" eligible if only 1-2 criteria missing and user has made some progress
    return { status: 'almost', missingCriteria };
  } else {
    return { status: 'future', missingCriteria };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user profile and progress
    const [profile, progressLog] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
      }),
      prisma.progressLog.findFirst({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      })
    ]);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found. Please complete onboarding.',
        },
        { status: 404 }
      );
    }

    // Get all opportunities
    const opportunities = await prisma.opportunity.findMany();
    
    const currentStepIndex = progressLog?.currentStepIndex || 0;
    const matchResults: MatchResult = {
      eligible: [],
      almost: [],
      future: []
    };

    // Calculate matches for each opportunity
    for (const opportunity of opportunities) {
      const match = calculateOpportunityMatch(opportunity, profile, currentStepIndex);
      
      const opportunityWithMatch: OpportunityWithMatch = {
        ...opportunity,
        matchStatus: match.status,
        missingCriteria: match.missingCriteria
      };

      matchResults[match.status as keyof MatchResult].push(opportunityWithMatch);
      
      // Save/update the match in the database
      await prisma.opportunityMatch.upsert({
        where: {
          userId_opportunityId: {
            userId: user.id,
            opportunityId: opportunity.id
          }
        },
        update: {
          status: match.status,
          missingCriteria: match.missingCriteria,
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          opportunityId: opportunity.id,
          status: match.status,
          missingCriteria: match.missingCriteria
        }
      });
    }

    // Sort each category by relevance
    matchResults.eligible.sort((a, b) => {
      // Prioritize by deadline proximity and type
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return a.type === 'scholarship' ? -1 : 1;
    });

    matchResults.almost.sort((a, b) => a.missingCriteria.length - b.missingCriteria.length);

    return NextResponse.json({
      success: true,
      matches: matchResults,
      summary: {
        eligible: matchResults.eligible.length,
        almost: matchResults.almost.length,
        future: matchResults.future.length,
        total: opportunities.length
      },
      userProgress: {
        currentStepIndex,
        streakCount: progressLog?.streakCount || 0
      }
    });

  } catch (error) {
    console.error('Error matching opportunities:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to match opportunities',
      },
      { status: 500 }
    );
  }
}