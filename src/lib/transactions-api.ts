/**
 * Transactions API Client
 *
 * Handles all transaction-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface CategoryData {
  id: number;
  name: string;
  category_type: "income" | "expense";
  translated_name: string;
}

export interface TransactionData {
  id: number;
  description: string;
  vat_rate: number;
  vat_amount: number;
  amount: number;
  customer_location: string;
  customer_vat_number: string | null;
  vat_technique: string;
  source: string;
  receipt_url: string | null;
  category: CategoryData;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  data: TransactionData[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface TransactionResponse {
  data: TransactionData;
}

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  transaction_type?: "income" | "expense";
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface CreateTransactionRequest {
  transaction: {
    description: string;
    amount: number;
    vat_rate?: number;
    vat_amount?: number;
    customer_location?: string;
    customer_vat_number?: string;
    vat_technique?: string;
    source?: string;
    receipt_url?: string;
    category_id?: number;
  };
}

export interface UpdateTransactionRequest {
  transaction: {
    description?: string;
    amount?: number;
    vat_rate?: number;
    vat_amount?: number;
    customer_location?: string;
    customer_vat_number?: string;
    vat_technique?: string;
    source?: string;
    receipt_url?: string;
    category_id?: number;
  };
}

// ============================================
// API Client
// ============================================

class TransactionsApiClient extends BaseApiClient {
  /**
   * List all transactions
   * GET /api/v1/transactions
   */
  async listTransactions(
    params?: TransactionFilters
  ): Promise<TransactionListResponse> {
    return this.get<TransactionListResponse>("/api/v1/transactions", params);
  }

  /**
   * Get a transaction
   * GET /api/v1/transactions/{id}
   */
  async getTransaction(id: string | number): Promise<TransactionResponse> {
    return this.get<TransactionResponse>(`/api/v1/transactions/${id}`);
  }

  /**
   * Create a transaction
   * POST /api/v1/transactions
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    return this.post<TransactionResponse>("/api/v1/transactions", data);
  }

  /**
   * Update a transaction
   * PUT /api/v1/transactions/{id}
   */
  async updateTransaction(
    id: string | number,
    data: UpdateTransactionRequest
  ): Promise<TransactionResponse> {
    return this.put<TransactionResponse>(`/api/v1/transactions/${id}`, data);
  }

  /**
   * Delete a transaction
   * DELETE /api/v1/transactions/{id}
   */
  async deleteTransaction(id: string | number): Promise<void> {
    return this.delete<void>(`/api/v1/transactions/${id}`);
  }
}

export const transactionsApi = new TransactionsApiClient();
