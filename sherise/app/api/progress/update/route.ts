import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateProgressSchema = z.object({
  userId: z.string().cuid(),
  tasksCompleted: z.number().int().min(0).optional(),
  confidenceScore: z.number().int().min(1).max(10).optional(),
  currentStepIndex: z.number().int().min(0).max(4).optional(), // 5 steps (0-4)
  completedAction: z.enum(['daily_task', 'roadmap_step', 'skill_practice', 'opportunity_apply']).optional(),
});

function calculateStreakCount(previousLogs: any[], newLogDate: Date): number {
  if (previousLogs.length === 0) {
    return 1; // First day
  }
  
  // Sort by date descending
  previousLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Check if the last log was yesterday
  const yesterday = new Date(newLogDate);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const lastLogDate = new Date(previousLogs[0].date);
  lastLogDate.setHours(0, 0, 0, 0);
  
  if (lastLogDate.getTime() === yesterday.getTime()) {
    // Continuing streak
    return (previousLogs[0].streakCount || 0) + 1;
  } else {
    // Check if logging for same day (update, not new streak)
    const todayDate = new Date(newLogDate);
    todayDate.setHours(0, 0, 0, 0);
    
    if (lastLogDate.getTime() === todayDate.getTime()) {
      // Same day update, keep current streak
      return previousLogs[0].streakCount || 1;
    } else {
      // Streak broken, start fresh
      return 1;
    }
  }
}

function getMotivationalMessage(
  streakCount: number,
  stepIndex: number,
  completedAction?: 'daily_task' | 'roadmap_step' | 'skill_practice' | 'opportunity_apply'
): string {
  const messages = {
    daily_task: [
      "Great job completing your daily task! 🎯",
      "Daily consistency is building your comeback! ⭐",
      "One task at a time, you're making progress! 💪"
    ],
    roadmap_step: [
      "Milestone unlocked! You're one step closer to your goal! 🎉",
      "Amazing progress on your roadmap! Keep pushing forward! 🚀",
      "You've conquered another step! Your comeback is real! 👑"
    ],
    skill_practice: [
      "Skill-building time well spent! 📚",
      "Every practice session makes you stronger! 💎",
      "Your skills are growing - keep it up! ⚡"
    ],
    opportunity_apply: [
      "Application submitted! You're taking action! 🎯",
      "Great job putting yourself out there! 🌟",
      "Every application is a step toward opportunity! 📨"
    ]
  };

  const streakMessages = [
    `${streakCount} day streak! You're on fire! 🔥`,
    `${streakCount} days strong! Nothing can stop you! 💪`,
    `${streakCount} day momentum! Keep the energy flowing! ⚡`,
  ];

  if (streakCount >= 7) {
    return `🏆 INCREDIBLE! ${streakCount} day streak! You're unstoppable!`;
  } else if (streakCount >= 3) {
    return streakMessages[Math.floor(Math.random() * streakMessages.length)];
  } else if (completedAction && messages[completedAction]) {
    const actionMessages = messages[completedAction];
    return actionMessages[Math.floor(Math.random() * actionMessages.length)];
  } else {
    return "Progress logged! Every step counts! 🌟";
  }
}

function generateTodaysTasks(currentStepIndex: number, profile?: any): string[] {
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

  // Combine base tasks with step-specific ones
  const stepTasks = stepSpecificTasks[currentStepIndex] || stepSpecificTasks[0];
  const selectedTasks = [...baseTasks];
  
  // Add 2 random step-specific tasks
  const shuffled = stepTasks.sort(() => 0.5 - Math.random());
  selectedTasks.push(...shuffled.slice(0, 2));
  
  return selectedTasks;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tasksCompleted, confidenceScore, currentStepIndex, completedAction } = 
      updateProgressSchema.parse(body);

    // Get user profile for personalized tasks
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      );
    }

    // Get previous progress logs for streak calculation
    const previousLogs = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 days for streak calculation
    });

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Check if there's already a log for today
    const todayLog = previousLogs.find(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const newStreakCount = calculateStreakCount(previousLogs, now);
    const newStepIndex = currentStepIndex ?? (todayLog?.currentStepIndex || 0);
    
    // Determine if user advanced a step (for special celebration)
    const stepAdvanced = todayLog && currentStepIndex !== undefined && 
                         currentStepIndex > todayLog.currentStepIndex;

    if (todayLog) {
      // Update existing log for today
      const updatedLog = await prisma.progressLog.update({
        where: { id: todayLog.id },
        data: {
          tasksCompleted: tasksCompleted ?? todayLog.tasksCompleted,
          confidenceScore: confidenceScore ?? todayLog.confidenceScore,
          streakCount: newStreakCount,
          currentStepIndex: newStepIndex,
        }
      });

      const message = getMotivationalMessage(newStreakCount, newStepIndex, completedAction);
      const todaysTasks = generateTodaysTasks(newStepIndex, profile);

      return NextResponse.json({
        success: true,
        progress: updatedLog,
        updated: true,
        message: stepAdvanced ? 
          `🎉 STEP COMPLETED! ${message}` : message,
        todaysTasks,
        nextMilestone: newStepIndex < 4 ? 
          `Complete Step ${newStepIndex + 1} of your roadmap` : 
          "You're ready to launch your comeback!"
      });
    } else {
      // Create new log for today
      const newLog = await prisma.progressLog.create({
        data: {
          userId,
          tasksCompleted: tasksCompleted || 0,
          confidenceScore: confidenceScore || 5,
          streakCount: newStreakCount,
          currentStepIndex: newStepIndex,
        }
      });

      const message = getMotivationalMessage(newStreakCount, newStepIndex, completedAction);
      const todaysTasks = generateTodaysTasks(newStepIndex, profile);

      return NextResponse.json({
        success: true,
        progress: newLog,
        updated: false,
        message: stepAdvanced ? 
          `🎉 STEP COMPLETED! ${message}` : message,
        todaysTasks,
        nextMilestone: newStepIndex < 4 ? 
          `Complete Step ${newStepIndex + 1} of your roadmap` : 
          "You're ready to launch your comeback!"
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error updating progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update progress',
      },
      { status: 500 }
    );
  }
}