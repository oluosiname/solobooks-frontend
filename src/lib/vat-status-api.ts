/**
 * VAT Status API Client
 *
 * Handles all VAT status-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface VatStatusData {
  id: number;
  vat_registered: boolean;
  declaration_period: string;
  vat_number: string | null;
  starts_on: string | null;
  kleinunternehmer: boolean;
  tax_exempt_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface VatStatusResponse {
  data: VatStatusData;
}

export interface CreateVatStatusRequest {
  vat_status: {
    vat_registered: boolean;
    declaration_period: string;
    vat_number?: string;
    starts_on?: string;
    kleinunternehmer: boolean;
    tax_exempt_reason?: string;
  };
}

export interface UpdateVatStatusRequest {
  vat_status: {
    vat_registered?: boolean;
    declaration_period?: string;
    vat_number?: string;
    starts_on?: string;
    kleinunternehmer?: boolean;
    tax_exempt_reason?: string;
  };
}

export interface VatStatusErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ============================================
// API Client
// ============================================

class VatStatusApiClient extends BaseApiClient {
  /**
   * Get VAT status
   * GET /api/v1/vat_status
   */
  async getVatStatus(): Promise<VatStatusResponse> {
    return this.get<VatStatusResponse>("/api/v1/vat_status");
  }

  /**
   * Create VAT status
   * POST /api/v1/vat_status
   */
  async createVatStatus(
    data: CreateVatStatusRequest
  ): Promise<VatStatusResponse> {
    return this.post<VatStatusResponse>("/api/v1/vat_status", data);
  }

  /**
   * Update VAT status
   * PUT /api/v1/vat_status
   */
  async updateVatStatus(
    data: UpdateVatStatusRequest
  ): Promise<VatStatusResponse> {
    return this.put<VatStatusResponse>("/api/v1/vat_status", data);
  }
}

export const vatStatusApi = new VatStatusApiClient();
