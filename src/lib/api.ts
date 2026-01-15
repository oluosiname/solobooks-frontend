/**
 * API Client - Re-exports from services/api for backwards compatibility
 *
 * @deprecated Use `@/services/api` directly for new code
 */

import { api as newApi } from "@/services/api";

export const api = {
  // User
  getUser: newApi.fetchUser,

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

  // Invoices
  async getInvoices(status?: string) {
    const invoices = await newApi.fetchInvoices();
    if (status) {
      return invoices.filter((inv) => inv.status === status);
    }
    return invoices;
  },
  getInvoice: newApi.fetchInvoice,

  // Transactions
  async getTransactions(type?: string) {
    const transactions = await newApi.fetchTransactions();
    if (type) {
      return transactions.filter((t) => t.type === type);
    }
    return transactions;
  },
  getUncheckedTransactions: newApi.fetchUncheckedTransactions,
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
