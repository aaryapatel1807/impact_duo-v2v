import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { meetsEducationRequirement } from '../lib/education';

const router = Router();

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

// Education hierarchy + requirement check live in ../lib/education — the one
// canonical vocabulary shared with the profile schema and the seed data.

// Split free text into a set of whole words, so tag matching works on word
// boundaries instead of substrings (previously "ai" matched "tailoring", and
// an empty token from a trailing comma matched every tag).
function wordSet(text: string): Set<string> {
  return new Set(
    text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  );
}

function tagMatchesUser(tag: string, userWords: Set<string>): boolean {
  const tagWords = tag.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return tagWords.length > 0 && tagWords.every((word) => userWords.has(word));
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

  // Skills/interests matching (at least 1 tag should match, on whole words)
  if (opportunity.tags.length > 0) {
    const userWords = wordSet(`${profile.skills}, ${profile.interests}`);

    const hasMatchingTag = opportunity.tags.some((tag: string) =>
      tagMatchesUser(tag, userWords)
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

// GET /api/opportunities
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany();

    return res.json({
      success: true,
      opportunities,
      total: opportunities.length
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities',
    });
  }
});

// POST /api/opportunities/match
router.post('/match', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Get user profile and progress
    const [profile, progressLog] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: req.user!.id },
      }),
      prisma.progressLog.findFirst({
        where: { userId: req.user!.id },
        orderBy: { date: 'desc' },
      })
    ]);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please complete onboarding.',
      });
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
    const matchUpserts = [];
    for (const opportunity of opportunities) {
      const match = calculateOpportunityMatch(opportunity, profile, currentStepIndex);

      const opportunityWithMatch: OpportunityWithMatch = {
        ...opportunity,
        matchStatus: match.status,
        missingCriteria: match.missingCriteria
      };

      matchResults[match.status as keyof MatchResult].push(opportunityWithMatch);

      matchUpserts.push(prisma.opportunityMatch.upsert({
        where: {
          userId_opportunityId: {
            userId: req.user!.id,
            opportunityId: opportunity.id
          }
        },
        update: {
          status: match.status,
          missingCriteria: match.missingCriteria,
          updatedAt: new Date()
        },
        create: {
          userId: req.user!.id,
          opportunityId: opportunity.id,
          status: match.status,
          missingCriteria: match.missingCriteria
        }
      }));
    }

    // Persist all matches atomically (previously a sequential await per
    // opportunity left partial match state behind on any mid-loop failure)
    if (matchUpserts.length > 0) {
      await prisma.$transaction(matchUpserts);
    }

    // Sort eligible by deadline proximity. Deadlines are free text in the
    // data ('Ongoing', 'March 2026', ...), so unparseable/missing deadlines
    // sort last instead of producing NaN comparisons; ties break on type
    // (scholarships first) then title, keeping the order total and stable.
    const deadlineTime = (o: OpportunityWithMatch): number => {
      const t = o.deadline ? Date.parse(o.deadline) : Number.NaN;
      return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
    };
    matchResults.eligible.sort((a, b) => {
      const byDeadline = deadlineTime(a) - deadlineTime(b);
      if (byDeadline !== 0) return byDeadline;
      const byType = (a.type === 'scholarship' ? 0 : 1) - (b.type === 'scholarship' ? 0 : 1);
      if (byType !== 0) return byType;
      return a.title.localeCompare(b.title);
    });

    matchResults.almost.sort((a, b) => a.missingCriteria.length - b.missingCriteria.length);

    return res.json({
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
    return res.status(500).json({
      success: false,
      error: 'Failed to match opportunities',
    });
  }
});

export default router;
