/**
 * Profile API Client
 *
 * Handles all user profile-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface ProfileData {
  id: number;
  legal_status: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  nationality?: string;
  country?: string;
  state?: string;
  business_name?: string;
  tax_number?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  address?: {
    id: number;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    full_address: string;
  };
}

export interface ProfileResponse {
  data: ProfileData;
}

export interface UpdateProfileRequest {
  profile: {
    full_name?: string;
    business_name?: string;
    phone_number?: string;
    tax_number?: string;
  };
}

// ============================================
// API Client
// ============================================

class ProfileApiClient extends BaseApiClient {
  /**
   * Get current user profile
   * GET /api/v1/profile
   */
  async getProfile(): Promise<ProfileResponse> {
    return this.get<ProfileResponse>("/api/v1/profile");
  }

  /**
   * Update current user profile
   * PUT /api/v1/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return this.put<ProfileResponse>("/api/v1/profile", data);
  }
}

export const profileApi = new ProfileApiClient();
