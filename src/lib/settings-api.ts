/**
 * Settings API Client
 *
 * Handles all settings-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
  default: boolean;
}

export interface NotificationPreferences {
  invoice_overdue: boolean;
  vat_reminders: boolean;
  delivery_methods: string[];
}
export interface PrivacyPreferences {
  analytics: boolean;
  marketing: boolean;
  third_party: boolean;
  data_retention_years: number;
  data_processing_location: string;
  client_consent_tracking_enabled: boolean;
  client_deletion_requests_enabled: boolean;
}

export interface SettingsData {
  id: number;
  language: string;
  currency: Currency;
  notification_preferences: NotificationPreferences;
  privacy_preferences: PrivacyPreferences;
  created_at: string;
  updated_at: string;
}

export interface SettingsResponse {
  data: SettingsData;
}

// ============================================
// API Client
// ============================================

class SettingsApiClient extends BaseApiClient {
  /**
   * Get user settings
   * GET /api/v1/settings
   */
  async getSettings(): Promise<SettingsResponse> {
    return this.get<SettingsResponse>("/api/v1/settings");
  }

  /**
   * Update user settings
   * PUT /api/v1/settings
   */
  async updateSettings(data: Partial<SettingsData>): Promise<SettingsResponse> {
    return this.put<SettingsResponse>("/api/v1/settings", data);
  }
}

export const settingsApi = new SettingsApiClient();
