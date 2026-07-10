"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import HeroSection from "@/components/dashboard/HeroSection";
import StatsCards from "@/components/dashboard/StatsCards";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import SkillPassportCard from "@/components/dashboard/SkillPassportCard";
import OpportunityRadar from "@/components/dashboard/OpportunityRadar";
import DreamTrackerCard from "@/components/dashboard/DreamTrackerCard";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { PhoenixOrb } from "@/components/dashboard/PhoenixOrb";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
    level: number;
    xp: number;
    maxXp: number;
  };
  hasProfile: boolean;
  stats: {
    careerProgress: number;
    learningStreak: number;
    applications: number;
    skillsEarned: number;
  };
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
  } | null;
  skillPassport: {
    atsScore: number;
    skills: string[];
    summary: string;
  } | null;
  opportunities: Array<{
    id: string;
    title: string;
    organization: string;
    eligibility: string;
    deadline: string;
    country: string;
    funding: string;
    status: "eligible" | "almost" | "future";
  }>;
  dreamTracker: {
    todaysTask: string;
    weeklyGoal: string;
    streak: number;
    xp: number;
    achievements: Array<{
      id: string;
      title: string;
      earned: boolean;
      icon: string;
    }>;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhoenixMenu, setShowPhoenixMenu] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!clerkUser) {
      router.push("/sign-in");
      return;
    }

    loadDashboardData();
  }, [isLoaded, clerkUser, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      if (!profileData.success) {
        throw new Error(profileData.error || "Failed to load profile");
      }

      const hasProfile = !!profileData.user?.profile;

      // If no profile, redirect to onboarding
      if (!hasProfile) {
        router.push("/onboarding");
        return;
      }

      // Fetch progress data
      const progressRes = await fetch("/api/progress");
      const progressData = progressRes.ok ? await progressRes.json() : null;

      // Fetch roadmap
      const roadmapRes = await fetch("/api/roadmap");
      const roadmapData = roadmapRes.ok ? await roadmapRes.json() : null;

      // Fetch skill passport
      const skillPassportRes = await fetch("/api/skill-passport");
      const skillPassportData = skillPassportRes.ok ? await skillPassportRes.json() : null;

      // Fetch matched opportunities
      const opportunitiesRes = await fetch("/api/opportunities/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const opportunitiesData = opportunitiesRes.ok ? await opportunitiesRes.json() : null;

      // Calculate real statistics
      const roadmapProgress = 0; // Roadmap doesn't have completionPercent yet
      const currentStreak = progressData?.dashboard?.currentStreak || 0;
      const totalXP = progressData?.dashboard?.analytics?.totalXP || 0;
      const eligibleOpportunities = opportunitiesData?.matches?.eligible || [];
      
      // Build dashboard data from REAL database values
      const data: DashboardData = {
        user: {
          id: clerkUser!.id,
          name: clerkUser!.fullName || clerkUser!.emailAddresses[0]?.emailAddress.split('@')[0] || "User",
          email: clerkUser!.emailAddresses[0]?.emailAddress || "",
          imageUrl: clerkUser!.imageUrl,
          level: Math.floor(totalXP / 1000) + 1,
          xp: totalXP % 1000,
          maxXp: 1000,
        },
        hasProfile,
        stats: {
          careerProgress: roadmapProgress,
          learningStreak: currentStreak,
          applications: eligibleOpportunities.length,
          skillsEarned: skillPassportData?.skillEntries?.length || 0,
        },
        roadmap: roadmapData?.roadmap ? {
          progress: 0,
          currentStep: 0,
          totalSteps: 5,
          milestones: generateMilestones(roadmapData.roadmap),
        } : null,
        skillPassport: skillPassportData?.generatedContent ? {
          atsScore: 85,
          skills: skillPassportData.skillEntries?.map((e: any) => e.mappedSkill) || [],
          summary: skillPassportData.generatedContent.resumeSummary || "",
        } : null,
        opportunities: eligibleOpportunities.slice(0, 6).map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          organization: opp.organization,
          eligibility: opp.matchStatus || "eligible",
          deadline: opp.deadline || "Rolling",
          country: Array.isArray(opp.region) ? opp.region[0] : opp.region || "Global",
          funding: opp.funding || "Various",
          status: "eligible" as const,
        })),
        dreamTracker: {
          todaysTask: progressData?.dashboard?.todaysTasks?.[0] || "Complete your onboarding",
          weeklyGoal: "Complete 3 roadmap steps",
          streak: currentStreak,
          xp: totalXP,
          achievements: calculateAchievements(roadmapProgress, currentStreak, eligibleOpportunities.length),
        },
      };

      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Generate roadmap milestones
  function generateMilestones(roadmap: any) {
    const progress = roadmap.completionPercent || 0;
    const milestones = [
      { id: 1, title: "Foundation Setup", description: "Complete basic preparations" },
      { id: 2, title: "Skill Development", description: "Build core competencies" },
      { id: 3, title: "Portfolio Creation", description: "Showcase your abilities" },
      { id: 4, title: "Network Building", description: "Connect with opportunities" },
      { id: 5, title: "Career Launch", description: "Secure your comeback" },
    ];

    return milestones.map((m, i) => ({
      ...m,
      status: progress >= (i + 1) * 20 ? "completed" : progress >= i * 20 ? "current" : "future",
    })) as Array<{ id: number; title: string; status: "completed" | "current" | "future"; description: string }>;
  }

  // Helper: Calculate achievements
  function calculateAchievements(progress: number, streak: number, opportunities: number) {
    return [
      { id: "first_step", title: "First Step", earned: progress > 0, icon: "🎯" },
      { id: "streak_3", title: "3-Day Streak", earned: streak >= 3, icon: "🔥" },
      { id: "skill_mapper", title: "Skill Mapper", earned: progress >= 20, icon: "🗺️" },
      { id: "opportunity_hunter", title: "Opportunity Hunter", earned: opportunities > 0, icon: "🎯" },
    ];
  }

  // Loading State
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFBFF] to-[#F8F6FF] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-4xl">🔮</span>
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Your Dashboard</h2>
          <p className="text-gray-600">Preparing your personalized experience...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFBFF] to-[#F8F6FF] flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // No Data - Should not happen if auth works
  if (!dashboardData) {
    return null;
  }

  const phoenixProgress = dashboardData.roadmap?.progress || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFBFF] to-[#F8F6FF]">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Layout */}
      <div className="flex">
        <Sidebar />

        <div className="flex-1 ml-80">
          <TopNavbar user={{ name: dashboardData.user.name, avatar: dashboardData.user.imageUrl || '' }} />

          <main className="p-8 pt-6">
            <HeroSection phoenixProgress={phoenixProgress} />
            <StatsCards stats={dashboardData.stats} />

            <div className="grid grid-cols-12 gap-8 mt-8">
              <div className="col-span-8 space-y-8">
                {dashboardData.roadmap ? (
                  <RoadmapCard roadmap={dashboardData.roadmap} />
                ) : (
                  <EmptyRoadmap />
                )}
                
                <div className="grid grid-cols-2 gap-8">
                  {dashboardData.skillPassport ? (
                    <SkillPassportCard skillPassport={dashboardData.skillPassport} />
                  ) : (
                    <EmptySkillPassport />
                  )}
                  <DreamTrackerCard dreamTracker={dashboardData.dreamTracker} />
                </div>

                <OpportunityRadar opportunities={dashboardData.opportunities} />
              </div>

              <div className="col-span-4">
                <RightSidebar />
              </div>
            </div>
          </main>
        </div>
      </div>

      <PhoenixOrb 
        progress={phoenixProgress} 
        onClick={() => setShowPhoenixMenu(!showPhoenixMenu)}
      />

      {/* Phoenix Menu */}
      {showPhoenixMenu && (
        <motion.div
          className="fixed bottom-40 right-8 z-50 bg-white/95 backdrop-blur-xl border border-purple-200 rounded-2xl shadow-2xl p-4 min-w-48"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
        >
          <div className="space-y-2">
            <button
              onClick={() => {
                router.push("/roadmap");
                setShowPhoenixMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium"
            >
              📊 View Roadmap
            </button>
            <button
              onClick={() => {
                router.push("/skill-passport");
                setShowPhoenixMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium"
            >
              📋 Skill Passport
            </button>
            <button
              onClick={() => {
                router.push("/opportunity-radar");
                setShowPhoenixMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium"
            >
              🎯 Opportunities
            </button>
            <button
              onClick={() => {
                router.push("/dream-tracker");
                setShowPhoenixMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium"
            >
              💭 Dream Tracker
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Empty State Components
function EmptyRoadmap() {
  const router = useRouter();
  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Roadmap Yet</h3>
      <p className="text-gray-600 mb-6">Generate your personalized AI roadmap to get started</p>
      <button
        onClick={() => router.push("/roadmap")}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Generate Roadmap
      </button>
    </motion.div>
  );
}

function EmptySkillPassport() {
  const router = useRouter();
  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-4xl mb-3">📋</div>
      <h4 className="font-bold text-gray-800 mb-2">No Skill Passport</h4>
      <p className="text-sm text-gray-600 mb-4">Transform your life skills into professional assets</p>
      <button
        onClick={() => router.push("/skill-passport")}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        Create Passport
      </button>
    </motion.div>
  );
}
