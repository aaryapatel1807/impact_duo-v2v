"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface OpportunityRadarProps {
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
}

export default function OpportunityRadar({ opportunities }: OpportunityRadarProps) {
  const [filter, setFilter] = useState<"all" | "eligible" | "almost" | "future">("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "eligible":
        return {
          bg: "from-green-500 to-emerald-500",
          text: "text-green-700",
          bgLight: "from-green-50 to-emerald-50",
          border: "border-green-200",
        };
      case "almost":
        return {
          bg: "from-yellow-500 to-orange-500",
          text: "text-yellow-700",
          bgLight: "from-yellow-50 to-orange-50",
          border: "border-yellow-200",
        };
      default:
        return {
          bg: "from-gray-400 to-gray-500",
          text: "text-gray-600",
          bgLight: "from-gray-50 to-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const filteredOpportunities = opportunities.filter(
    (opp) => filter === "all" || opp.status === filter
  );

  const opportunityCount = {
    eligible: opportunities.filter((o) => o.status === "eligible").length,
    almost: opportunities.filter((o) => o.status === "almost").length,
    future: opportunities.filter((o) => o.status === "future").length,
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/10"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <motion.div
            className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            🎯
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Opportunity Radar</h2>
            <p className="text-gray-600">Matched opportunities for you</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4">
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <p className="text-2xl font-bold text-green-600">{opportunityCount.eligible}</p>
            <p className="text-xs text-gray-500">Ready</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <p className="text-2xl font-bold text-yellow-600">{opportunityCount.almost}</p>
            <p className="text-xs text-gray-500">Almost</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            <p className="text-2xl font-bold text-gray-500">{opportunityCount.future}</p>
            <p className="text-xs text-gray-500">Future</p>
          </motion.div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6">
        {[
          { key: "all", label: "All", count: opportunities.length },
          { key: "eligible", label: "Ready to Apply", count: opportunityCount.eligible },
          { key: "almost", label: "Almost Ready", count: opportunityCount.almost },
          { key: "future", label: "Future Goals", count: opportunityCount.future },
        ].map((tab, index) => (
          <motion.button
            key={tab.key}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
              filter === tab.key
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white/50 text-gray-600 hover:bg-white/70"
            }`}
            onClick={() => setFilter(tab.key as any)}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {tab.label} ({tab.count})
          </motion.button>
        ))}
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No opportunities found</h3>
          <p className="text-gray-500">Complete more roadmap steps to unlock opportunities!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.slice(0, 6).map((opportunity, index) => {
            const colors = getStatusColor(opportunity.status);
            
            return (
              <motion.div
                key={opportunity.id}
                className={`bg-gradient-to-br ${colors.bgLight} border ${colors.border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <motion.span
                    className={`px-3 py-1 bg-gradient-to-r ${colors.bg} text-white text-xs font-semibold rounded-full shadow-lg`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  >
                    {(opportunity.status || "eligible").charAt(0).toUpperCase() + (opportunity.status || "eligible").slice(1)}
                  </motion.span>
                  
                  {opportunity.funding && (
                    <span className="text-sm font-bold text-gray-700">
                      {opportunity.funding}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                  {opportunity.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {opportunity.organization}
                </p>
                
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {opportunity.eligibility}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {opportunity.deadline && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="text-red-500">⏰</span>
                      <span>Deadline: {opportunity.deadline}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-blue-500">🌍</span>
                    <span>{opportunity.country}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <motion.button
                    className={`flex-1 py-2 px-4 bg-gradient-to-r ${colors.bg} text-white font-semibold rounded-lg text-sm shadow-lg hover:shadow-xl transition-all duration-300`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {opportunity.status === "eligible" ? "Apply Now" : "View Details"}
                  </motion.button>
                  
                  <motion.button
                    className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg">💾</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View More Button */}
      {filteredOpportunities.length > 6 && (
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View All {opportunities.length} Opportunities
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}