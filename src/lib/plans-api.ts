/**
 * Plans API Client
 *
 * Handles all plan-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";
import type { Plan } from "@/types";

// ============================================
// Types
// ============================================

export interface PlansListResponse {
  data: Plan[];
}

// ============================================
// API Client
// ============================================

export class PlansApiClient extends BaseApiClient {
  /**
   * List all available plans
   * GET /api/v1/plans
   */
  async listPlans(): Promise<PlansListResponse> {
    return this.get<PlansListResponse>("/api/v1/plans");
  }
}

// ============================================
// Export singleton instance
// ============================================

export const plansApi = new PlansApiClient();