"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

interface OnboardingData {
  age: string;
  country: string;
  education: string;
  reasonStopped: string;
  skills: string;
  interests: string;
  hoursPerDay: string;
  internetAvailability: "none" | "low" | "stable";
  careerGoal: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState<OnboardingData>({
    age: "",
    country: "",
    education: "",
    reasonStopped: "",
    skills: "",
    interests: "",
    hoursPerDay: "",
    internetAvailability: "low",
    careerGoal: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent premature submission if the user presses "Enter" in an input field
    if (currentStep < totalSteps - 1) {
      handleNext();
      return;
    }
    
    if (!isLoaded || !user) {
      alert("Please sign in to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Save profile to backend using authenticated user
      const parsedAge = parseInt(formData.age, 10);
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          age: isNaN(parsedAge) ? formData.age : parsedAge,
          country: formData.country,
          educationLevel: formData.education,
          reasonStopped: formData.reasonStopped,
          skills: formData.skills,
          interests: formData.interests,
          hoursPerDay: formData.hoursPerDay,
          internetAvailability: formData.internetAvailability,
          careerGoal: formData.careerGoal,
        }),
      });

      if (!response.ok) {
        // Surface the real validation error from the API
        const errorData = await response.json().catch(() => ({}));
        const details = errorData.details?.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(", ");
        const message = details ? `Validation error: ${details}` : (errorData.error || "Failed to save profile");
        throw new Error(message);
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error instanceof Error ? error.message : "Failed to save your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Validate required fields for the current step
    let isValid = true;
    switch (currentStep) {
      case 0:
        if (!formData.age || !formData.country || !formData.education) isValid = false;
        break;
      case 1:
        if (!formData.reasonStopped) isValid = false;
        break;
      case 2:
        if (!formData.skills || !formData.interests) isValid = false;
        break;
      case 3:
        if (!formData.hoursPerDay || !formData.internetAvailability) isValid = false;
        break;
    }

    if (!isValid) {
      alert("Please fill in all required fields to continue.");
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      {/* Show loading while checking auth */}
      {!isLoaded && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Require authentication */}
      {isLoaded && !user && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to complete your onboarding.</p>
            <button
              onClick={() => router.push("/")}
              className="clay-button px-8 py-3 text-white font-body font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}

      {/* Show form when authenticated */}
      {isLoaded && user && (
        <div className="max-w-2xl mx-auto">
          {/* User greeting */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-gray-500">
              Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
            </p>
          </motion.div>
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-medium text-text mb-3">
            Tell us about yourself
          </h1>
          <p className="font-body text-base text-text-muted">
            Every answer helps us create your personalized comeback plan
          </p>
        </motion.div>

        {/* Progress indicator as stepping stones */}
        <motion.div
          className="flex justify-center items-center gap-3 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-mono transition-all duration-300 ${
                index <= currentStep
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface text-text-muted shadow-sm"
              }`}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
              }}
            >
              {index + 1}
            </motion.div>
          ))}
        </motion.div>

        {/* Form card */}
        <motion.div
          className="clay-card p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    How old are you?
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="27"
                  />
                </div>

                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    Where are you located?
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="India"
                  />
                </div>

                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    What's your highest education level?
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="Primary (Grade 1-8)">Primary (Grade 1-8)</option>
                    <option value="Secondary (Grade 9-10)">Secondary (Grade 9-10)</option>
                    <option value="Higher Secondary (Grade 11-12)">Higher Secondary (Grade 11-12)</option>
                    <option value="Some College">Some College</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 1: Your Story */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    Why did your education or career pause?
                  </label>
                  <textarea
                    name="reasonStopped"
                    value={formData.reasonStopped}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Marriage, caregiving responsibilities, financial constraints..."
                  />
                  <p className="mt-2 text-sm text-text-muted">
                    This is a starting point, not a setback. Be honest — we're here to help.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Skills & Interests */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    What skills do you have?
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Tutoring, tailoring, cooking, budgeting, community organizing..."
                  />
                  <p className="mt-2 text-sm text-text-muted">
                    Include everything — household management, side work, hobbies. It all counts.
                  </p>
                </div>

                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    What are you interested in?
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Technology, education, business, creative arts..."
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    How many hours per day can you dedicate?
                  </label>
                  <select
                    name="hoursPerDay"
                    value={formData.hoursPerDay}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="Less than 1 hour">Less than 1 hour</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="2-4 hours">2-4 hours</option>
                    <option value="4+ hours">4+ hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    What's your internet access like?
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "none", label: "No regular internet access", desc: "Mostly offline" },
                      { value: "low", label: "Intermittent internet", desc: "Sometimes available" },
                      { value: "stable", label: "Stable connection", desc: "Regular access" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.internetAvailability === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-surface hover:border-primary-light"
                        }`}
                      >
                        <input
                          type="radio"
                          name="internetAvailability"
                          value={option.value}
                          checked={formData.internetAvailability === option.value}
                          onChange={handleChange}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-text">{option.label}</div>
                          <div className="text-sm text-text-muted">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Career Goal */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block font-body text-base font-medium text-text mb-2">
                    What's your career goal?
                  </label>
                  <textarea
                    name="careerGoal"
                    value={formData.careerGoal}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="I want to earn independently, maybe start a small business or work remotely..."
                  />
                  <p className="mt-2 text-sm text-text-muted">
                    Don't worry about being specific — just tell us the direction you're drawn to.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 rounded-xl font-body font-medium text-text-muted hover:text-text transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="clay-button px-8 py-3 text-white font-body font-medium"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="clay-button px-8 py-3 text-white font-body font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Your Profile..." : "Create My Roadmap"}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </div>
  );
}
