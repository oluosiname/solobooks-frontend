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
  transaction_type: "Income" | "Expense";
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

export interface BankConnectionSummary {
  id: number;
  status: string;
  sync_enabled: boolean;
  bank_name: string;
  account_number: string;
  institution_id: string;
  last_sync_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  pending_transactions_count: number;
}

export interface SyncedTransactionData {
  id: number;
  amount: number;
  booked_at: string;
  description: string;
  status: "pending" | "approved" | "discarded";
  bank_connection: BankConnectionSummary;
  created_at: string;
  updated_at: string;
}

export interface SyncedTransactionsResponse {
  data: SyncedTransactionData[];
}

export interface CreateTransactionRequest {
  transaction: {
    transaction_type: "income" | "expense";
    amount: number;
    date: string;
    description: string;
    financial_category_id: string;
    vat_rate?: number;
    customer_location?: string;
    customer_vat_number?: string;
    synced_transaction_id?: string;
  };
  receipt?: File; // For multipart/form-data uploads
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
   * Get synced transactions
   * GET /api/v1/synced_transactions
   */
  async getSyncedTransactions(
    bankConnectionId?: number
  ): Promise<SyncedTransactionsResponse> {
    const params: Record<string, number> = {};
    if (bankConnectionId) {
      params.bank_connection_id = bankConnectionId;
    }
    return this.get<SyncedTransactionsResponse>(
      "/api/v1/synced_transactions",
      params
    );
  }

  /**
   * Discard synced transaction
   * PATCH /api/v1/synced_transactions/{id}/discard
   */
  async discardSyncedTransaction(
    id: string | number
  ): Promise<{ message: string }> {
    return this.patch<{ message: string }>(
      `/api/v1/synced_transactions/${id}/discard`
    );
  }

  /**
   * Create a transaction
   * POST /api/v1/transactions
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    // If receipt file is provided, use FormData for multipart upload
    if (data.receipt) {
      const formData = new FormData();

      // Add transaction fields as individual form fields
      Object.entries(data.transaction).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`transaction[${key}]`, String(value));
        }
      });

      // Add receipt file as nested parameter
      formData.append("transaction[receipt]", data.receipt);

      // Use the base class method that handles token refresh
      return this.postFormData<TransactionResponse>(
        "/api/v1/transactions",
        formData
      );
    }

    // Otherwise, send as regular JSON
    return this.post<TransactionResponse>("/api/v1/transactions", data);
  }

  /**
   * Update a transaction
   * PUT /api/v1/transactions/{id}
   */
  async updateTransaction(
    id: string | number,
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    // If receipt file is provided, use FormData for multipart upload
    if (data.receipt) {
      const formData = new FormData();

      // Add transaction fields as individual form fields
      Object.entries(data.transaction).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`transaction[${key}]`, String(value));
        }
      });

      // Add receipt file as nested parameter
      formData.append("transaction[receipt]", data.receipt);

      // Use the base class method that handles token refresh
      return this.putFormData<TransactionResponse>(
        `/api/v1/transactions/${id}`,
        formData
      );
    }

    // Otherwise, send as regular JSON with transaction nested properly
    return this.put<TransactionResponse>(`/api/v1/transactions/${id}`, {
      transaction: data.transaction,
    });
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
