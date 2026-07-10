"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface SkillEntry {
  lifeRole: string;
  mappedSkill: string;
  justification: string;
}

interface GeneratedContent {
  resumeSummary: string;
  bio: string;
  elevatorPitch: string;
  atsScore: number;
}

export default function SkillPassport() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchSkillPassport();
  }, [isLoaded, user, router]);

  const fetchSkillPassport = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/skill-passport");
      
      if (response.ok) {
        const data = await response.json();
        if (data.skillEntries) {
          setSkillEntries(data.skillEntries);
        }
        if (data.generatedContent) {
          setGeneratedContent({
            resumeSummary: data.generatedContent.resumeSummary || "",
            bio: data.generatedContent.bio || "",
            elevatorPitch: data.generatedContent.elevatorPitch || "",
            atsScore: 85,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching skill passport:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassport = async () => {
    // Default roles if none selected
    const rolesToSend = selectedRoles.length > 0 ? selectedRoles : ['homemaker', 'caregiver', 'tutor'];
    
    try {
      setGenerating(true);
      const response = await fetch("/api/skill-passport/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRoles: rolesToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkillEntries(data.skillEntries || data.mappings || []);
        setGeneratedContent({
          resumeSummary: data.generatedContent?.resumeSummary || data.resumeSummary || "",
          bio: data.generatedContent?.bio || data.bio || "",
          elevatorPitch: data.generatedContent?.elevatorPitch || data.elevatorPitch || "",
          atsScore: 85,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to generate skill passport: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error generating skill passport:", error);
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
          <p className="text-gray-600">Loading your skill passport...</p>
        </div>
      </div>
    );
  }

  if (skillEntries.length === 0 && !generatedContent) {
    const availableRoles = [
      { id: 'homemaker', label: 'Homemaker' },
      { id: 'caregiver', label: 'Caregiver' },
      { id: 'cook', label: 'Cook' },
      { id: 'tutor', label: 'Tutor' },
      { id: 'tailor', label: 'Tailor' },
      { id: 'organizer', label: 'Organizer' },
    ];

    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="clay-card p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">📋</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Skill Passport
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your life experiences into professional skills that employers value.
            </p>
            
            {/* Role Selection */}
            <div className="mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select your life roles:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoles((prev) =>
                        prev.includes(role.id)
                          ? prev.filter((r) => r !== role.id)
                          : [...prev, role.id]
                      );
                    }}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      selectedRoles.includes(role.id)
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generatePassport}
              disabled={generating || selectedRoles.length === 0}
              className="clay-button px-8 py-4 text-white font-medium disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Skill Passport"}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Skill Passport</h1>
          <p className="text-gray-600">Professional assets derived from your life experience</p>
        </motion.div>

        {/* ATS Score */}
        {generatedContent && (
          <motion.div
            className="clay-card p-8 mb-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-block">
              <div className="text-6xl font-bold text-purple-600 mb-2">
                {generatedContent.atsScore}%
              </div>
              <p className="text-gray-600 font-medium">ATS Compatibility Score</p>
            </div>
          </motion.div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              className="clay-card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resume Summary</h3>
              <p className="text-gray-700 leading-relaxed">{generatedContent.resumeSummary}</p>
            </motion.div>

            <motion.div
              className="clay-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">LinkedIn Bio</h3>
              <p className="text-gray-700 leading-relaxed">{generatedContent.bio}</p>
            </motion.div>

            <motion.div
              className="clay-card p-6 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Elevator Pitch</h3>
              <p className="text-gray-700 leading-relaxed">{generatedContent.elevatorPitch}</p>
            </motion.div>
          </div>
        )}

        {/* Skill Mappings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Life Skills → Professional Skills</h2>
          {skillEntries.map((entry, index) => (
            <motion.div
              key={index}
              className="clay-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {entry.lifeRole}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      {entry.mappedSkill}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{entry.justification}</p>
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
            onClick={generatePassport}
            disabled={generating}
            className="clay-button px-6 py-3 text-white font-medium disabled:opacity-50"
          >
            {generating ? "Regenerating..." : "Regenerate Passport"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
