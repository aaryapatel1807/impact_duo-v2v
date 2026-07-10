"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  phoenixProgress: number;
}

export default function HeroSection({ phoenixProgress }: HeroSectionProps) {
  const router = useRouter();

  return (
    <motion.div
      className="relative bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl shadow-purple-500/10 overflow-hidden"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-300/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between">
        {/* Left Content */}
        <div className="flex-1 pr-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl font-bold text-gray-800 mb-4 leading-tight"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Every comeback begins with{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                one brave step
              </motion.span>
              .
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Your AI companion is here to transform your life experience into career opportunities.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/roadmap")}
              >
                <span className="flex items-center space-x-2">
                  <span>Continue Journey</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>

              <motion.button
                className="px-8 py-4 bg-white/70 text-purple-700 font-semibold rounded-2xl border border-purple-200/50 hover:bg-white/90 hover:border-purple-300 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/roadmap")}
              >
                View Roadmap
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Illustration */}
        <motion.div
          className="flex-1 flex justify-center items-center"
          initial={{ x: 50, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Main Illustration Container */}
            <motion.div
              className="relative w-80 h-80"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Background Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Stepping Stones Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                <motion.path
                  d="M 50 280 Q 120 220, 180 240 Q 240 260, 270 180"
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8 8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Stepping Stones */}
              {[1, 2, 3, 4, 5].map((step, index) => {
                const positions = [
                  { x: 50, y: 280 },
                  { x: 100, y: 240 },
                  { x: 160, y: 250 },
                  { x: 220, y: 220 },
                  { x: 270, y: 180 },
                ];
                const isCompleted = (phoenixProgress / 20) >= step;
                const isCurrent = Math.floor(phoenixProgress / 20) + 1 === step;

                return (
                  <motion.div
                    key={step}
                    className={`absolute w-12 h-8 rounded-xl shadow-lg ${
                      isCompleted
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/40"
                        : isCurrent
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/40"
                        : "bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-400/20"
                    }`}
                    style={{
                      left: positions[index].x,
                      top: positions[index].y,
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1, y: -5 }}
                  >
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Woman Figure */}
              <motion.div
                className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-xl flex items-center justify-center text-2xl"
                style={{
                  left: 50 + (phoenixProgress / 100) * 220,
                  top: 280 - (phoenixProgress / 100) * 100,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                👩‍💼
              </motion.div>

              {/* Phoenix at the end */}
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/50 flex items-center justify-center text-3xl"
                style={{
                  left: 270,
                  top: 140,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🔥
              </motion.div>
            </motion.div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                style={{
                  left: Math.random() * 300,
                  top: Math.random() * 300,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}