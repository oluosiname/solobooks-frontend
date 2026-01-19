/**
 * Invoices API Client
 *
 * Handles all invoice-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";
import type { ClientData } from "./clients-api";
import type { CurrencyData } from "./invoice-settings-api";
import type { InvoiceCategoryData } from "./invoice-categories-api";

// ============================================
// Types
// ============================================

export interface InvoiceLineItemData {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export interface InvoiceLineItemResponse {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  invoice: {
    client_id: string;
    invoice_category_id: string;
    currency_id: string;
    date: string;
    due_date: string;
    language: string;
    vat_rate: number;
    vat_included: boolean;
    vat_technique: string;
    notes?: string;
    line_items: InvoiceLineItemData[];
  };
}

export interface InvoiceData {
  id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  subtotal: number;
  vat: number;
  total_amount: number;
  vat_rate: number;
  vat_included: boolean;
  vat_technique: string;
  language: string;
  notes?: string;
  currency_code: string;
  currency_symbol: string;
  client_name: string;
  client: ClientData;
  currency: CurrencyData;
  invoice_category: InvoiceCategoryData;
  line_items: InvoiceLineItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface InvoicesListResponse {
  data: InvoiceData[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface InvoiceResponse {
  data: InvoiceData;
}

export interface InvoicesQueryParams {
  page?: number;
  per_page?: number;
  status?: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  client_id?: string;
  start_date?: string;
  end_date?: string;
  query?: string;
}

export interface InvoiceCreationRequirementsResponse {
  can_create: boolean;
  requirements: {
    profile_complete: boolean;
    invoice_setting_exists: boolean;
  };
}

// ============================================
// API Client
// ============================================

class InvoicesApiClient extends BaseApiClient {
  /**
   * List all invoices
   * GET /api/v1/invoices
   */
  async listInvoices(
    params?: InvoicesQueryParams
  ): Promise<InvoicesListResponse> {
    return this.get<InvoicesListResponse>("/api/v1/invoices", params);
  }

  /**
   * Create a new invoice
   * POST /api/v1/invoices
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    return this.post<InvoiceResponse>("/api/v1/invoices", data);
  }

  /**
   * Get invoice creation requirements
   * GET /api/v1/invoices/creation_requirements
   */
  async getCreationRequirements(): Promise<InvoiceCreationRequirementsResponse> {
    return this.get<InvoiceCreationRequirementsResponse>("/api/v1/invoices/creation_requirements");
  }
}

export const invoicesApi = new InvoicesApiClient();
