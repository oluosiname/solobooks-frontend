/**
 * Invoice Categories API Client
 *
 * Handles all invoice category-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface InvoiceCategoryData {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceCategoriesResponse {
  data: InvoiceCategoryData[];
}

// ============================================
// API Client
// ============================================

class InvoiceCategoriesApiClient extends BaseApiClient {
  /**
   * Get invoice categories
   * GET /api/v1/invoice_categories
   */
  async getCategories(): Promise<InvoiceCategoriesResponse> {
    return this.get<InvoiceCategoriesResponse>("/api/v1/invoice_categories");
  }
}

export const invoiceCategoriesApi = new InvoiceCategoriesApiClient();