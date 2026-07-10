// Client-side profile utilities for onboarding and dashboard

export interface OnboardingStorage {
  age: string;
  country: string;
  education: string;
  reasonStopped: string;
  skills: string;
  interests: string;
  hoursPerDay: string;
  internetAvailability: "none" | "low" | "stable";
  careerGoal: string;
  name?: string;
  email?: string;
}

/**
 * Get stored user ID from localStorage
 */
export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

/**
 * Check if onboarding data is complete
 */
export function isOnboardingComplete(data: OnboardingStorage): boolean {
  const requiredFields: (keyof OnboardingStorage)[] = [
    'age', 'country', 'education', 'reasonStopped', 'skills', 
    'interests', 'hoursPerDay', 'internetAvailability', 'careerGoal'
  ];
  
  return requiredFields.every(field => {
    const value = data[field];
    return value && value.toString().trim() !== '';
  });
}

/**
 * Ensure user profile exists in database, create if needed
 */
export async function ensureUserProfile(onboardingData: OnboardingStorage): Promise<string> {
  try {
    const profileResponse = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: onboardingData.name || "User",
        email: onboardingData.email || `user-${Date.now()}@sherise.app`,
        age: parseInt(onboardingData.age),
        country: onboardingData.country,
        educationLevel: onboardingData.education,
        reasonStopped: onboardingData.reasonStopped,
        skills: onboardingData.skills,
        interests: onboardingData.interests,
        hoursPerDay: onboardingData.hoursPerDay,
        internetAvailability: onboardingData.internetAvailability,
        careerGoal: onboardingData.careerGoal,
      }),
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      const userId = profileData.user.id;
      localStorage.setItem("userId", userId);
      return userId;
    } else {
      throw new Error("Failed to create profile");
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    // Fallback: generate temporary ID for demo
    const tempUserId = `temp-${Date.now()}`;
    localStorage.setItem("userId", tempUserId);
    return tempUserId;
  }
}

/**
 * Store onboarding completion flag
 */
export function markOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("onboardingComplete", "true");
}

/**
 * Check if onboarding has been completed
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("onboardingComplete") === "true";
}

/**
 * Clear all stored user data (for logout/reset)
 */
export function clearUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userId");
  localStorage.removeItem("userData");
  localStorage.removeItem("onboardingComplete");
}