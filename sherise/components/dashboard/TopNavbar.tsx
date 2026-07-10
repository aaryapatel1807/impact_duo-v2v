"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface TopNavbarProps {
  user: {
    name: string;
    avatar: string;
  };
}

export default function TopNavbar({ user }: TopNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left Section - Search */}
      <div className="flex items-center space-x-6 flex-1">
        <motion.div
          className={`relative transition-all duration-300 ${
            searchFocused ? "w-96" : "w-80"
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div
            className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-300 ${
              searchFocused
                ? "bg-white/80 border-purple-200 shadow-lg shadow-purple-500/10"
                : "bg-white/50 border-white/30 hover:bg-white/60"
            }`}
          >
            <motion.span
              className={`text-xl transition-colors ${
                searchFocused ? "text-purple-500" : "text-gray-400"
              }`}
              animate={searchFocused ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5 }}
            >
              🔍
            </motion.span>
            <input
              type="text"
              placeholder="Search opportunities, skills, or ask AI..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <motion.div
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                searchFocused
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-500"
              }`}
              animate={searchFocused ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              ⌘K
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Center Section - Date */}
      <motion.div
        className="text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-sm text-gray-500 font-medium">{getCurrentDate()}</p>
      </motion.div>

      {/* Right Section - Profile & Notifications */}
      <div className="flex items-center space-x-4 flex-1 justify-end">
        {/* Notifications */}
        <motion.button
          className="relative p-3 rounded-xl bg-white/50 border border-white/30 hover:bg-white/70 transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            3
          </motion.div>
        </motion.button>

        {/* Profile Section */}
        <motion.div
          className="flex items-center space-x-4 p-2 pr-4 rounded-2xl bg-white/50 border border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-semibold shadow-lg"
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {user.name.charAt(0).toUpperCase()}
          </motion.div>
          <div className="text-left">
            <motion.h3
              className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              {getGreeting()}, {user.name} 🌸
            </motion.h3>
            <motion.p
              className="text-sm text-gray-500 font-medium"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              Ready to continue your journey?
            </motion.p>
          </div>
          <motion.span
            className="text-gray-400 group-hover:text-purple-500 transition-colors ml-2"
            whileHover={{ x: 3 }}
          >
            ›
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}