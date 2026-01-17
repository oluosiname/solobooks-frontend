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

export interface SetupIntentData {
  client_secret: string;
}

export interface SetupIntentResponse {
  data: SetupIntentData;
}

export interface ConfirmPaymentMethodRequest {
  payment_method_id: string;
  plan?: string;
}

export interface ConfirmPaymentMethodResponse {
  data: {
    success: boolean;
    message: string;
  };
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

  /**
   * Create setup intent for Stripe Elements
   * POST /api/v1/payment_methods/setup_intent
   */
  async createSetupIntent(): Promise<SetupIntentResponse> {
    return this.post<SetupIntentResponse>("/api/v1/payment_methods/setup_intent");
  }

  /**
   * Confirm and attach payment method
   * POST /api/v1/payment_methods/confirm
   */
  async confirmPaymentMethod(data: ConfirmPaymentMethodRequest): Promise<ConfirmPaymentMethodResponse> {
    return this.post<ConfirmPaymentMethodResponse>("/api/v1/payment_methods/confirm", data);
  }
}

// ============================================
// Export singleton instance
// ============================================

export const paymentMethodApi = new PaymentMethodApiClient();
