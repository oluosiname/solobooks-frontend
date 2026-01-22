/**
 * Stripe Invoices API Client
 *
 * Handles all Stripe invoice-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface StripeInvoiceData {
  id: string;
  date: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount_due: number;
  amount_paid: number;
  currency: string;
  hosted_invoice_url: string;
  description: string;
}

export interface StripeInvoicesResponse {
  data: StripeInvoiceData[];
}

// ============================================
// API Client
// ============================================

export class StripeInvoicesApiClient extends BaseApiClient {
  /**
   * List all Stripe invoices
   * GET /api/v1/stripe_invoices
   */
  async listStripeInvoices(year?: number): Promise<StripeInvoicesResponse> {
    const params = year ? { year } : undefined;
    return this.get<StripeInvoicesResponse>("/api/v1/stripe_invoices", params);
  }
}

// ============================================
// Export singleton instance
// ============================================

export const stripeInvoicesApi = new StripeInvoicesApiClient();
