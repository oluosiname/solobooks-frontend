/**
 * Payment Method API Client
 *
 * Handles all payment method-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface PaymentMethodData {
  id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  created: number;
}

export interface PaymentMethodResponse {
  data: PaymentMethodData;
}

// ============================================
// API Client
// ============================================

export class PaymentMethodApiClient extends BaseApiClient {
  /**
   * Get current payment method
   * GET /api/v1/payment_method
   */
  async getPaymentMethod(): Promise<PaymentMethodResponse> {
    return this.get<PaymentMethodResponse>("/api/v1/payment_method");
  }
}

// ============================================
// Export singleton instance
// ============================================

export const paymentMethodApi = new PaymentMethodApiClient();
