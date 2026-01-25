/**
 * Help API Client
 *
 * Handles all help-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// API Response Types (snake_case from backend)
// ============================================

export interface HelpItemData {
  key: string;
  title: string;
  content: string;
  category: string;
  order: number;
  locale: string;
  target_element: string;
  position: string;
  auto_show: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HelpForUserApiResponse {
  data: HelpItemData[];
}

export interface HelpItemApiResponse {
  data: HelpItemData;
}

export interface DismissHelpResponse {
  data: {
    success: boolean;
    message?: string;
  };
}

// ============================================
// API Client
// ============================================

class HelpApiClient extends BaseApiClient {
  /**
   * Get help items for current user
   * GET /api/v1/help?category=dashboard&locale=en
   * Backend filters by:
   * - auto_show=true
   * - matching locale
   * - category (if provided)
   * - excludes dismissed items (user.options['dismissed_help_keys'])
   */
  async getHelpForUser(options?: {
    category?: string;
    locale?: string;
  }): Promise<HelpForUserApiResponse> {
    const params: Record<string, string> = {};
    if (options?.category) {
      params.category = options.category;
    }
    if (options?.locale) {
      params.locale = options.locale;
    }
    return this.get<HelpForUserApiResponse>("/api/v1/help", params);
  }

  /**
   * Get specific help item by key
   * GET /api/v1/help/:key
   */
  async getHelpItem(key: string): Promise<HelpItemApiResponse> {
    return this.get<HelpItemApiResponse>(`/api/v1/help/${key}`);
  }

  /**
   * Dismiss a help item for current user
   * POST /api/v1/help/:key/dismiss
   */
  async dismissHelp(key: string): Promise<DismissHelpResponse> {
    return this.post<DismissHelpResponse>(`/api/v1/help/${key}/dismiss`);
  }
}

export const helpApi = new HelpApiClient();
