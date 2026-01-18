/**
 * Subscription API Client
 *
 * Handles all subscription-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";
import type { Subscription } from "@/types";

// ============================================
// Types
// ============================================

export interface SubscriptionData {
  id: number;
  plan: string;
  status: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  current_period_start: string;
  current_period_end: string;
  activated_at?: string;
  deactivated_at?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionResponse {
  data: SubscriptionData;
}

export interface ChangeSubscriptionRequest {
  plan: string;
}

// ============================================
// API Client
// ============================================

export class SubscriptionApiClient extends BaseApiClient {
  /**
   * Get current subscription
   * GET /api/v1/subscription
   */
  async getSubscription(): Promise<SubscriptionResponse> {
    return this.get<SubscriptionResponse>("/api/v1/subscription");
  }

  /**
   * Change subscription plan
   * POST /api/v1/subscription
   */
  async changeSubscription(data: ChangeSubscriptionRequest): Promise<SubscriptionResponse> {
    return this.post<SubscriptionResponse>("/api/v1/subscription", data);
  }
}

// ============================================
// Export singleton instance
// ============================================

export const subscriptionApi = new SubscriptionApiClient();
