"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  description: string;
  region: string[];
  deadline: string | null;
  url: string;
  matchStatus: string;
  missingCriteria: string[];
}

export default function OpportunityRadar() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<"all" | "eligible" | "almost" | "future">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchOpportunities();
  }, [isLoaded, user, router]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/opportunities/match`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allOpps = [
          ...(data.matches?.eligible || []),
          ...(data.matches?.almost || []),
          ...(data.matches?.future || []),
        ];
        setOpportunities(allOpps);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) =>
    filter === "all" ? true : opp.matchStatus === filter
  );

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding opportunities for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Opportunity Radar</h1>
          <p className="text-gray-600">Scholarships, grants, and programs matched to your profile</p>
        </motion.div>

        {/* Filters */}
        <div className="flex justify-center space-x-4 mb-8">
          {[
            { key: "all", label: "All" },
            { key: "eligible", label: "Ready to Apply" },
            { key: "almost", label: "Almost Ready" },
            { key: "future", label: "Future Goals" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === f.key
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length === 0 ? (
          <motion.div
            className="clay-card p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Opportunities Found</h3>
            <p className="text-gray-600 mb-6">
              Complete your profile and roadmap to unlock more opportunities
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="clay-button px-6 py-3 text-white font-medium"
            >
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                className="clay-card p-6 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      opp.matchStatus === "eligible"
                        ? "bg-green-100 text-green-700"
                        : opp.matchStatus === "almost"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {opp.matchStatus === "eligible"
                      ? "✓ Eligible"
                      : opp.matchStatus === "almost"
                      ? "⚡ Almost"
                      : "🔮 Future"}
                  </span>
                  <span className="text-xs text-gray-500">{opp.type}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{opp.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{opp.organization}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{opp.description}</p>

                {opp.deadline && (
                  <div className="text-xs text-red-600 font-medium mb-4">
                    ⏰ Deadline: {opp.deadline}
                  </div>
                )}

                {opp.missingCriteria.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Missing:</p>
                    <div className="flex flex-wrap gap-1">
                      {opp.missingCriteria.slice(0, 3).map((criteria, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Learn More →
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
