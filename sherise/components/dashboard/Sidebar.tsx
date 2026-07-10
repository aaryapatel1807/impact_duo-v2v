"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", active: true },
  { id: "roadmap", label: "AI Roadmap", icon: "🗺️", active: false },
  { id: "skill-passport", label: "Skill Passport", icon: "📋", active: false },
  { id: "opportunity-radar", label: "Opportunity Radar", icon: "🎯", active: false },
  { id: "dream-tracker", label: "Dream Tracker", icon: "💫", active: false },
  { id: "achievements", label: "Achievements", icon: "🏆", active: false },
  { id: "settings", label: "Settings", icon: "⚙️", active: false },
];

export default function Sidebar({ user }: { user?: { name: string; level: number; xp: number; maxXp: number } }) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("dashboard");

  const displayUser = user || { name: "User", level: 1, xp: 0, maxXp: 1000 };
  const userInitial = displayUser.name?.charAt(0)?.toUpperCase() || "U";

  const handleNavigation = (itemId: string) => {
    setActiveItem(itemId);
    if (itemId === "roadmap") router.push("/roadmap");
    if (itemId === "skill-passport") router.push("/skill-passport");
    if (itemId === "opportunity-radar") router.push("/opportunity-radar");
    if (itemId === "dream-tracker") router.push("/dream-tracker");
  };

  return (
    <motion.div
      className="fixed left-6 top-6 bottom-6 w-72 z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="h-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6">
          <motion.div
            className="flex items-center space-x-4 mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* 3D Phoenix Logo */}
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.span
                className="text-2xl filter drop-shadow-sm"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(168, 85, 247, 0.5)",
                    "0 0 20px rgba(236, 72, 153, 0.5)",
                    "0 0 10px rgba(168, 85, 247, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🔥
              </motion.span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SheRise
              </h1>
              <p className="text-sm text-gray-500 font-medium">AI Career Companion</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`w-full group relative`}
                onClick={() => handleNavigation(item.id)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
                    activeItem === item.id
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  <motion.span
                    className="text-xl"
                    animate={activeItem === item.id ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span
                    className={`font-medium transition-colors ${
                      activeItem === item.id
                        ? "text-purple-700"
                        : "text-gray-700 group-hover:text-purple-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Active indicator */}
                {activeItem === item.id && (
                  <motion.div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    layoutId="activeIndicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
          <motion.div
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100/50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {/* User Profile */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                {userInitial}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{displayUser.name}</p>
                <p className="text-xs text-gray-500">Level {displayUser.level} • Beginner</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{displayUser.xp} XP</span>
                <span>{displayUser.maxXp} XP</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(displayUser.xp / displayUser.maxXp) * 100}%` }}
                  transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Logout */}
            <motion.button
              className="w-full mt-3 p-2 text-xs text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-white/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Logout
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}