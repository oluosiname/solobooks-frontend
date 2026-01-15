/**
 * Dashboard API Client
 *
 * Handles all dashboard-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface DashboardStatsData {
  total_income_mtd: number;
  income_change_percent: number;
  expenses_mtd: number;
  expense_change_percent: number;
  outstanding_amount: number;
  overdue_invoices_count: number;
  active_clients_count: number;
  new_clients_this_month: number;
  client_growth_percent: number;
  profit_margin: number;
}

export interface DashboardStatsResponse {
  data: DashboardStatsData;
}

// ============================================
// API Client
// ============================================

class DashboardApiClient extends BaseApiClient {
  /**
   * Get dashboard statistics
   * GET /api/v1/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.get<DashboardStatsResponse>("/api/v1/dashboard/stats");
  }
}

export const dashboardApi = new DashboardApiClient();