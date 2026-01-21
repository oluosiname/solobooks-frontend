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

export type InvoiceSortField = "date" | "due_date" | "total_amount" | "client_name" | "invoice_number" | "created_at";
export type SortOrder = "asc" | "desc";

export interface InvoicesQueryParams {
  page?: number;
  per_page?: number;
  status?: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  client_id?: string;
  start_date?: string;
  end_date?: string;
  query?: string;
  sort_by?: InvoiceSortField;
  order?: SortOrder;
  [key: string]: string | number | boolean | undefined;
}

export interface InvoiceCreationRequirementsResponse {
  can_create: boolean;
  requirements: {
    profile_complete: boolean;
    invoice_setting_exists: boolean;
  };
}

export interface VatPreviewRequest {
  subtotal: number;
  vat_rate: number;
  client_country: string;
}

export interface VatPreviewResponse {
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  reverse_charge: boolean;
  note: string | null;
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

  /**
   * Mark invoice as sent
   * PATCH /api/v1/invoices/{id}/send
   */
  async sendInvoice(id: string | number): Promise<InvoiceResponse> {
    return this.patch<InvoiceResponse>(`/api/v1/invoices/${id}/send`);
  }

  /**
   * Mark invoice as paid
   * PATCH /api/v1/invoices/{id}/pay
   */
  async payInvoice(id: string | number): Promise<InvoiceResponse> {
    return this.patch<InvoiceResponse>(`/api/v1/invoices/${id}/pay`);
  }

  /**
   * Download invoice PDF
   * GET /api/v1/invoices/{id}/pdf
   */
  async downloadInvoicePdf(id: string | number): Promise<Blob> {
    const url = `${this.baseUrl}/api/v1/invoices/${id}/pdf`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Calculate VAT preview
   * POST /api/v1/invoices/vat-preview
   */
  async calculateVatPreview(data: VatPreviewRequest): Promise<VatPreviewResponse> {
    return this.post<VatPreviewResponse>("/api/v1/invoices/vat-preview", data);
  }
}

export const invoicesApi = new InvoicesApiClient();
