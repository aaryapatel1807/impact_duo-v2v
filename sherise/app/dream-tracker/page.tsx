"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ensureUserProfile,
  getStoredUserId,
  isOnboardingComplete,
  type OnboardingStorage,
} from "@/lib/profile-client";

interface DashboardData {
  currentStreak: number;
  confidenceScore: number;
  tasksCompletedToday: number;
  todaysTasks: string[];
  weeklyInsight: string;
  roadmapProgress?: {
    currentStep: number;
    totalSteps: number;
    progressPercentage: number;
    currentStepTitle: string;
    nextMilestone: string;
  };
  eligibleCount: number;
  upcomingDeadlines: Array<{
    title: string;
    organization: string;
    deadline: string;
    daysLeft: number;
  }>;
  analytics: {
    averageConfidence: number;
    totalTasks: number;
    activeWeeks: number;
    improvementTrend: string;
  };
  encouragement: string;
  celebrateStreak: boolean;
}

export default function DreamTracker() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState(5);
  const [completedTasks, setCompletedTasks] = useState(0);

  const loadDashboardData = async () => {
    try {
      let userId = getStoredUserId();
      if (!userId) {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          router.push("/onboarding");
          return;
        }

        const parsed = JSON.parse(userData) as OnboardingStorage;
        if (!isOnboardingComplete(parsed)) {
          router.push("/onboarding");
          return;
        }

        userId = await ensureUserProfile(parsed);
      }

      // Fetch dashboard data from real API
      const response = await fetch(`/api/progress/${userId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      
      if (data.success && data.dashboard) {
        setDashboardData(data.dashboard);
        setConfidenceScore(data.dashboard.confidenceScore);
        setCompletedTasks(data.dashboard.tasksCompletedToday);
      } else {
        // Fallback to mock data
        createMockDashboard();
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to mock data
      createMockDashboard();
    } finally {
      setLoading(false);
    }
  };
  const createMockDashboard = () => {
    const mockData: DashboardData = {
      currentStreak: 0,
      confidenceScore: 5,
      tasksCompletedToday: 0,
      todaysTasks: [
        "Review your roadmap and visualize your next step",
        "Practice a skill from your Skill Passport for 15 minutes", 
        "Complete any missing government registrations or documents",
        "Connect with local community center or women's group"
      ],
      weeklyInsight: "Ready to start your comeback journey? Let's make today count! 🚀",
      roadmapProgress: {
        currentStep: 0,
        totalSteps: 5,
        progressPercentage: 0,
        currentStepTitle: "Step 1: Build Foundation",
        nextMilestone: "Complete Step 1 of your roadmap"
      },
      eligibleCount: 0,
      upcomingDeadlines: [],
      analytics: {
        averageConfidence: 5.0,
        totalTasks: 0,
        activeWeeks: 0,
        improvementTrend: "starting"
      },
      encouragement: "Every expert was once a beginner. Today is your fresh start! 🌟",
      celebrateStreak: false
    };
    setDashboardData(mockData);
  };
  const updateProgress = async (newConfidence?: number, tasksCompleted?: number, action?: string) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tasksCompleted: tasksCompleted ?? completedTasks,
          confidenceScore: newConfidence ?? confidenceScore,
          completedAction: action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh dashboard data
          await loadDashboardData();
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleConfidenceChange = async (value: number) => {
    setConfidenceScore(value);
    await updateProgress(value, undefined, "daily_task");
  };

  const markTaskComplete = async () => {
    const newCount = completedTasks + 1;
    setCompletedTasks(newCount);
    await updateProgress(undefined, newCount, "daily_task");
  };

  useEffect(() => {
    loadDashboardData();
  }, [router]);
  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-body text-lg text-text-muted">
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-2xl font-medium text-text mb-2">
            Dream Tracker
          </h1>
          <p className="font-body text-base text-text-muted">
            Your progress, visualized. Keep going — every step counts.
          </p>
          
          {/* Weekly Insight */}
          {dashboardData.weeklyInsight && (
            <motion.div
              className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-2xl border border-primary/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-body text-base text-primary font-medium">
                {dashboardData.weeklyInsight}
              </p>
            </motion.div>
          )}
        </motion.div>
        {/* Top row: Streak and Overall Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Streak Counter */}
          <motion.div
            className={`clay-card p-8 text-center ${
              dashboardData.celebrateStreak
                ? "bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 ring-2 ring-accent-gold/30"
                : "bg-gradient-to-br from-accent-gold/10 to-accent-gold/5"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-6xl mb-4">🔥</div>
            <div className="font-mono text-5xl font-bold text-accent-gold mb-2">
              {dashboardData.currentStreak}
            </div>
            <p className="font-body text-base text-text-muted">
              {dashboardData.currentStreak === 1 ? "Day Started!" : "Day Streak — Keep it going!"}
            </p>
            {dashboardData.celebrateStreak && (
              <motion.p
                className="text-sm font-body font-medium text-accent-gold mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                🎉 On fire!
              </motion.p>
            )}
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            className="clay-card p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-body text-lg font-semibold text-text mb-4">
              Roadmap Progress
            </h3>
            {dashboardData.roadmapProgress ? (
              <>
                <div className="relative w-full h-6 bg-border rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-light rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.roadmapProgress.progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-2xl font-bold text-primary">
                    {dashboardData.roadmapProgress.progressPercentage}%
                  </span>
                  <span className="text-sm text-text-muted">
                    {dashboardData.roadmapProgress.currentStepTitle}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-text-muted">Complete your roadmap to track progress</p>
            )}
          </motion.div>
        </div>
        {/* Today's Tasks */}
        <motion.div
          className="clay-card p-8 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-body text-lg font-semibold text-primary">
              Today's Focused Tasks
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="font-mono text-lg font-bold text-primary">
                {dashboardData.tasksCompletedToday}/{dashboardData.todaysTasks.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {dashboardData.todaysTasks.map((task, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  index < dashboardData.tasksCompletedToday
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-bg border-border text-text"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    index < dashboardData.tasksCompletedToday
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}>
                    {index < dashboardData.tasksCompletedToday && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="font-body text-base leading-relaxed flex-grow">
                    {task}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {dashboardData.tasksCompletedToday < dashboardData.todaysTasks.length && (
            <button
              onClick={markTaskComplete}
              className="mt-4 px-5 py-2 bg-primary/10 text-primary rounded-lg font-body font-medium text-sm hover:bg-primary/20 transition-colors"
            >
              Mark Next Task Complete
            </button>
          )}
        </motion.div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Opportunities Ready */}
          <motion.div
            className="clay-card p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <div className="font-mono text-3xl font-bold text-text mb-1">
              {dashboardData.eligibleCount}
            </div>
            <p className="text-sm text-text-muted">Opportunities Ready</p>
          </motion.div>

          {/* Total Tasks */}
          <motion.div
            className="clay-card p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="text-3xl mb-3">📚</div>
            <div className="font-mono text-3xl font-bold text-text mb-1">
              {dashboardData.analytics.totalTasks}
            </div>
            <p className="text-sm text-text-muted">Tasks Completed</p>
          </motion.div>

          {/* Confidence Score */}
          <motion.div
            className="clay-card p-6 md:col-span-2 lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-3xl mb-2">💪</div>
                <h3 className="font-body text-base font-semibold text-text mb-1">
                  Today's Confidence
                </h3>
              </div>
              <span className="font-mono text-2xl font-bold text-primary">
                {confidenceScore}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={confidenceScore}
              onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </motion.div>
        </div>
        {/* Upcoming Deadlines */}
        <motion.div
          className="clay-card p-8 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="font-body text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Upcoming Deadlines
          </h3>
          {dashboardData.upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingDeadlines.map((deadline, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 bg-bg rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div>
                    <span className="font-body text-base text-text font-medium">
                      {deadline.title}
                    </span>
                    <p className="text-sm text-text-muted">
                      {deadline.organization}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold ${
                      deadline.daysLeft <= 7 ? "text-red-500" : 
                      deadline.daysLeft <= 14 ? "text-accent-gold" : "text-primary"
                    }`}>
                      {deadline.daysLeft} days left
                    </div>
                    <p className="font-mono text-xs text-text-muted">
                      {deadline.deadline}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-text-muted mb-2">No upcoming deadlines — complete your roadmap steps to unlock opportunities</p>
              <button
                onClick={() => router.push("/opportunity-radar")}
                className="text-primary hover:underline text-sm font-medium"
              >
                Explore Opportunities →
              </button>
            </div>
          )}
        </motion.div>
        {/* Encouragement */}
        {dashboardData.encouragement && (
          <motion.div
            className="clay-card p-6 text-center mb-6 bg-gradient-to-r from-primary/5 to-primary-light/5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="font-body text-base text-text font-medium">
              {dashboardData.encouragement}
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          className="flex justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <button
            onClick={() => router.push("/roadmap")}
            className="px-6 py-3 rounded-xl font-body font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            ← Back to Roadmap
          </button>
          <button
            onClick={() => router.push("/")}
            className="clay-button px-8 py-4 text-white font-body font-medium"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}