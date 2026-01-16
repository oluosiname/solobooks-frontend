/**
 * Financial Categories API Client
 *
 * Handles all financial category-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface FinancialCategoryData {
  id: number;
  name: string;
  category_type: "income" | "expense";
  translated_name: string;
}

export interface FinancialCategoriesResponse {
  data: FinancialCategoryData[];
}

// ============================================
// API Client
// ============================================

class FinancialCategoriesApiClient extends BaseApiClient {
  /**
   * List financial categories
   * GET /api/v1/financial_categories
   */
  async listCategories(
    type?: "income" | "expense"
  ): Promise<FinancialCategoriesResponse> {
    const params: Record<string, string> = {};
    if (type) {
      params.type = type;
    }
    return this.get<FinancialCategoriesResponse>(
      "/api/v1/financial_categories",
      params
    );
  }
}

export const financialCategoriesApi = new FinancialCategoriesApiClient();
