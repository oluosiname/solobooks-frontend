/**
 * Data Exports API Client
 *
 * Handles all data export-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export type ExportType = "gdpr" | "datev";

export interface DataExportData {
  uuid: string;
  export_type: ExportType;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  download_url?: string;
}

export interface DataExportResponse {
  data: DataExportData;
}

export interface LatestDataExportResponse {
  data: DataExportData | null;
}

// ============================================
// API Client
// ============================================

class DataExportsApiClient extends BaseApiClient {
  /**
   * Create a data export request
   * POST /api/v1/data_exports?export_type={type}
   */
  async createDataExport(exportType: ExportType): Promise<DataExportResponse> {
    return this.post<DataExportResponse>(
      `/api/v1/data_exports?export_type=${exportType}`,
      {}
    );
  }

  /**
   * Get latest non-expired GDPR export
   * GET /api/v1/data_exports/latest?export_type={type}
   */
  async getLatestDataExport(exportType: ExportType): Promise<LatestDataExportResponse> {
    return this.get<LatestDataExportResponse>(
      `/api/v1/data_exports/latest`,
      { export_type: exportType }
    );
  }

  /**
   * Download data export file
   * GET /api/v1/data_exports/{id}/download
   */
  async downloadDataExport(id: string): Promise<Blob> {
    const url = `${this.baseUrl}/api/v1/data_exports/${id}/download`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download export: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const dataExportsApi = new DataExportsApiClient();
