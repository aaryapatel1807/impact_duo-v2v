"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function RightSidebar() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const getCurrentDate = () => {
    const now = new Date();
    return {
      month: now.toLocaleDateString("en-US", { month: "long" }),
      year: now.getFullYear(),
      today: now.getDate(),
    };
  };

  const { month, year, today } = getCurrentDate();
  const daysInMonth = new Date(year, new Date().getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, new Date().getMonth(), 1).getDay();

  const upcomingDeadlines = [
    { title: "Women in Tech Scholarship", days: 15, color: "text-red-500" },
    { title: "Virtual Assistant Program", days: 23, color: "text-yellow-600" },
    { title: "Freelance Writing Course", days: 30, color: "text-green-600" },
  ];

  const motivationalQuotes = [
    "Every expert was once a beginner.",
    "Your comeback is always greater than your setback.",
    "Progress, not perfection.",
    "Small steps daily lead to big changes yearly.",
  ];

  const [currentQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
    >
      {/* Mini Calendar */}
      <motion.div
        className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">{month} {year}</h3>
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            📅
          </motion.span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-gray-500 font-semibold py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="h-8" />
          ))}
          
          {/* Calendar days */}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const isToday = day === today;
            const isSelected = selectedDate === day;
            
            return (
              <motion.button
                key={day}
                className={`h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isToday
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : isSelected
                    ? "bg-purple-100 text-purple-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => setSelectedDate(day)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Deadlines */}
      <motion.div
        className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl">⏰</span>
          <h3 className="font-bold text-gray-800">Upcoming Deadlines</h3>
        </div>

        <div className="space-y-3">
          {upcomingDeadlines.map((deadline, index) => (
            <motion.div
              key={deadline.title}
              className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/50"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ x: 2 }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {deadline.title}
                </p>
              </div>
              <span className={`text-sm font-bold ${deadline.color}`}>
                {deadline.days}d
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Today's Goal */}
      <motion.div
        className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold text-gray-800">Today's Goal</h3>
        </div>

        <motion.div
          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100/50"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            Complete digital literacy module and practice resume writing
          </p>
        </motion.div>

        <motion.button
          className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Mark Complete
        </motion.button>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        className="bg-gradient-to-br from-purple-100/50 to-pink-100/50 backdrop-blur-xl border border-purple-200/30 rounded-2xl p-6 shadow-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <motion.div
          className="text-center"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-4xl mb-4">✨</div>
          <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
            "{currentQuote}"
          </p>
        </motion.div>
      </motion.div>

      {/* Progress Ring */}
      <motion.div
        className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <div className="text-center">
          <h3 className="font-bold text-gray-800 mb-4">Weekly Progress</h3>
          
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(156, 163, 175, 0.2)"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#weeklyGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.65) }}
                transition={{ duration: 2, ease: "easeOut", delay: 1.3 }}
              />
              <defs>
                <linearGradient id="weeklyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">65%</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">4 out of 6 goals completed</p>
        </div>
      </motion.div>

      {/* AI Suggestion */}
      <motion.div
        className="bg-gradient-to-br from-indigo-100/50 to-purple-100/50 backdrop-blur-xl border border-indigo-200/30 rounded-2xl p-6 shadow-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <motion.span
            className="text-xl"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            🤖
          </motion.span>
          <h3 className="font-bold text-gray-800">AI Suggestion</h3>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Based on your progress, consider applying to the Virtual Assistant Bootcamp. 
          It matches your communication skills perfectly!
        </p>
        
        <motion.button
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          whileHover={{ x: 2 }}
        >
          Learn more →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}