/**
 * Bank Connections API Client
 *
 * Handles all bank connection-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface BankConnectionData {
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

export interface BankConnectionsListResponse {
  data: BankConnectionData[];
}

export interface BankConnectionResponse {
  data: BankConnectionData;
}

export interface SyncResponse {
  message: string;
}

export interface BankLogosResponse {
  data: Record<string, string>;
}

// ============================================
// API Client
// ============================================

export class BankConnectionsApiClient extends BaseApiClient {
  /**
   * List all bank connections
   * GET /api/v1/bank_connections
   */
  async listBankConnections(): Promise<BankConnectionsListResponse> {
    return this.get<BankConnectionsListResponse>("/api/v1/bank_connections");
  }

  /**
   * Sync a bank connection
   * POST /api/v1/bank_connections/{id}/sync
   */
  async syncBankConnection(id: string | number): Promise<SyncResponse> {
    return this.post<SyncResponse>(`/api/v1/bank_connections/${id}/sync`);
  }

  /**
   * Toggle bank connection sync
   * PATCH /api/v1/bank_connections/{id}/toggle
   */
  async toggleBankConnection(
    id: string | number
  ): Promise<BankConnectionResponse> {
    return this.patch<BankConnectionResponse>(
      `/api/v1/bank_connections/${id}/toggle`
    );
  }

  /**
   * Get bank logos
   * GET /api/v1/bank_connections/logos
   */
  async getBankLogos(): Promise<BankLogosResponse> {
    return this.get<BankLogosResponse>("/api/v1/bank_connections/logos");
  }
}

// ============================================
// Export singleton instance
// ============================================

export const bankConnectionsApi = new BankConnectionsApiClient();
