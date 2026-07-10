"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface RoadmapCardProps {
  roadmap: {
    progress: number;
    currentStep: number;
    totalSteps: number;
    milestones: Array<{
      id: number;
      title: string;
      status: "completed" | "current" | "future";
      description: string;
    }>;
  };
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "from-yellow-400 to-orange-500",
          glow: "shadow-yellow-500/40",
          ring: "ring-yellow-400/30",
        };
      case "current":
        return {
          bg: "from-purple-500 to-pink-500",
          glow: "shadow-purple-500/40",
          ring: "ring-purple-400/50",
        };
      default:
        return {
          bg: "from-gray-300 to-gray-400",
          glow: "shadow-gray-400/20",
          ring: "ring-gray-300/30",
        };
    }
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/10"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Comeback Roadmap</h2>
          <p className="text-gray-600">Interactive milestone journey</p>
        </div>
        <motion.div
          className="flex items-center space-x-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-right">
            <p className="text-sm text-gray-500">Overall Progress</p>
            <p className="text-2xl font-bold text-purple-600">{roadmap.progress}%</p>
          </div>
          <motion.div
            className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl shadow-xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🗺️
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {roadmap.currentStep + 1} of {roadmap.totalSteps}</span>
          <span>{roadmap.progress}% Complete</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${roadmap.progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Interactive Roadmap */}
      <div className="relative">
        {/* Connection Path */}
        <svg className="absolute inset-0 w-full h-48" viewBox="0 0 800 192">
          <motion.path
            d="M 80 96 Q 200 50, 320 96 Q 440 140, 560 96 Q 680 50, 720 96"
            stroke="url(#roadmapGradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10 10"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2, delay: 0.8 }}
          />
          <defs>
            <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Milestones */}
        <div className="relative h-48 flex items-center justify-between px-4">
          {roadmap.milestones.map((milestone, index) => {
            const colors = getMilestoneColor(milestone.status);
            const isActive = selectedMilestone === milestone.id;
            
            return (
              <motion.div
                key={milestone.id}
                className="relative group cursor-pointer"
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                  delay: 1 + index * 0.2, 
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
                onClick={() => setSelectedMilestone(isActive ? null : milestone.id)}
              >
                {/* Milestone Node */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} shadow-xl ${colors.glow} flex items-center justify-center text-white font-bold text-lg relative overflow-hidden`}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -5,
                    boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"
                  }}
                  animate={milestone.status === "current" ? {
                    boxShadow: [
                      "0 10px 30px rgba(168, 85, 247, 0.3)",
                      "0 15px 40px rgba(168, 85, 247, 0.5)",
                      "0 10px 30px rgba(168, 85, 247, 0.3)",
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {milestone.status === "completed" ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + index * 0.2, type: "spring" }}
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <span>{milestone.id}</span>
                  )}

                  {/* Pulsing ring for current step */}
                  {milestone.status === "current" && (
                    <motion.div
                      className={`absolute inset-0 rounded-2xl ring-4 ${colors.ring}`}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.3, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Shimmer effect for completed */}
                  {milestone.status === "completed" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                {/* Milestone Label */}
                <motion.div
                  className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.2 }}
                >
                  <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {milestone.status}
                  </p>
                </motion.div>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl p-3 shadow-xl min-w-48 z-10"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {milestone.description}
                      </p>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex items-center justify-center space-x-4 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Journey
        </motion.button>
        <motion.button
          className="px-6 py-3 bg-white/70 text-purple-700 font-semibold rounded-xl border border-purple-200/50 hover:bg-white/90 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>
      </motion.div>
    </motion.div>
  );
}