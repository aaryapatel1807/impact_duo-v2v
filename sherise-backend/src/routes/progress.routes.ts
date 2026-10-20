import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function getUpcomingDeadlines(opportunities: any[]): Array<{ title: string, organization: string, deadline: string, daysLeft: number }> {
  const now = new Date();
  const upcoming = opportunities
    .filter(opp => opp.deadline)
    .map(opp => {
      const deadlineTime = Date.parse(opp.deadline);
      const daysLeft = Number.isNaN(deadlineTime)
        ? Number.NaN
        : Math.ceil((deadlineTime - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        title: opp.title,
        organization: opp.organization,
        deadline: opp.deadline,
        daysLeft
      };
    })
    .filter(item => !Number.isNaN(item.daysLeft) && item.daysLeft > 0 && item.daysLeft <= 30) // Next 30 days
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5); // Top 5 most urgent

  return upcoming;
}

function generateWeeklyInsight(progressLogs: any[], currentStreak: number): string {
  const insights = [
    `Your ${currentStreak}-day streak shows real commitment! 💪`,
    `Consistency is your superpower - keep building momentum! ⚡`,
    `Every day you show up, you're rewriting your story! 📖`,
    `Your dedication this week is inspiring! 🌟`,
    `Small daily actions = big life changes! 🎯`,
  ];

  if (currentStreak >= 7) {
    return `🏆 WOW! ${currentStreak} days straight! You're in beast mode!`;
  } else if (currentStreak >= 3) {
    return insights[Math.floor(Math.random() * insights.length)];
  } else if (progressLogs.length === 0) {
    return "Ready to start your comeback journey? Let's make today count! 🚀";
  } else {
    return "Welcome back! Every fresh start is a new opportunity! 💎";
  }
}

function getProgressAnalytics(progressLogs: any[]) {
  if (progressLogs.length === 0) {
    return {
      averageConfidence: 5,
      totalTasks: 0,
      activeWeeks: 0,
      improvementTrend: 'starting'
    };
  }

  const totalTasks = progressLogs.reduce((sum, log) => sum + (log.tasksCompleted || 0), 0);
  // confidenceScore is a non-null column; a stored 0 is a real value and must
  // not be replaced by the default (the old `|| 5` rewrote honest 0s into 5s).
  const averageConfidence = progressLogs.reduce((sum, log) => sum + log.confidenceScore, 0) / progressLogs.length;

  // Count weeks with at least one log
  const weeklyLogs = new Set();
  progressLogs.forEach(log => {
    const week = Math.floor(log.date.getTime() / (1000 * 60 * 60 * 24 * 7));
    weeklyLogs.add(week);
  });

  // Determine trend (last 7 days vs previous 7 days)
  const now = new Date();
  const last7Days = progressLogs.filter(log => {
    const daysDiff = (now.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });
  const previous7Days = progressLogs.filter(log => {
    const daysDiff = (now.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 7 && daysDiff <= 14;
  });

  let improvementTrend = 'stable';
  if (last7Days.length > 0 && previous7Days.length > 0) {
    const recentAvg = last7Days.reduce((sum, log) => sum + log.confidenceScore, 0) / last7Days.length;
    const previousAvg = previous7Days.reduce((sum, log) => sum + log.confidenceScore, 0) / previous7Days.length;

    if (recentAvg > previousAvg + 0.5) improvementTrend = 'improving';
    else if (recentAvg < previousAvg - 0.5) improvementTrend = 'declining';
  }

  return {
    averageConfidence: Math.round(averageConfidence * 10) / 10,
    totalTasks,
    activeWeeks: weeklyLogs.size,
    improvementTrend
  };
}

function generateTodaysTasks(stepIndex: number): string[] {
  const baseTasks = [
    "Review your roadmap and visualize your next step",
    "Practice a skill from your Skill Passport for 15 minutes",
    "Research one new opportunity that matches your goals"
  ];

  const stepSpecificTasks = [
    // Step 0 tasks
    [
      "Complete any missing government registrations or documents",
      "Connect with local community center or women's group",
      "Ask 3 people about opportunities in your area"
    ],
    // Step 1 tasks
    [
      "Find and visit your nearest skill development center",
      "Identify 2 offline courses or training programs nearby",
      "Talk to someone who has successfully restarted their career"
    ],
    // Step 2 tasks
    [
      "Apply to one scholarship or training program",
      "Update your skill portfolio with recent practice",
      "Network with 2 new professionals in your field of interest"
    ],
    // Step 3 tasks
    [
      "Submit applications to 2 relevant opportunities",
      "Schedule informational interviews with industry contacts",
      "Practice your elevator pitch with friends or family"
    ],
    // Step 4 tasks
    [
      "Follow up on pending applications",
      "Prepare for upcoming interviews or assessments",
      "Plan your first month in your new role/opportunity"
    ]
  ];

  const stepTasks = stepSpecificTasks[stepIndex] || stepSpecificTasks[0];
  const selectedTasks = [...baseTasks];

  // Add 2 random step-specific tasks (copy first: never mutate the shared array)
  const shuffled = [...stepTasks].sort(() => 0.5 - Math.random());
  selectedTasks.push(...shuffled.slice(0, 2));

  return selectedTasks;
}

// Derive the user's current roadmap step from the roadmap itself — never from
// a client-supplied number. The step marked 'current' wins; otherwise the
// first not-yet-completed step; otherwise the last known value.
function deriveStepState(roadmap: any, fallbackStepIndex: number): { currentStepIndex: number; completedSteps: number; totalSteps: number } {
  const steps = Array.isArray(roadmap?.steps) ? roadmap.steps : null;
  if (!steps || steps.length === 0) {
    return { currentStepIndex: fallbackStepIndex, completedSteps: 0, totalSteps: 0 };
  }

  const completedSteps = steps.filter((s: any) => s?.status === 'completed').length;
  const currentIdx = steps.findIndex((s: any) => s?.status === 'current');
  const currentStepIndex = currentIdx >= 0 ? currentIdx : Math.min(completedSteps, steps.length - 1);

  return { currentStepIndex, completedSteps, totalSteps: steps.length };
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// GET /api/progress
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Get comprehensive user data
    const [progressLogs, profile, roadmap, opportunityMatches] = await Promise.all([
      prisma.progressLog.findMany({
        where: { userId: req.user!.id },
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days
      }),
      prisma.profile.findUnique({
        where: { userId: req.user!.id }
      }),
      prisma.roadmap.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunityMatch.findMany({
        where: {
          userId: req.user!.id,
          status: { in: ['eligible', 'almost'] }
        },
        include: {
          opportunity: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const currentProgress = progressLogs[0] || null;
    const currentStreak = currentProgress?.streakCount ?? 0;
    const currentStepIndex = currentProgress?.currentStepIndex ?? 0;

    const todaysTasks = generateTodaysTasks(currentStepIndex);
    const eligibleOpportunities = opportunityMatches.filter((match: any) => match.status === 'eligible').map((match: any) => match.opportunity);
    const upcomingDeadlines = getUpcomingDeadlines(eligibleOpportunities);
    const analytics = getProgressAnalytics(progressLogs);
    const weeklyInsight = generateWeeklyInsight(progressLogs, currentStreak);

    // Roadmap progress calculation (uses the roadmap's real step count)
    const stepState = deriveStepState(roadmap, currentStepIndex);
    const totalSteps = stepState.totalSteps > 0 ? stepState.totalSteps : 5;
    const roadmapProgress = roadmap ? {
      currentStep: currentStepIndex,
      totalSteps,
      progressPercentage: Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)),
      currentStepTitle: roadmap.steps ? (roadmap.steps as any[])[currentStepIndex]?.title : `Step ${currentStepIndex + 1}`,
      nextMilestone: currentStepIndex < totalSteps - 1 ?
        `Complete Step ${currentStepIndex + 1}` :
        "Launch your comeback!"
    } : null;

    return res.json({
      success: true,
      progress: currentProgress,
      dashboard: {
        // Core stats for header
        currentStreak,
        confidenceScore: currentProgress?.confidenceScore ?? 5,
        tasksCompletedToday: currentProgress?.tasksCompleted || 0,

        // Today's focus
        todaysTasks,
        weeklyInsight,

        // Roadmap progress
        roadmapProgress,

        // Opportunities
        eligibleCount: eligibleOpportunities.length,
        upcomingDeadlines,

        // Analytics
        analytics,

        // Progress history (for charts) — copy before reversing (was mutating the fetched array)
        progressHistory: [...progressLogs].reverse(), // Chronological order for charts

        // Motivation
        nextMilestone: currentStepIndex < totalSteps - 1 ?
          `Complete Step ${currentStepIndex + 1} of your roadmap` :
          "You're ready to launch your comeback!",
        celebrateStreak: currentStreak >= 3,
        encouragement: currentStreak === 0 ?
          "Every expert was once a beginner. Today is your fresh start! 🌟" :
          currentStreak >= 7 ?
          `${currentStreak} days of pure dedication! You're unstoppable! 🔥` :
          `${currentStreak} day streak - momentum is building! 💪`
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
});

// GET /api/progress/:userId — owner only (was an IDOR: any signed-in user
// could read anyone's progress history)
router.get('/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - you can only access your own progress',
      });
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30
    });

    return res.json({
      success: true,
      progressLogs,
      total: progressLogs.length
    });
  } catch (error) {
    console.error('Error fetching progress logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch progress logs',
    });
  }
});

const progressUpdateSchema = z.object({
  tasksCompleted: z.coerce.number().int().min(0).max(1000).optional(),
  confidenceScore: z.coerce.number().int().min(0).max(10).optional(),
  // Accepted for backward compatibility with existing clients, but NEVER
  // trusted: the step index is derived server-side from the roadmap.
  currentStepIndex: z.coerce.number().int().min(0).max(100).optional(),
});

// POST /api/progress/update — one log per user per day; streak and step index
// are computed on the server (previously streakCount was hardcoded to 0 and
// currentStepIndex was copied verbatim from the request body).
router.post('/update', requireAuth, async (req: AuthRequest, res) => {
  try {
    const validated = progressUpdateSchema.parse(req.body ?? {});
    const userId = req.user!.id;
    const now = new Date();
    const todayStart = startOfUtcDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [todaysLog, latestLog, roadmap] = await Promise.all([
      prisma.progressLog.findFirst({
        where: { userId, date: { gte: todayStart, lt: tomorrowStart } },
        orderBy: { date: 'desc' },
      }),
      prisma.progressLog.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.roadmap.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const stepState = deriveStepState(roadmap, latestLog?.currentStepIndex ?? 0);
    const tasksCompleted = validated.tasksCompleted ?? todaysLog?.tasksCompleted ?? 0;
    const confidenceScore = validated.confidenceScore ?? todaysLog?.confidenceScore ?? 5;
    const xpEarned = tasksCompleted * 10;

    let progressLog;
    if (todaysLog) {
      // Same-day update: refresh the numbers, keep the streak for today.
      progressLog = await prisma.progressLog.update({
        where: { id: todaysLog.id },
        data: {
          tasksCompleted,
          confidenceScore,
          currentStepIndex: stepState.currentStepIndex,
          xpEarned,
        },
      });
    } else {
      // New day: streak continues only if the previous log was yesterday.
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const previousWasYesterday = latestLog
        ? latestLog.date >= yesterdayStart && latestLog.date < todayStart
        : false;
      const streakCount = previousWasYesterday ? (latestLog!.streakCount ?? 0) + 1 : 1;

      progressLog = await prisma.progressLog.create({
        data: {
          userId,
          date: now,
          tasksCompleted,
          confidenceScore,
          currentStepIndex: stepState.currentStepIndex,
          streakCount,
          xpEarned,
        },
      });
    }

    // Keep the roadmap's own progress fields in sync (they were write-only
    // dead fields stuck at 0 before this).
    if (roadmap && stepState.totalSteps > 0) {
      await prisma.roadmap.update({
        where: { id: roadmap.id },
        data: {
          currentStep: stepState.currentStepIndex,
          completionPercent: Math.round((stepState.completedSteps / stepState.totalSteps) * 100),
        },
      });
    }

    return res.json({
      success: true,
      progressLog
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Error updating progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update progress',
    });
  }
});

export default router;
