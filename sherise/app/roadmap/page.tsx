"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

interface RoadmapStep {
  title: string;
  description: string;
  icon: string;
  status: "completed" | "current" | "future";
}

interface RoadmapData {
  currentSituation: string;
  steps: RoadmapStep[];
  estimatedTimeline: string;
}

export default function Roadmap() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchRoadmap();
  }, [isLoaded, user, router]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/roadmap`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.roadmap) {
          setRoadmapData({
            currentSituation: data.roadmap.currentSituation,
            steps: Array.isArray(data.roadmap.steps) ? data.roadmap.steps : [],
            estimatedTimeline: data.roadmap.timelineMonths,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    try {
      setGenerating(true);
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/roadmap/generate`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmapData({
          currentSituation: data.roadmap.currentSituation,
          steps: data.roadmap.steps,
          estimatedTimeline: data.roadmap.timelineMonths,
        });
      } else {
        alert("Failed to generate roadmap. Please try again.");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="clay-card p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">🗺️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Personalized Roadmap
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Generate an AI-powered roadmap tailored to your skills, goals, and circumstances.
            </p>
            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="clay-button px-8 py-4 text-white font-medium disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate My Roadmap"}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Comeback Roadmap</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {roadmapData.estimatedTimeline}
          </p>
        </motion.div>

        {/* Current Situation */}
        <motion.div
          className="clay-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Where You Are Now</h2>
          <p className="text-gray-700 leading-relaxed">{roadmapData.currentSituation}</p>
        </motion.div>

        {/* Roadmap Steps */}
        <div className="space-y-6">
          {roadmapData.steps.map((step, index) => (
            <motion.div
              key={index}
              className={`clay-card p-6 ${
                step.status === "current"
                  ? "border-2 border-purple-500"
                  : step.status === "completed"
                  ? "bg-green-50"
                  : ""
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : step.status === "current"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {step.status === "completed"
                        ? "✓ Completed"
                        : step.status === "current"
                        ? "In Progress"
                        : "Upcoming"}
                    </span>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          className="mt-12 flex justify-center space-x-4"
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
            onClick={generateRoadmap}
            disabled={generating}
            className="clay-button px-6 py-3 text-white font-medium disabled:opacity-50"
          >
            {generating ? "Regenerating..." : "Regenerate Roadmap"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
