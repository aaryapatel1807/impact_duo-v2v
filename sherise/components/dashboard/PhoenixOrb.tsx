"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PhoenixOrbProps {
  progress: number; // 0-100
}

export function PhoenixOrb({ progress }: PhoenixOrbProps) {
  const [stage, setStage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Determine Phoenix transformation stage based on progress
  useEffect(() => {
    const newStage = Math.floor(progress / 25); // 0-4 stages
    if (newStage > stage) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setStage(newStage);
  }, [progress, stage]);

  const getPhoenixState = () => {
    switch (stage) {
      case 0:
        return {
          emoji: "🌑",
          title: "Ashes",
          description: "Your journey begins",
          color: "from-gray-400 to-gray-600",
          glow: "shadow-gray-500/30",
          particles: [],
        };
      case 1:
        return {
          emoji: "🐣",
          title: "Awakening",
          description: "First steps taken",
          color: "from-yellow-400 to-orange-400",
          glow: "shadow-yellow-500/40",
          particles: ["✨", "⭐"],
        };
      case 2:
        return {
          emoji: "🐦",
          title: "Growing",
          description: "Skills developing",
          color: "from-orange-400 to-red-400",
          glow: "shadow-orange-500/50",
          particles: ["✨", "⭐", "🌟"],
        };
      case 3:
        return {
          emoji: "🦅",
          title: "Soaring",
          description: "Confidence rising",
          color: "from-red-400 to-purple-400",
          glow: "shadow-red-500/60",
          particles: ["✨", "⭐", "🌟", "💫"],
        };
      case 4:
        return {
          emoji: "🔥",
          title: "Phoenix Reborn",
          description: "Transformation complete",
          color: "from-yellow-400 via-orange-500 to-red-500",
          glow: "shadow-orange-500/80",
          particles: ["✨", "⭐", "🌟", "💫", "🔥"],
        };
      default:
        return {
          emoji: "🌑",
          title: "Beginning",
          description: "Ready to start",
          color: "from-gray-400 to-gray-600",
          glow: "shadow-gray-500/30",
          particles: [],
        };
    }
  };

  const phoenixState = getPhoenixState();

  return (
    <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
      {/* Main Phoenix Orb */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          className={`absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r ${phoenixState.color} opacity-20 blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle Glow Ring */}
        <motion.div
          className={`absolute inset-2 w-28 h-28 rounded-full bg-gradient-to-r ${phoenixState.color} opacity-30 blur-lg`}
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main Orb */}
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${phoenixState.color} shadow-2xl ${phoenixState.glow} flex items-center justify-center text-4xl backdrop-blur-sm border border-white/20 cursor-pointer pointer-events-auto`}
          whileHover={{
            scale: 1.1,
            rotate: 5,
          }}
          whileTap={{ scale: 0.95 }}
          animate={stage === 4 ? {
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          } : {}}
          transition={stage === 4 ? {
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity },
          } : {}}
        >
          <motion.span
            key={stage}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {phoenixState.emoji}
          </motion.span>
        </motion.div>

        {/* Progress Ring */}
        <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            fill="transparent"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            stroke={`url(#phoenixGradient-${stage})`}
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 58}
            initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 58 * (1 - progress / 100),
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id={`phoenixGradient-${stage}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Particles */}
        <AnimatePresence>
          {phoenixState.particles.map((particle, index) => (
            <motion.div
              key={`${stage}-${index}`}
              className="absolute text-lg pointer-events-none"
              style={{
                left: Math.random() * 128,
                top: Math.random() * 128,
              }}
              initial={{
                scale: 0,
                opacity: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, -50 - Math.random() * 50],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            >
              {particle}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Info Tooltip */}
        <motion.div
          className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl p-3 shadow-xl min-w-48 text-center pointer-events-auto"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <h4 className="font-bold text-gray-800 text-sm">{phoenixState.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{phoenixState.description}</p>
          <div className="text-xs text-gray-500">
            Progress: {Math.round(progress)}%
          </div>
          
          {/* Arrow pointing to orb */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90" />
        </motion.div>
      </motion.div>

      {/* Stage Up Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Celebration Burst */}
            <div className="relative">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  animate={{
                    x: Math.cos((i / 8) * 2 * Math.PI) * 100,
                    y: Math.sin((i / 8) * 2 * Math.PI) * 100,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Level Up Text */}
            <motion.div
              className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              🎉 Phoenix Evolved!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}