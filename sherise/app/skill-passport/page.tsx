"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface LifeRole {
  id: string;
  label: string;
  skills: {
    name: string;
    justification: string;
  }[];
}

const lifeRoles: LifeRole[] = [
  {
    id: "homemaker",
    label: "Homemaker",
    skills: [
      {
        name: "Budget & Cash Flow Management",
        justification: "Managing household expenses requires tracking income, prioritizing needs, and planning for irregular costs — the same skills financial analysts use.",
      },
    ],
  },
  {
    id: "caregiver",
    label: "Caregiver",
    skills: [
      {
        name: "Crisis Management & Problem-Solving",
        justification: "Responding to urgent needs, staying calm under pressure, and making quick decisions are core leadership competencies.",
      },
    ],
  },
  {
    id: "cook",
    label: "Cook",
    skills: [
      {
        name: "Operations & Resource Planning",
        justification: "Coordinating multiple dishes, timing, and ingredient prep is operations management — used in restaurants, catering, and supply chains.",
      },
    ],
  },
  {
    id: "tutor",
    label: "Tutor / Teacher",
    skills: [
      {
        name: "Communication & Instructional Design",
        justification: "Breaking complex ideas into simple steps and adapting to different learning styles is what professional educators and trainers do.",
      },
    ],
  },
  {
    id: "tailor",
    label: "Tailor / Craftsperson",
    skills: [
      {
        name: "Entrepreneurship & Production Management",
        justification: "Taking orders, managing materials, meeting deadlines, and pricing work are small business operations — the foundation of entrepreneurship.",
      },
    ],
  },
  {
    id: "organizer",
    label: "Community Organizer",
    skills: [
      {
        name: "Stakeholder Coordination & Networking",
        justification: "Bringing people together, building consensus, and managing group activities are key project management and leadership skills.",
      },
    ],
  },
];

interface GeneratedContent {
  resume: string;
  bio: string;
  pitch: string;
}

// Mock function - will be replaced with actual AI call
function generateMockContent(selectedSkills: string[]): GeneratedContent {
  return {
    resume: `Resourceful professional with hands-on experience in ${selectedSkills.slice(0, 2).join(" and ").toLowerCase()}. Proven track record of managing complex responsibilities while maintaining quality and efficiency. Strong problem-solving abilities developed through real-world application. Seeking opportunities to apply practical skills in a professional setting and contribute to organizational growth.`,
    bio: `I'm a dedicated professional who has built valuable expertise through managing a household, tutoring students, and running a small tailoring business. My experience has taught me ${selectedSkills[0]?.toLowerCase()}, effective communication, and adaptability. I'm now looking to transition these real-world skills into formal career opportunities where I can grow and make an impact.`,
    pitch: `"I've spent years managing budgets, teaching children, and running a small business — all while adapting to changing needs and solving problems on the fly. I bring practical experience in ${selectedSkills[0]?.toLowerCase()} and a proven ability to learn quickly and deliver results. I'm ready to bring that same dedication and skill to your team."`,
  };
}

export default function SkillPassport() {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [revealedSkills, setRevealedSkills] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [showContent, setShowContent] = useState(false);

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
      setRevealedSkills(revealedSkills.filter((id) => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
      // Trigger reveal animation after a short delay
      setTimeout(() => {
        setRevealedSkills([...revealedSkills, roleId]);
      }, 100);
    }
  };

  const handleGenerate = () => {
    const allSkillNames = selectedRoles.flatMap(
      (roleId) => lifeRoles.find((r) => r.id === roleId)?.skills.map((s) => s.name) || []
    );
    const content = generateMockContent(allSkillNames);
    setGeneratedContent(content);
    setShowContent(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
            Your Skill Passport
          </h1>
          <p className="font-body text-base text-text-muted max-w-2xl mx-auto">
            Your lived experience is professional expertise. Let's prove it.
          </p>
        </motion.div>

        {/* Instruction card */}
        <motion.div
          className="clay-card p-6 mb-8 bg-accent-plum/5 border-l-4 border-accent-plum"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="font-body text-base text-text">
            Select the roles that describe your experience. Watch them transform into professional skills.
          </p>
        </motion.div>

        {/* Life roles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {lifeRoles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
            >
              <button
                onClick={() => handleRoleToggle(role.id)}
                className={`w-full clay-card p-6 text-left transition-all duration-300 ${
                  selectedRoles.includes(role.id)
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:ring-2 hover:ring-primary-light"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body text-lg font-semibold text-text">
                    {role.label}
                  </h3>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedRoles.includes(role.id)
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedRoles.includes(role.id) && (
                      <motion.svg
                        className="w-4 h-4 text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {revealedSkills.includes(role.id) && (
                    <motion.div
                      initial={{ opacity: 0, rotateY: -90, height: 0 }}
                      animate={{ opacity: 1, rotateY: 0, height: "auto" }}
                      exit={{ opacity: 0, rotateY: 90, height: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="origin-left"
                    >
                      <div className="pt-4 border-t border-border">
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                            Professional Skill
                          </span>
                        </div>
                        <h4 className="font-body font-semibold text-primary mb-2">
                          {role.skills[0].name}
                        </h4>
                        <p className="font-body text-sm text-text-muted leading-relaxed">
                          {role.skills[0].justification}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Generate button */}
        {selectedRoles.length > 0 && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleGenerate}
              className="clay-button px-10 py-4 text-white font-body font-medium text-lg"
            >
              Generate My Professional Profile
            </button>
            <p className="mt-3 text-sm text-text-muted">
              {selectedRoles.length} {selectedRoles.length === 1 ? "skill" : "skills"} selected
            </p>
          </motion.div>
        )}

        {/* Generated content */}
        <AnimatePresence>
          {showContent && generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Resume Summary */}
              <div className="clay-card p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-body text-xl font-semibold text-accent-plum">
                    Resume Summary
                  </h3>
                  <button
                    onClick={() => copyToClipboard(generatedContent.resume)}
                    className="px-4 py-2 text-sm font-body font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="font-body text-base text-text leading-relaxed">
                  {generatedContent.resume}
                </p>
              </div>

              {/* LinkedIn Bio */}
              <div className="clay-card p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-body text-xl font-semibold text-accent-plum">
                    LinkedIn-Style Bio
                  </h3>
                  <button
                    onClick={() => copyToClipboard(generatedContent.bio)}
                    className="px-4 py-2 text-sm font-body font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="font-body text-base text-text leading-relaxed">
                  {generatedContent.bio}
                </p>
              </div>

              {/* Elevator Pitch */}
              <div className="clay-card p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-body text-xl font-semibold text-accent-plum">
                    30-Second Elevator Pitch
                  </h3>
                  <button
                    onClick={() => copyToClipboard(generatedContent.pitch)}
                    className="px-4 py-2 text-sm font-body font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="font-body text-base text-text leading-relaxed italic">
                  {generatedContent.pitch}
                </p>
              </div>

              {/* Navigation */}
              <motion.div
                className="flex justify-center pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => router.push("/opportunity-radar")}
                  className="clay-button px-8 py-4 text-white font-body font-medium"
                >
                  Next: Find Opportunities →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
