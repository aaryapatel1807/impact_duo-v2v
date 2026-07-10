"use client";

import { motion } from "framer-motion";

interface StatsCardsProps {
  stats: {
    careerProgress: number;
    learningStreak: number;
    applications: number;
    skillsEarned: number;
  };
}

const statsData = [
  {
    id: "career",
    title: "Career Progress",
    icon: "📈",
    color: "from-purple-500 to-indigo-500",
    bgColor: "from-purple-50 to-indigo-50",
    shadowColor: "shadow-purple-500/20",
  },
  {
    id: "streak",
    title: "Learning Streak",
    icon: "🔥",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    shadowColor: "shadow-orange-500/20",
  },
  {
    id: "applications",
    title: "Applications",
    icon: "📝",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    shadowColor: "shadow-green-500/20",
  },
  {
    id: "skills",
    title: "Skills Earned",
    icon: "🎯",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50",
    shadowColor: "shadow-pink-500/20",
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  const getStatValue = (id: string) => {
    switch (id) {
      case "career":
        return { value: stats.careerProgress, suffix: "%", trend: "+12%" };
      case "streak":
        return { value: stats.learningStreak, suffix: " days", trend: "+2 days" };
      case "applications":
        return { value: stats.applications, suffix: "", trend: "+5 this week" };
      case "skills":
        return { value: stats.skillsEarned, suffix: "", trend: "+2 new" };
      default:
        return { value: 0, suffix: "", trend: "" };
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6 mt-8">
      {statsData.map((stat, index) => {
        const statValue = getStatValue(stat.id);
        
        return (
          <motion.div
            key={stat.id}
            className={`relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl ${stat.shadowColor} overflow-hidden group cursor-pointer`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-8 -translate-y-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white to-transparent rounded-full transform -translate-x-4 translate-y-4" />
            </div>

            <div className="relative">
              {/* Icon */}
              <motion.div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:shadow-xl transition-shadow duration-300`}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {stat.icon}
              </motion.div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                {stat.title}
              </h3>

              {/* Value */}
              <div className="flex items-baseline space-x-1 mb-3">
                <motion.span
                  className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                >
                  {statValue.value}
                </motion.span>
                <span className="text-sm text-gray-500 font-medium">
                  {statValue.suffix}
                </span>
              </div>

              {/* Trend */}
              {statValue.trend && (
                <motion.div
                  className="flex items-center space-x-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span className="text-green-500 text-xs">↗</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {statValue.trend}
                  </span>
                </motion.div>
              )}

              {/* Mini Chart */}
              <div className="mt-4 h-12 flex items-end space-x-1 opacity-30 group-hover:opacity-60 transition-opacity">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 bg-gradient-to-t ${stat.color} rounded-sm`}
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      minHeight: '20%'
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ 
                      delay: 1 + index * 0.1 + i * 0.05,
                      duration: 0.3 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hover Glow Effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              whileHover={{ scale: 1.1 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}