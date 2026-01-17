/**
 * VAT Reports API Client
 *
 * Handles all VAT report-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface VatReportData {
  id: number;
  status: "draft" | "submitted" | "accepted" | "rejected";
  start_date: string;
  end_date: string;
  year: number;
  period_label: string;
  elster_period: number;
  due_date: string;
  submitted_at: string | null;
  error_message: string | null;
  can_submit: boolean;
  submittable: boolean;
  overdue: boolean;
  due_soon: boolean;
  xml_attached: boolean;
  pdf_attached: boolean;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VatReportsApiResponse {
  data: {
    upcoming: VatReportData[];
    submitted: VatReportData[];
  };
}

// ============================================
// API Client
// ============================================

class VatReportsApiClient extends BaseApiClient {
  /**
   * List all VAT reports
   * GET /api/v1/vat_reports
   */
  async listVatReports(): Promise<VatReportsApiResponse> {
    return this.get<VatReportsApiResponse>("/api/v1/vat_reports");
  }

  /**
   * Submit VAT report to tax authority
   * POST /api/v1/vat_reports/{id}/submit
   */
  async submitVatReport(id: number): Promise<{
    data: {
      success: boolean;
      message: string;
      pdf_url?: string;
    };
  }> {
    return this.post<{
      data: {
        success: boolean;
        message: string;
        pdf_url?: string;
      };
    }>(`/api/v1/vat_reports/${id}/submit`);
  }

  /**
   * Test submit VAT report
   * POST /api/v1/vat_reports/{id}/test_submit
   */
  async testSubmitVatReport(id: number): Promise<{
    data: {
      success: boolean;
      message: string;
      pdf_data?: string;
    };
  }> {
    return this.post<{
      data: {
        success: boolean;
        message: string;
        pdf_data?: string;
      };
    }>(`/api/v1/vat_reports/${id}/test_submit`);
  }
}

export const vatReportsApi = new VatReportsApiClient();
