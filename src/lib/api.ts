/**
 * API Client - Re-exports from services/api for backwards compatibility
 *
 * @deprecated Use `@/services/api` directly for new code
 */

import { api as newApi } from "@/services/api";
import type { TransactionType } from "@/types";

export const api = {
  // User
  getUser: newApi.fetchProfile,

  // Dashboard
  getDashboardStats: newApi.fetchDashboardStats,
  getRevenueExpenseData: newApi.fetchRevenueExpenseData,
  getCategoryData: newApi.fetchCategoryData,
  async getRecentTransactions(limit = 5) {
    try {
      const transactions = await newApi.fetchTransactions();
      return transactions.data.slice(0, limit);
    } catch (error) {
      console.warn(
        "Failed to fetch transactions from API, falling back to empty array:",
        error
      );
      return [];
    }
  },

  // Clients
  getClients: newApi.fetchClients,
  getClient: newApi.fetchClient,
  createClient: newApi.createClient,
  updateClient: newApi.updateClient,
  deleteClient: newApi.deleteClient,

  // Invoices
  async getInvoices(status?: string, params?: any) {
    const result = await newApi.fetchInvoices(params);
    let invoices = result.invoices;

    // Apply status filter if provided (for backward compatibility)
    if (status && status !== "all") {
      invoices = invoices.filter((inv) => inv.status === status);
    }

    return invoices;
  },
  getInvoice: newApi.fetchInvoice,

  // Transactions
  async getTransactions(type?: TransactionType, search?: string) {
    return await newApi.fetchTransactions(
      type || search
        ? {
            transactionType: type,
            description: search,
          }
        : undefined
    );
  },
  getUncheckedTransactions: newApi.fetchUncheckedTransactions,
  discardSyncedTransaction: newApi.discardSyncedTransaction,
  deleteTransaction: newApi.deleteTransaction,

  // Bank Connections
  getBankConnections: newApi.fetchBankConnections,

  // VAT Reports
  async getVatReports(submitted = false) {
    const reports = await newApi.fetchVatReports();
    if (submitted) {
      return reports.filter(
        (r) => r.status === "submitted" || r.status === "accepted"
      );
    }
    return reports.filter(
      (r) => r.status === "draft" || r.status === "rejected"
    );
  },

  // Subscription
  getSubscription: newApi.fetchSubscription,
  getPaymentMethod: newApi.fetchPaymentMethod,

  // Reports
  getProfitLossData: newApi.fetchProfitLossData,
  getExpenseCategories: newApi.fetchCategoryData,
};
