/**
 * PNL Reports API Client
 *
 * Handles PNL report-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";
import type { PnlReportResponse } from "@/types";

// ============================================
// API Client
// ============================================

class PnlReportsApiClient extends BaseApiClient {
  /**
   * Get PNL report data
   * GET /api/v1/reports/pnl/data
   */
  async getPnlData(startDate: string, endDate: string): Promise<PnlReportResponse> {
    return this.get<PnlReportResponse>("/api/v1/reports/pnl/data", {
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Download PNL report PDF
   * GET /api/v1/reports/pnl/pdf
   */
  async downloadPnlPdf(startDate: string, endDate: string): Promise<Blob> {
    const url = `${this.baseUrl}/api/v1/reports/pnl/pdf?start_date=${startDate}&end_date=${endDate}`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }

    return response.blob();
  }
}

export const pnlReportsApi = new PnlReportsApiClient();