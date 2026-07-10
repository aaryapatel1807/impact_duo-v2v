"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: "scholarship" | "grant" | "internship" | "job" | "program";
  description: string;
  eligibility: {
    ageMin?: number;
    ageMax?: number;
    education: string[];
    region: string[];
    skills?: string[];
  };
  deadline?: string;
  link: string;
}

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Women in Tech Scholarship",
    organization: "IEEE WiE",
    type: "scholarship",
    description: "Full scholarship for women pursuing STEM education, includes laptop and internet stipend",
    eligibility: {
      ageMin: 18,
      ageMax: 35,
      education: ["Higher Secondary (Grade 11-12)", "Some College", "Bachelor's Degree"],
      region: ["India", "Global"],
    },
    deadline: "March 2026",
    link: "https://wie.ieee.org",
  },
  {
    id: "2",
    title: "Digital Sakhi Program",
    organization: "Ministry of Rural Development",
    type: "program",
    description: "Government program training women as digital literacy ambassadors in rural communities",
    eligibility: {
      ageMin: 18,
      ageMax: 45,
      education: ["Secondary (Grade 9-10)", "Higher Secondary (Grade 11-12)"],
      region: ["India"],
    },
    deadline: "Ongoing",
    link: "https://rural.gov.in",
  },
  {
    id: "3",
    title: "Freelance Content Writing",
    organization: "Upwork / Fiverr",
    type: "job",
    description: "Remote writing opportunities for blogs, social media, and educational content",
    eligibility: {
      education: ["Higher Secondary (Grade 11-12)", "Some College", "Bachelor's Degree"],
      region: ["Global"],
      skills: ["Communication & Instructional Design"],
    },
    link: "https://upwork.com",
  },
  {
    id: "4",
    title: "MUDRA Loan for Women Entrepreneurs",
    organization: "MUDRA / SIDBI",
    type: "grant",
    description: "Micro-financing up to ₹10 lakh for women-owned small businesses, no collateral",
    eligibility: {
      ageMin: 18,
      education: ["Primary (Grade 1-8)", "Secondary (Grade 9-10)", "Higher Secondary (Grade 11-12)"],
      region: ["India"],
      skills: ["Entrepreneurship & Production Management"],
    },
    deadline: "Ongoing",
    link: "https://mudra.org.in",
  },
  {
    id: "5",
    title: "Virtual Assistant Bootcamp",
    organization: "SheMeansBusiness (Meta)",
    type: "program",
    description: "Free 6-week training in remote administrative work, includes job placement support",
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      education: ["Higher Secondary (Grade 11-12)", "Some College"],
      region: ["India", "Southeast Asia"],
    },
    deadline: "January 2026",
    link: "https://facebook.com/business",
  },
  {
    id: "6",
    title: "Online Tutoring Platform",
    organization: "Vedantu / Byju's",
    type: "job",
    description: "Part-time online teaching for K-12 students, flexible hours",
    eligibility: {
      education: ["Higher Secondary (Grade 11-12)", "Some College", "Bachelor's Degree"],
      region: ["India"],
      skills: ["Communication & Instructional Design"],
    },
    link: "https://vedantu.com/careers",
  },
  {
    id: "7",
    title: "Women Entrepreneurship Platform",
    organization: "NITI Aayog",
    type: "program",
    description: "Incubation support, mentorship, and funding access for women-led startups",
    eligibility: {
      ageMin: 21,
      education: ["Higher Secondary (Grade 11-12)", "Some College", "Bachelor's Degree"],
      region: ["India"],
      skills: ["Entrepreneurship & Production Management"],
    },
    deadline: "Ongoing",
    link: "https://niti.gov.in",
  },
  {
    id: "8",
    title: "Coursera Financial Aid",
    organization: "Coursera",
    type: "scholarship",
    description: "100% financial aid for professional certificates in tech, business, and data",
    eligibility: {
      ageMin: 16,
      education: ["Higher Secondary (Grade 11-12)", "Some College", "Bachelor's Degree", "Secondary (Grade 9-10)"],
      region: ["Global"],
    },
    deadline: "Apply anytime",
    link: "https://coursera.org/financial-aid",
  },
  {
    id: "9",
    title: "Community Health Worker",
    organization: "Local NGOs / ASHA",
    type: "job",
    description: "Part-time work providing health education and support in local communities",
    eligibility: {
      ageMin: 21,
      ageMax: 45,
      education: ["Secondary (Grade 9-10)", "Higher Secondary (Grade 11-12)"],
      region: ["India"],
      skills: ["Crisis Management & Problem-Solving"],
    },
    link: "https://nhm.gov.in/asha",
  },
  {
    id: "10",
    title: "Etsy / Amazon Handmade Seller",
    organization: "E-commerce Platforms",
    type: "job",
    description: "Sell handmade crafts globally through online marketplaces",
    eligibility: {
      education: ["Primary (Grade 1-8)", "Secondary (Grade 9-10)", "Higher Secondary (Grade 11-12)"],
      region: ["Global"],
      skills: ["Entrepreneurship & Production Management"],
    },
    link: "https://etsy.com",
  },
];

type MatchStatus = "eligible" | "almost" | "future";

interface MatchedOpportunity extends Opportunity {
  matchStatus: MatchStatus;
  missingCriteria?: string[];
}

export default function OpportunityRadar() {
  const router = useRouter();
  const [matchedOpportunities, setMatchedOpportunities] = useState<{
    eligible: MatchedOpportunity[];
    almost: MatchedOpportunity[];
    future: MatchedOpportunity[];
  }>({ eligible: [], almost: [], future: [] });

  useEffect(() => {
    const matchOpportunities = async () => {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        router.push("/onboarding");
        return;
      }

      try {
        // Get userId from localStorage  
        let userId = localStorage.getItem("userId");
        if (!userId) {
          // Create user profile first
          const parsed = JSON.parse(userData);
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

        // Use real opportunity matching API
        const matchResponse = await fetch("/api/opportunities/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!matchResponse.ok) {
          throw new Error("Failed to match opportunities");
        }

        const matchData = await matchResponse.json();
        
        if (matchData.success && matchData.matches) {
          // Convert API response to expected format
          setMatchedOpportunities({
            eligible: matchData.matches.eligible.map((opp: any) => ({
              ...opp,
              id: opp.id,
              eligibility: {
                ageMin: opp.minAge,
                ageMax: opp.maxAge,
                education: opp.minEducation,
                region: opp.region,
                skills: opp.tags,
              },
              link: opp.url,
            })),
            almost: matchData.matches.almost.map((opp: any) => ({
              ...opp,
              id: opp.id,
              eligibility: {
                ageMin: opp.minAge,
                ageMax: opp.maxAge,
                education: opp.minEducation,
                region: opp.region,
                skills: opp.tags,
              },
              link: opp.url,
            })),
            future: matchData.matches.future.map((opp: any) => ({
              ...opp,
              id: opp.id,
              eligibility: {
                ageMin: opp.minAge,
                ageMax: opp.maxAge,
                education: opp.minEducation,
                region: opp.region,
                skills: opp.tags,
              },
              link: opp.url,
            })),
          });
        } else {
          // Fallback to mock matching logic
          fallbackToMockMatching(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error matching opportunities:", error);
        // Fallback to mock matching logic
        const userData = localStorage.getItem("userData");
        if (userData) {
          fallbackToMockMatching(JSON.parse(userData));
        }
      }
    };

    const fallbackToMockMatching = (user: any) => {
      const userAge = parseInt(user.age);
      const userEducation = user.education;
      const userCountry = user.country;
      const userSkills = user.skills.toLowerCase();

      const matched = opportunities.map((opp) => {
        const missing: string[] = [];
        let matches = 0;
        let total = 0;

        // Check age
        if (opp.eligibility.ageMin || opp.eligibility.ageMax) {
          total++;
          if (
            (!opp.eligibility.ageMin || userAge >= opp.eligibility.ageMin) &&
            (!opp.eligibility.ageMax || userAge <= opp.eligibility.ageMax)
          ) {
            matches++;
          } else {
            missing.push("Age requirement");
          }
        }

        // Check education
        total++;
        if (opp.eligibility.education.includes(userEducation)) {
          matches++;
        } else {
          missing.push("Education level");
        }

        // Check region
        total++;
        if (
          opp.eligibility.region.includes(userCountry) ||
          opp.eligibility.region.includes("Global")
        ) {
          matches++;
        } else {
          missing.push("Location");
        }

        // Check skills (optional)
        if (opp.eligibility.skills) {
          total++;
          const hasSkill = opp.eligibility.skills.some((skill) =>
            userSkills.includes(skill.toLowerCase().substring(0, 15))
          );
          if (hasSkill) {
            matches++;
          } else {
            missing.push("Specific skill");
          }
        }

        // Determine match status
        let matchStatus: MatchStatus;
        if (matches === total) {
          matchStatus = "eligible";
        } else if (matches >= total - 1) {
          matchStatus = "almost";
        } else {
          matchStatus = "future";
        }

        return { ...opp, matchStatus, missingCriteria: missing };
      });

      setMatchedOpportunities({
        eligible: matched.filter((m) => m.matchStatus === "eligible"),
        almost: matched.filter((m) => m.matchStatus === "almost"),
        future: matched.filter((m) => m.matchStatus === "future"),
      });
    };

    matchOpportunities();
  }, [router]);

  const OpportunityCard = ({ opp }: { opp: MatchedOpportunity }) => (
    <motion.div
      className="clay-card p-6 h-full flex flex-col"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Type badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-body font-medium ${
            opp.type === "scholarship"
              ? "bg-accent-gold/20 text-accent-gold"
              : opp.type === "grant"
              ? "bg-primary/20 text-primary"
              : opp.type === "program"
              ? "bg-accent-plum/20 text-accent-plum"
              : "bg-primary-light/20 text-primary"
          }`}
        >
          {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-body text-lg font-semibold text-text mb-2">
        {opp.title}
      </h3>

      {/* Organization */}
      <p className="text-sm text-text-muted mb-3">{opp.organization}</p>

      {/* Description */}
      <p className="font-body text-sm text-text-muted leading-relaxed mb-4 flex-grow">
        {opp.description}
      </p>

      {/* Missing criteria (for almost/future) */}
      {opp.missingCriteria && opp.missingCriteria.length > 0 && (
        <div className="mb-4 p-3 bg-accent-gold/10 rounded-lg">
          <p className="text-xs font-body font-medium text-text-muted mb-1">
            To unlock:
          </p>
          <p className="text-xs text-text-muted">
            {opp.missingCriteria.join(", ")}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {opp.deadline && (
          <span className="text-xs font-mono text-text-muted">
            {opp.deadline}
          </span>
        )}
        <a
          href={opp.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-body font-medium text-primary hover:underline"
        >
          Learn more →
        </a>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-2xl font-medium text-text mb-4">
            Opportunity Radar
          </h1>
          <p className="font-body text-base text-text-muted max-w-2xl mx-auto">
            Real opportunities matched to your profile — automatically updated as you progress
          </p>
        </motion.div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eligible Now */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-6 p-4 bg-accent-gold/10 rounded-2xl">
              <h2 className="font-body text-xl font-semibold text-accent-gold mb-1">
                Eligible Now
              </h2>
              <p className="text-sm text-text-muted">
                {matchedOpportunities.eligible.length} opportunities ready to apply
              </p>
            </div>
            <div className="space-y-4">
              {matchedOpportunities.eligible.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <OpportunityCard opp={opp} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Almost Eligible */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-6 p-4 bg-bg rounded-2xl border-2 border-border">
              <h2 className="font-body text-xl font-semibold text-text mb-1">
                Almost Eligible
              </h2>
              <p className="text-sm text-text-muted">
                {matchedOpportunities.almost.length} opportunities — one step away
              </p>
            </div>
            <div className="space-y-4">
              {matchedOpportunities.almost.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <OpportunityCard opp={opp} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Future Eligible */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6 p-4 bg-primary-light/10 rounded-2xl">
              <h2 className="font-body text-xl font-semibold text-primary mb-1">
                Future Eligible
              </h2>
              <p className="text-sm text-text-muted">
                {matchedOpportunities.future.length} opportunities unlocking soon
              </p>
            </div>
            <div className="space-y-4">
              {matchedOpportunities.future.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <OpportunityCard opp={opp} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => router.push("/dream-tracker")}
            className="clay-button px-8 py-4 text-white font-body font-medium"
          >
            Next: Track Your Progress →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
