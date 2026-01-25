/**
 * ZMDO Reports API Client
 *
 * Handles all ZMDO (Zusammenfassende Meldung) report-related API calls to the backend.
 * ZM reports are quarterly EC Sales List reports for intra-EU B2B transactions.
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface ZmdoReportData {
  id: string;
  uuid: string;
  status: "draft" | "submitted" | "accepted" | "rejected" | "error";
  quarter: number;
  year: number;
  start_date: string;
  end_date: string;
  period_label: string;
  submitted_at: string | null;
  error_message: string | null;
  can_submit: boolean;
  submittable: boolean;
  pdf_attached: boolean;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ZmdoReportsApiResponse {
  data: {
    draft: ZmdoReportData[];
    submitted: ZmdoReportData[];
  };
}

export interface ZmdoReportPreviewData {
  report: ZmdoReportData;
  transactionData: ZmdoReportPreviewTransactionData;
}

export interface ZmdoReportPreviewTransactionData {
  totalTransactions: number;
  total_amount: number;
  germany_amount: number;
  eu_amount: number;
  with_vat_number_count: number;
  with_vat_number_amount: number;
  without_vat_number_count: number;
  without_vat_number_amount: number;
}

export interface ZmdoReportPreviewResponse {
  data: ZmdoReportPreviewData;
}

// ============================================
// API Client
// ============================================

class ZmdoReportsApiClient extends BaseApiClient {
  /**
   * List all ZMDO reports
   * GET /api/v1/zmdo_reports
   */
  async listZmdoReports(): Promise<ZmdoReportsApiResponse> {
    return this.get<ZmdoReportsApiResponse>("/api/v1/zmdo_reports");
  }

  /**
   * Submit ZMDO report to tax authority
   * POST /api/v1/zmdo_reports/{id}/submit
   */
  async submitZmdoReport(id: string): Promise<{
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
    }>(`/api/v1/zmdo_reports/${id}/submit`);
  }

  /**
   * Test submit ZMDO report
   * POST /api/v1/zmdo_reports/{id}/test_submit
   */
  async testSubmitZmdoReport(id: string): Promise<{
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
    }>(`/api/v1/zmdo_reports/${id}/test_submit`);
  }

  /**
   * Preview ZMDO report data
   * GET /api/v1/zmdo_reports/{id}/preview
   */
  async previewZmdoReport(id: string): Promise<ZmdoReportPreviewResponse> {
    return this.get<ZmdoReportPreviewResponse>(
      `/api/v1/zmdo_reports/${id}/preview`
    );
  }
}

export const zmdoReportsApi = new ZmdoReportsApiClient();
