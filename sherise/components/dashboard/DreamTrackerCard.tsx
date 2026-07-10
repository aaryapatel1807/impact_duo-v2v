"use client";

import { motion } from "framer-motion";

interface DreamTrackerCardProps {
  dreamTracker: {
    todaysTask: string;
    weeklyGoal: string;
    streak: number;
    xp: number;
    achievements: Array<{
      id: string;
      title: string;
      earned: boolean;
      icon: string;
    }>;
  };
}

export default function DreamTrackerCard({ dreamTracker }: DreamTrackerCardProps) {
  const CircularProgress = ({ value, max, size = 80, strokeWidth = 8 }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
  }) => {
    const normalizedValue = Math.min(value, max);
    const percentage = (normalizedValue / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-xl font-bold text-gray-800"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            {normalizedValue}
          </motion.span>
          <span className="text-xs text-gray-500">XP</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10 h-full"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-lg"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            💫
          </motion.div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Dream Tracker</h3>
            <p className="text-sm text-gray-500">Progress Dashboard</p>
          </div>
        </div>
      </div>

      {/* Streak & XP */}
      <div className="flex items-center justify-between mb-6">
        {/* Streak */}
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white text-2xl shadow-lg mb-2"
            animate={dreamTracker.streak > 0 ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥
          </motion.div>
          <motion.p
            className="text-2xl font-bold text-gray-800"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {dreamTracker.streak}
          </motion.p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>

        {/* XP Progress */}
        <CircularProgress value={dreamTracker.xp} max={1000} />
      </div>

      {/* Today's Task */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Today's Focus</h4>
        <motion.div
          className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            {dreamTracker.todaysTask}
          </p>
        </motion.div>
      </div>

      {/* Weekly Goal */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Weekly Goal</h4>
        <motion.div
          className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {dreamTracker.weeklyGoal}
          </p>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Recent Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {dreamTracker.achievements.slice(0, 4).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`p-2 rounded-lg text-center transition-all duration-300 ${
                achievement.earned
                  ? "bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200/50 text-yellow-800"
                  : "bg-gray-50 border border-gray-200/50 text-gray-400"
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              whileHover={achievement.earned ? { scale: 1.05, y: -2 } : {}}
            >
              <motion.div
                className="text-lg mb-1"
                animate={achievement.earned ? {
                  rotate: [0, 10, -10, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {achievement.icon}
              </motion.div>
              <p className="text-xs font-medium leading-tight">
                {achievement.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        💪 Complete Today's Task
      </motion.button>
    </motion.div>
  );
}