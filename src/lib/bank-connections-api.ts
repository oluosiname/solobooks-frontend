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

export interface BankData {
  id: string;
  name: string;
  logo?: string;
  countries: string[];
}

export interface BanksListResponse {
  data: BankData[];
}

export interface InitiateConnectionRequest {
  institution_id: string;
  locale: string;
}

export interface InitiateConnectionResponse {
  data: {
    redirect_url: string;
    requisition_id: string;
  };
}

export interface CompleteConnectionRequest {
  // No parameters needed - backend handles internally
}

export interface CompleteConnectionResponse {
  data: BankConnectionData;
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
   * Get available banks for connection
   * GET /api/v1/bank_connections/banks
   */
  async getAvailableBanks(): Promise<BanksListResponse> {
    return this.get<BanksListResponse>("/api/v1/bank_connections/banks");
  }

  /**
   * Initiate bank connection
   * POST /api/v1/bank_connections
   */
  async initiateConnection(
    data: InitiateConnectionRequest
  ): Promise<InitiateConnectionResponse> {
    return this.post<InitiateConnectionResponse>(
      "/api/v1/bank_connections",
      data
    );
  }

  /**
   * Complete bank connection after callback
   * POST /api/v1/bank_connections/callback
   */
  async completeConnection(
    data: CompleteConnectionRequest
  ): Promise<CompleteConnectionResponse> {
    return this.post<CompleteConnectionResponse>(
      "/api/v1/bank_connections/callback",
      data
    );
  }
}

// ============================================
// Export singleton instance
// ============================================

export const bankConnectionsApi = new BankConnectionsApiClient();
