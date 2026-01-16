/**
 * Invoices API Client
 *
 * Handles all invoice-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface InvoiceLineItemData {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
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
  client: any; // Will be properly typed later
  currency: any; // Will be properly typed later
  invoice_category: any; // Will be properly typed later
  line_items: any[]; // Will be properly typed later
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

// ============================================
// API Client
// ============================================

class InvoicesApiClient extends BaseApiClient {
  /**
   * List all invoices
   * GET /api/v1/invoices
   */
  async listInvoices(params?: InvoicesQueryParams): Promise<InvoicesListResponse> {
    return this.get<InvoicesListResponse>("/api/v1/invoices", params);
  }

  /**
   * Create a new invoice
   * POST /api/v1/invoices
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    return this.post<InvoiceResponse>("/api/v1/invoices", data);
  }
}

export const invoicesApi = new InvoicesApiClient();