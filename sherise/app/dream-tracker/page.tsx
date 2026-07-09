"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface TrackerData {
  todayTask: string;
  weeklyGoal: string;
  completedSkills: number;
  totalSkills: number;
  upcomingDeadlines: Array<{ title: string; date: string }>;
  applicationsSent: number;
  confidenceScore: number;
  streakDays: number;
  overallProgress: number;
  currentStep: string;
}

export default function DreamTracker() {
  const router = useRouter();
  const [trackerData, setTrackerData] = useState<TrackerData | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(7);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.push("/onboarding");
      return;
    }

    // Mock tracker data
    const mockData: TrackerData = {
      todayTask: "Complete Digital Literacy Foundation - Module 1: Internet Basics",
      weeklyGoal: "Finish first 3 modules of online course and set up email account",
      completedSkills: 4,
      totalSkills: 6,
      upcomingDeadlines: [
        { title: "Women in Tech Scholarship", date: "March 2026" },
        { title: "Virtual Assistant Bootcamp", date: "January 2026" },
      ],
      applicationsSent: 2,
      confidenceScore: confidenceScore,
      streakDays: 5,
      overallProgress: 15,
      currentStep: "Step 1: Digital Literacy Foundation",
    };

    setTrackerData(mockData);
  }, [router, confidenceScore]);

  const handleConfidenceChange = (value: number) => {
    setConfidenceScore(value);
  };

  if (!trackerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-lg text-text-muted">Loading your dashboard...</p>
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
        </motion.div>

        {/* Top row: Streak and Overall Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Streak Counter */}
          <motion.div
            className="clay-card p-8 text-center bg-gradient-to-br from-accent-gold/10 to-accent-gold/5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-6xl mb-4">🔥</div>
            <div className="font-mono text-5xl font-bold text-accent-gold mb-2">
              {trackerData.streakDays}
            </div>
            <p className="font-body text-base text-text-muted">
              Day Streak — Keep it going!
            </p>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            className="clay-card p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-body text-lg font-semibold text-text mb-4">
              Overall Progress
            </h3>
            <div className="relative w-full h-6 bg-border rounded-full overflow-hidden mb-3">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trackerData.overallProgress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-2xl font-bold text-primary">
                {trackerData.overallProgress}%
              </span>
              <span className="text-sm text-text-muted">
                {trackerData.currentStep}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Middle row: Today's Task and Weekly Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Today's Task */}
          <motion.div
            className="clay-card p-8 border-l-4 border-primary"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-body text-lg font-semibold text-primary">
                Today's Task
              </h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="font-body text-base text-text leading-relaxed">
              {trackerData.todayTask}
            </p>
            <button className="mt-4 px-5 py-2 bg-primary/10 text-primary rounded-lg font-body font-medium text-sm hover:bg-primary/20 transition-colors">
              Mark Complete
            </button>
          </motion.div>

          {/* Weekly Goal */}
          <motion.div
            className="clay-card p-8 border-l-4 border-accent-plum"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-body text-lg font-semibold text-accent-plum">
                This Week's Goal
              </h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-body text-base text-text leading-relaxed">
              {trackerData.weeklyGoal}
            </p>
          </motion.div>
        </div>

        {/* Bottom grid: Stats and info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Completed Skills */}
          <motion.div
            className="clay-card p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-3xl mb-3">📚</div>
            <div className="font-mono text-3xl font-bold text-text mb-1">
              {trackerData.completedSkills}/{trackerData.totalSkills}
            </div>
            <p className="text-sm text-text-muted">Skills Mapped</p>
          </motion.div>

          {/* Applications Sent */}
          <motion.div
            className="clay-card p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="text-3xl mb-3">📤</div>
            <div className="font-mono text-3xl font-bold text-text mb-1">
              {trackerData.applicationsSent}
            </div>
            <p className="text-sm text-text-muted">Applications Sent</p>
          </motion.div>

          {/* Confidence Score */}
          <motion.div
            className="clay-card p-6 md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-body text-base font-semibold text-text mb-1">
                  Confidence Score
                </h3>
                <p className="text-xs text-text-muted">
                  How confident do you feel today?
                </p>
              </div>
              <div className="text-3xl">💪</div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={confidenceScore}
                onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                className="flex-grow h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                    (confidenceScore - 1) * 11.11
                  }%, var(--color-border) ${(confidenceScore - 1) * 11.11}%, var(--color-border) 100%)`,
                }}
              />
              <span className="font-mono text-2xl font-bold text-primary min-w-[3rem] text-right">
                {confidenceScore}/10
              </span>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Deadlines */}
        <motion.div
          className="clay-card p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="font-body text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Upcoming Deadlines
          </h3>
          {trackerData.upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {trackerData.upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-bg rounded-xl"
                >
                  <span className="font-body text-base text-text">
                    {deadline.title}
                  </span>
                  <span className="font-mono text-sm text-text-muted">
                    {deadline.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">
              No upcoming deadlines — complete your roadmap steps to unlock opportunities
            </p>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
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
