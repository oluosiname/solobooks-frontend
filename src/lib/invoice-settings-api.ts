/**
 * Invoice Settings API Client
 *
 * Handles all invoice settings related API calls to the backend
 */

import { BaseApiClient } from './base-api';

// ============================================
// Types
// ============================================

export interface CurrencyData {
  id: number;
  code: string;
  symbol: string;
  name: string;
  default: boolean;
}

export interface InvoiceSettingData {
  id: number;
  prefix: string;
  language: 'en' | 'de';
  account_holder: string;
  account_number: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  swift: string | null;
  sort_code: string | null;
  routing_number: string | null;
  default_note: string | null;
  currency: CurrencyData;
}

export interface InvoiceSettingResponse {
  data: InvoiceSettingData | null;
}

export interface CurrenciesResponse {
  data: CurrencyData[];
}

export interface CreateInvoiceSettingRequest {
  invoice_setting: {
    prefix: string;
    currency_id: number;
    language: 'en' | 'de';
    account_holder: string;
    account_number?: string;
    bank_name?: string;
    iban?: string;
    bic?: string;
    swift?: string;
    sort_code?: string;
    routing_number?: string;
    default_note?: string;
  };
}

export interface UpdateInvoiceSettingRequest {
  invoice_setting: {
    prefix?: string;
    currency_id?: number;
    language?: 'en' | 'de';
    account_holder?: string;
    account_number?: string;
    bank_name?: string;
    iban?: string;
    bic?: string;
    swift?: string;
    sort_code?: string;
    routing_number?: string;
    default_note?: string;
  };
}

// ============================================
// API Client
// ============================================

class InvoiceSettingsApiClient extends BaseApiClient {
  /**
   * Get invoice settings
   * GET /api/v1/invoice_settings
   */
  async getInvoiceSettings(): Promise<InvoiceSettingResponse> {
    return this.get<InvoiceSettingResponse>('/api/v1/invoice_settings');
  }

  /**
   * Create invoice settings
   * POST /api/v1/invoice_settings
   */
  async createInvoiceSettings(
    data: CreateInvoiceSettingRequest
  ): Promise<InvoiceSettingResponse> {
    return this.post<InvoiceSettingResponse>('/api/v1/invoice_settings', data);
  }

  /**
   * Update invoice settings
   * PUT /api/v1/invoice_settings
   */
  async updateInvoiceSettings(
    data: UpdateInvoiceSettingRequest
  ): Promise<InvoiceSettingResponse> {
    return this.put<InvoiceSettingResponse>('/api/v1/invoice_settings', data);
  }

  /**
   * Get available currencies
   * GET /api/v1/currencies
   */
  async getCurrencies(): Promise<CurrenciesResponse> {
    return this.get<CurrenciesResponse>('/api/v1/currencies');
  }
}

export const invoiceSettingsApi = new InvoiceSettingsApiClient();
