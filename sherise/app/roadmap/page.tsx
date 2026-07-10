"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

// Mock function - will be replaced with actual AI call
function generateMockRoadmap(userData: any): RoadmapData {
  // This adapts to internet availability as specified in PRD
  const hasLowInternet = userData.internetAvailability === "low" || userData.internetAvailability === "none";
  
  return {
    currentSituation: `You completed ${userData.education} and paused your education after ${userData.reasonStopped.toLowerCase()} — that's a starting point, not a setback. Your skills in ${userData.skills.split(",")[0].trim()} show you're already building valuable experience.`,
    steps: hasLowInternet ? [
      {
        title: "Community Center Skills Program",
        description: "Join local women's skill development center for offline training in business basics and digital literacy (weekends, 2 hours)",
        icon: "🏫",
        status: "current",
      },
      {
        title: "Radio-based Business Course",
        description: "Enroll in state radio's women entrepreneurship program — no internet needed, learn via audio lessons you can record",
        icon: "📻",
        status: "future",
      },
      {
        title: "Microenterprise Certification",
        description: "Complete government's offline MSME certification at district office (paperwork + practical assessment)",
        icon: "📜",
        status: "future",
      },
      {
        title: "Local Business Incubator",
        description: "Apply to women's co-op workspace with shared resources — turn your tailoring into small business",
        icon: "🏪",
        status: "future",
      },
      {
        title: "First Client Contract",
        description: "Secure regular orders through co-op connections + local word-of-mouth marketing",
        icon: "🤝",
        status: "future",
      },
    ] : [
      {
        title: "Digital Literacy Foundation",
        description: "Free online course: Computer basics + Internet safety (3 weeks, self-paced)",
        icon: "💻",
        status: "current",
      },
      {
        title: "Freelance Skills Training",
        description: "Coursera/Udemy: Intro to Remote Work + Communication (6 weeks, 1-2 hours/day)",
        icon: "🎓",
        status: "future",
      },
      {
        title: "Portfolio & LinkedIn Setup",
        description: "Create online presence showcasing your tutoring and tailoring work — professional profile + 3-5 work samples",
        icon: "📱",
        status: "future",
      },
      {
        title: "Freelance Platform Onboarding",
        description: "Join Upwork/Fiverr or local platform — apply to 5 beginner-friendly remote jobs per week",
        icon: "🌐",
        status: "future",
      },
      {
        title: "First Paid Project",
        description: "Complete initial contract + get first review — this unlocks more opportunities",
        icon: "✨",
        status: "future",
      },
    ],
    estimatedTimeline: hasLowInternet ? "10-12 months" : "6-8 months",
  };
}

export default function Roadmap() {
  const router = useRouter();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRoadmap = async () => {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/onboarding");
        return;
      }

      try {
        const parsed = JSON.parse(userData);
        
        // Get or create user profile first
        let userId = localStorage.getItem("userId");
        if (!userId) {
          // Create user profile
          const profileResponse = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: parsed.name || "User",
              email: parsed.email || `user-${Date.now()}@sherise.app`,
              age: parseInt(parsed.age),
              country: parsed.country,
              educationLevel: parsed.education,
              reasonStopped: parsed.reasonStopped,
              skills: parsed.skills,
              interests: parsed.interests,
              hoursPerDay: parsed.hoursPerDay,
              internetAvailability: parsed.internetAvailability,
              careerGoal: parsed.careerGoal,
            }),
          });
          
          if (!profileResponse.ok) {
            throw new Error("Failed to create profile");
          }
          
          const profileData = await profileResponse.json();
          userId = profileData.user.id;
          localStorage.setItem("userId", userId);
        }

        // Check if roadmap already exists
        const existingRoadmapResponse = await fetch(`/api/roadmap/${userId}`);
        if (existingRoadmapResponse.ok) {
          const existingData = await existingRoadmapResponse.json();
          if (existingData.success && existingData.roadmap) {
            // Use existing roadmap
            setRoadmapData({
              currentSituation: existingData.roadmap.currentSituation,
              steps: existingData.roadmap.steps,
              estimatedTimeline: existingData.roadmap.timelineMonths,
            });
            setLoading(false);
            return;
          }
        }

        // Generate new roadmap using AI
        const roadmapResponse = await fetch("/api/roadmap/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!roadmapResponse.ok) {
          throw new Error("Failed to generate roadmap");
        }

        const roadmapData = await roadmapResponse.json();
        
        if (roadmapData.success && roadmapData.roadmap) {
          setRoadmapData({
            currentSituation: roadmapData.roadmap.currentSituation,
            steps: roadmapData.roadmap.steps,
            estimatedTimeline: roadmapData.roadmap.timelineMonths,
          });
        } else {
          // Fallback to mock data
          const mockData = generateMockRoadmap(parsed);
          setRoadmapData(mockData);
        }
      } catch (error) {
        console.error("Error generating roadmap:", error);
        // Fallback to mock data
        const parsed = JSON.parse(userData);
        const mockData = generateMockRoadmap(parsed);
        setRoadmapData(mockData);
      } finally {
        setLoading(false);
      }
    };

    generateRoadmap();
  }, [router]);

  if (loading || !roadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-body text-lg text-text-muted">
            Creating your personalized roadmap...
          </p>
        </motion.div>
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
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-2xl font-medium text-text mb-4">
            Your Comeback Roadmap
          </h1>
          <p className="font-body text-base text-text-muted max-w-2xl mx-auto">
            A personalized, step-by-step path created just for you
          </p>
        </motion.div>

        {/* Current Situation Card */}
        <motion.div
          className="clay-card p-6 md:p-8 mb-16 bg-accent-plum/5 border-l-4 border-accent-plum"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-body font-semibold text-accent-plum mb-3">
            Where you're starting from
          </h2>
          <p className="font-body text-base text-text leading-relaxed">
            {roadmapData.currentSituation}
          </p>
        </motion.div>

        {/* 3D Stepping Stone Path */}
        <div className="relative py-16">
          {/* Connecting path line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <motion.path
              d="M 150 100 Q 300 150, 450 100 Q 600 50, 750 100 Q 900 150, 1050 100"
              stroke="var(--color-primary)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />
          </svg>

          {/* Stepping stones */}
          <div className="relative z-10 space-y-12">
            {roadmapData.steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.12,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {/* The Stone */}
                <motion.div
                  className={`clay-stone p-8 min-w-[280px] max-w-[280px] relative ${
                    step.status === "current"
                      ? "ring-4 ring-primary ring-opacity-50"
                      : step.status === "completed"
                      ? "bg-accent-gold/10"
                      : "opacity-70"
                  }`}
                  animate={
                    step.status === "current"
                      ? {
                          boxShadow: [
                            "6px 6px 16px rgba(30, 42, 36, 0.12), -4px -4px 12px rgba(255, 255, 255, 1)",
                            "8px 8px 20px rgba(46, 125, 91, 0.2), -4px -4px 12px rgba(255, 255, 255, 1)",
                            "6px 6px 16px rgba(30, 42, 36, 0.12), -4px -4px 12px rgba(255, 255, 255, 1)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: step.status === "current" ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  {/* Icon */}
                  <div className="text-5xl mb-4">{step.icon}</div>

                  {/* Step number */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-mono text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Status badge */}
                  {step.status === "current" && (
                    <motion.div
                      className="absolute -top-3 -left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-body font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.12, type: "spring" }}
                    >
                      Start here
                    </motion.div>
                  )}

                  {step.status === "completed" && (
                    <div className="absolute -top-3 -left-3 bg-accent-gold text-white px-3 py-1 rounded-full text-xs font-body font-medium">
                      ✓ Done
                    </div>
                  )}
                </motion.div>

                {/* Content */}
                <motion.div
                  className={`flex-1 ${index % 2 === 0 ? "text-left" : "text-right"}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.12 }}
                >
                  <h3 className="font-body text-xl font-semibold text-text mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-base text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline badge */}
        <motion.div
          className="clay-card p-6 max-w-md mx-auto text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="text-text-muted font-body text-sm mb-2">
            Estimated Timeline
          </div>
          <div className="font-mono text-3xl font-bold text-primary">
            {roadmapData.estimatedTimeline}
          </div>
          <div className="text-text-muted font-body text-sm mt-2">
            Based on {JSON.parse(localStorage.getItem("userData") || "{}").hoursPerDay?.toLowerCase()} per day
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <button
            onClick={() => router.push("/skill-passport")}
            className="clay-button px-8 py-4 text-white font-body font-medium"
          >
            Next: Discover Your Skills →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
