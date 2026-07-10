/**
 * Frontend API Client
 * Handles all communication with the backend API
 * Base URL: NEXT_PUBLIC_API_URL (e.g., http://localhost:5000)
 */

import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Make authenticated API request to backend
 * Automatically includes Clerk token in Authorization header
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // For client-side calls, we need to get the token manually
    // This is a helper - in components use the hook version below
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Hook for making authenticated API calls (client components)
 * Automatically includes Clerk token
 */
export function useApi() {
  const { getToken } = useAuth();

  return async function makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const token = await getToken();
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };
}

/**
 * Profile API calls
 */
export const profileApi = {
  async getProfile(token: string) {
    return apiCall('/api/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async updateProfile(token: string, data: any) {
    return apiCall('/api/profile', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async getPublicProfile(userId: string) {
    return apiCall(`/api/profile/${userId}`, { method: 'GET' });
  },
};

/**
 * Roadmap API calls
 */
export const roadmapApi = {
  async getRoadmap(token: string) {
    return apiCall('/api/roadmap', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async createRoadmap(token: string, data: any) {
    return apiCall('/api/roadmap', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async generateRoadmap(token: string) {
    return apiCall('/api/roadmap/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
};

/**
 * Skill Passport API calls
 */
export const skillPassportApi = {
  async getSkillPassport(token: string) {
    return apiCall('/api/skill-passport', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async saveSkillPassport(token: string, data: any) {
    return apiCall('/api/skill-passport', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async generateSkillPassport(token: string, selectedRoles: string[]) {
    return apiCall('/api/skill-passport/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ selectedRoles }),
    });
  },
};

/**
 * Opportunities API calls
 */
export const opportunitiesApi = {
  async getOpportunities(token: string) {
    return apiCall('/api/opportunities', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async matchOpportunities(token: string) {
    return apiCall('/api/opportunities/match', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
};

/**
 * Progress API calls
 */
export const progressApi = {
  async getProgress(token: string) {
    return apiCall('/api/progress', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async getProgressHistory(token: string, userId: string) {
    return apiCall(`/api/progress/${userId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  async updateProgress(token: string, data: any) {
    return apiCall('/api/progress/update', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};
