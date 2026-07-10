"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SkillPassportCardProps {
  skillPassport: {
    atsScore: number;
    skills: string[];
    summary: string;
  };
}

export default function SkillPassportCard({ skillPassport }: SkillPassportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getATSScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 80) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10 h-full"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl shadow-lg"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            📋
          </motion.div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Skill Passport</h3>
            <p className="text-sm text-gray-500">Professional Profile</p>
          </div>
        </div>
      </div>

      {/* ATS Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-600">ATS Score</span>
          <motion.span
            className={`text-2xl font-bold bg-gradient-to-r ${getATSScoreColor(skillPassport.atsScore)} bg-clip-text text-transparent`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {skillPassport.atsScore}/100
          </motion.span>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getATSScoreColor(skillPassport.atsScore)} rounded-full relative`}
            initial={{ width: 0 }}
            animate={{ width: `${skillPassport.atsScore}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Core Skills</h4>
        <div className="flex flex-wrap gap-2">
          {skillPassport.skills.slice(0, isExpanded ? skillPassport.skills.length : 3).map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              {skill}
            </motion.span>
          ))}
          {skillPassport.skills.length > 3 && (
            <motion.button
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? "Show Less" : `+${skillPassport.skills.length - 3} more`}
            </motion.button>
          )}
        </div>
      </div>

      {/* Professional Summary Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Professional Summary</h4>
        <motion.div
          className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {skillPassport.summary}
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          📄 Download Resume
        </motion.button>
        
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className="py-2 px-3 bg-white/70 text-purple-700 font-medium text-sm rounded-lg border border-purple-200/50 hover:bg-white/90 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            📋 Copy Bio
          </motion.button>
          
          <motion.button
            className="py-2 px-3 bg-white/70 text-purple-700 font-medium text-sm rounded-lg border border-purple-200/50 hover:bg-white/90 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            🎤 Copy Pitch
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}