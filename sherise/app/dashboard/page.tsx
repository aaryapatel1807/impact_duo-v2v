"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    name: string;
    avatar: string;
    level: number;
    xp: number;
    maxXp: number;
  };
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
  };
  skillPassport: {
    atsScore: number;
    skills: string[];
    summary: string;
  };
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoenixProgress, setPhoenixProgress] = useState(0);

  const loadDashboardData = async () => {
    try {
      // Simple check for onboarding completion
      let userId: string = localStorage.getItem("userId") || "";
      const onboardingComplete = localStorage.getItem("onboardingComplete");
      const userData = localStorage.getItem("userData");
      
      // If no completion flag and no userData, redirect to onboarding
      if (!onboardingComplete && !userData) {
        router.push("/onboarding");
        return;
      }
      
      // If we have userData but no userId, create one
      if (!userId) {
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            const profileResponse = await fetch("/api/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: parsed.name || "User",
                email: parsed.email || `user-${Date.now()}@sherise.app`,
                age: parseInt(parsed.age || "27"),
                country: parsed.country || "India",
                educationLevel: parsed.education || "Higher Secondary",
                reasonStopped: parsed.reasonStopped || "Personal reasons",
                skills: parsed.skills || "Various skills",
                interests: parsed.interests || "Technology",
                hoursPerDay: parsed.hoursPerDay || "2-4 hours",
                internetAvailability: parsed.internetAvailability || "low",
                careerGoal: parsed.careerGoal || "Career growth",
              }),
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              userId = profileData.user?.id || `demo-${Date.now()}`;
              localStorage.setItem("userId", userId);
            } else {
              // Fallback: use demo userId
              userId = `demo-${Date.now()}`;
              localStorage.setItem("userId", userId);
            }
          } catch (error) {
            console.error("Profile creation failed:", error);
            userId = `demo-${Date.now()}`;
            localStorage.setItem("userId", userId);
          }
        } else {
          // Just use demo userId
          userId = `demo-${Date.now()}`;
          localStorage.setItem("userId", userId);
        }
      }

      // Fetch comprehensive dashboard data
      const [progressResponse, opportunitiesResponse] = await Promise.all([
        fetch(`/api/progress/${userId}`),
        fetch("/api/opportunities/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      ]);

      const progressData = progressResponse.ok ? await progressResponse.json() : null;
      const opportunitiesData = opportunitiesResponse.ok ? await opportunitiesResponse.json() : null;

      // Calculate Phoenix progress based on roadmap completion
      const roadmapProgress = progressData?.dashboard?.roadmapProgress?.progressPercentage || 0;
      setPhoenixProgress(roadmapProgress);

      // Mock comprehensive dashboard data
      const mockData: DashboardData = {
        user: {
          name: "Priya",
          avatar: "👩‍💼",
          level: Math.floor(roadmapProgress / 20) + 1,
          xp: (roadmapProgress * 10) + (progressData?.dashboard?.analytics?.totalTasks || 0) * 50,
          maxXp: 1000,
        },
        stats: {
          careerProgress: roadmapProgress,
          learningStreak: progressData?.dashboard?.currentStreak || 0,
          applications: opportunitiesData?.summary?.eligible || 0,
          skillsEarned: Math.floor(roadmapProgress / 25) + 2,
        },
        roadmap: {
          progress: roadmapProgress,
          currentStep: progressData?.dashboard?.roadmapProgress?.currentStep || 0,
          totalSteps: 5,
          milestones: [
            { id: 1, title: "Foundation Setup", status: roadmapProgress >= 20 ? "completed" : roadmapProgress > 0 ? "current" : "future", description: "Complete basic preparations" },
            { id: 2, title: "Skill Development", status: roadmapProgress >= 40 ? "completed" : roadmapProgress >= 20 ? "current" : "future", description: "Build core competencies" },
            { id: 3, title: "Portfolio Creation", status: roadmapProgress >= 60 ? "completed" : roadmapProgress >= 40 ? "current" : "future", description: "Showcase your abilities" },
            { id: 4, title: "Network Building", status: roadmapProgress >= 80 ? "completed" : roadmapProgress >= 60 ? "current" : "future", description: "Connect with opportunities" },
            { id: 5, title: "Career Launch", status: roadmapProgress >= 100 ? "completed" : roadmapProgress >= 80 ? "current" : "future", description: "Secure your comeback" },
          ],
        },
        skillPassport: {
          atsScore: 85 + Math.floor(roadmapProgress / 10),
          skills: ["Budget Management", "Communication", "Crisis Management", "Operations Planning"],
          summary: "Resourceful professional with hands-on experience in budget management and communication...",
        },
        opportunities: opportunitiesData?.matches?.eligible?.slice(0, 6).map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          organization: opp.organization,
          eligibility: opp.matchStatus || "eligible",
          deadline: opp.deadline || "TBD",
          country: Array.isArray(opp.region) ? opp.region[0] : (opp.region || "Global"),
          funding: opp.type === "scholarship" ? "Full funding" : "Various amounts",
          status: "eligible" as const,
        })) || [],
        dreamTracker: {
          todaysTask: progressData?.dashboard?.todaysTasks?.[0] || "Review your roadmap progress",
          weeklyGoal: "Complete 3 roadmap milestones and apply to 2 opportunities",
          streak: progressData?.dashboard?.currentStreak || 0,
          xp: (progressData?.dashboard?.analytics?.totalTasks || 0) * 50,
          achievements: [
            { id: "first_step", title: "First Step Taken", earned: roadmapProgress > 0, icon: "🎯" },
            { id: "streak_3", title: "3-Day Streak", earned: (progressData?.dashboard?.currentStreak || 0) >= 3, icon: "🔥" },
            { id: "skill_mapper", title: "Skill Mapper", earned: true, icon: "🗺️" },
            { id: "opportunity_hunter", title: "Opportunity Hunter", earned: (opportunitiesData?.summary?.eligible || 0) > 0, icon: "🎯" },
          ],
        },
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Set minimal mock data for demo
      setDashboardData({
        user: { name: "Priya", avatar: "👩‍💼", level: 1, xp: 150, maxXp: 1000 },
        stats: { careerProgress: 15, learningStreak: 2, applications: 3, skillsEarned: 4 },
        roadmap: {
          progress: 15,
          currentStep: 1,
          totalSteps: 5,
          milestones: [
            { id: 1, title: "Foundation Setup", status: "current", description: "Complete basic preparations" },
            { id: 2, title: "Skill Development", status: "future", description: "Build core competencies" },
            { id: 3, title: "Portfolio Creation", status: "future", description: "Showcase your abilities" },
            { id: 4, title: "Network Building", status: "future", description: "Connect with opportunities" },
            { id: 5, title: "Career Launch", status: "future", description: "Secure your comeback" },
          ],
        },
        skillPassport: { atsScore: 87, skills: ["Budget Management", "Communication"], summary: "Experienced professional..." },
        opportunities: [
          {
            id: "1",
            title: "Women Entrepreneurs Grant",
            organization: "Ministry of MSME",
            eligibility: "Women entrepreneurs",
            deadline: "2024-03-15",
            country: "India",
            funding: "₹5,00,000",
            status: "eligible" as const,
          },
          {
            id: "2", 
            title: "Digital Skills Scholarship",
            organization: "Google",
            eligibility: "Basic computer knowledge",
            deadline: "2024-02-28",
            country: "Global",
            funding: "Free course + certification",
            status: "eligible" as const,
          },
          {
            id: "3",
            title: "Small Business Loan",
            organization: "SBI Bank",
            eligibility: "Existing business plan",
            deadline: "2024-04-10",
            country: "India",
            funding: "₹2,00,000",
            status: "almost" as const,
          },
        ],
        dreamTracker: {
          todaysTask: "Complete digital literacy module",
          weeklyGoal: "Finish foundation setup",
          streak: 2,
          xp: 150,
          achievements: [
            { id: "first_step", title: "First Step Taken", earned: true, icon: "🎯" },
            { id: "streak_3", title: "3-Day Streak", earned: false, icon: "🔥" },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [router]);

  if (loading) {
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Preparing Your Dashboard</h2>
          <p className="text-gray-600">Creating your personalized experience...</p>
        </motion.div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFBFF] to-[#F8F6FF]">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-80">
          {/* Top Navbar */}
          <TopNavbar user={dashboardData.user} />

          {/* Dashboard Content */}
          <main className="p-8 pt-6">
            {/* Hero Section */}
            <HeroSection phoenixProgress={phoenixProgress} />

            {/* Stats Cards */}
            <StatsCards stats={dashboardData.stats} />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-12 gap-8 mt-8">
              {/* Left Column */}
              <div className="col-span-8 space-y-8">
                {/* Roadmap Card */}
                <RoadmapCard roadmap={dashboardData.roadmap} />
                
                {/* Skill Passport & Opportunity Cards */}
                <div className="grid grid-cols-2 gap-8">
                  <SkillPassportCard skillPassport={dashboardData.skillPassport} />
                  <DreamTrackerCard dreamTracker={dashboardData.dreamTracker} />
                </div>

                {/* Opportunity Radar */}
                <OpportunityRadar opportunities={dashboardData.opportunities} />
              </div>

              {/* Right Column */}
              <div className="col-span-4">
                <RightSidebar />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Phoenix Orb - Floating 3D element */}
      <PhoenixOrb progress={phoenixProgress} />
    </div>
  );
}