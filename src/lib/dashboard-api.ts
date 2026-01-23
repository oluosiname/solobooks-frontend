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
  prompt_cards?: Array<{
    key: string;
    title: string;
    description: string;
    icon: string;
    action_url: string;
    dismissible: boolean;
    priority: number;
  }>;
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

  /**
   * Dismiss a prompt card for current user
   * POST /api/v1/dashboard/prompt_cards/:key/dismiss
   */
  async dismissPromptCard(key: string): Promise<{ data: { success: boolean } }> {
    return this.post<{ data: { success: boolean } }>(
      `/api/v1/dashboard/prompt_cards/${key}/dismiss`
    );
  }
}

export const dashboardApi = new DashboardApiClient();