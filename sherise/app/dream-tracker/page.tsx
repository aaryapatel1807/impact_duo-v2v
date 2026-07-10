"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

interface DashboardData {
  currentStreak: number;
  xp: number;
  todaysTasks: string[];
  completedTasks: number;
  analytics: {
    totalTasks: number;
    averageConfidence: number;
  };
}

export default function DreamTracker() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchProgress();
  }, [isLoaded, user, router]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/progress`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard || null);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/progress/update`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          tasksCompleted: 1,
          confidenceScore: 7,
        }),
      });

      if (response.ok) {
        fetchProgress(); // Refresh data
        alert("Progress updated!");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="clay-card p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">💫</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Start Tracking Your Dream
            </h1>
            <p className="text-gray-600 mb-8">
              Complete your onboarding to begin tracking your comeback journey
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="clay-button px-8 py-4 text-white font-medium"
            >
              Complete Onboarding
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dream Tracker</h1>
          <p className="text-gray-600">Track your progress and celebrate your wins</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="clay-card p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-5xl font-bold text-orange-500 mb-2">
              {dashboardData.currentStreak} 🔥
            </div>
            <p className="text-gray-600 font-medium">Day Streak</p>
          </motion.div>

          <motion.div
            className="clay-card p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-5xl font-bold text-purple-600 mb-2">{dashboardData.xp}</div>
            <p className="text-gray-600 font-medium">Total XP Earned</p>
          </motion.div>

          <motion.div
            className="clay-card p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-5xl font-bold text-green-600 mb-2">
              {dashboardData.analytics.totalTasks}
            </div>
            <p className="text-gray-600 font-medium">Tasks Completed</p>
          </motion.div>
        </div>

        {/* Today's Tasks */}
        <motion.div
          className="clay-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Tasks</h2>
          {dashboardData.todaysTasks && dashboardData.todaysTasks.length > 0 ? (
            <ul className="space-y-3">
              {dashboardData.todaysTasks.map((task, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{task}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks for today. Great job staying on track!</p>
          )}
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          className="clay-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confidence Score</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(dashboardData.analytics.averageConfidence / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.analytics.averageConfidence}/10
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={updateTask}
            className="clay-button px-6 py-3 text-white font-medium"
          >
            Mark Task Complete
          </button>
        </motion.div>
      </div>
    </div>
  );
}
