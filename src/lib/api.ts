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
  async getRecentTransactions(limit = 5) {
    try {
      const transactions = await newApi.fetchTransactions();
      return transactions.data.slice(0, limit);
    } catch {
      // Fallback to empty array if API fails
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
  async getInvoices(status?: string, params?: Record<string, string | number | boolean | undefined>) {
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
    return submitted ? reports.submitted : reports.upcoming;
  },

  // Subscription
  getSubscription: newApi.fetchSubscription,
  getPaymentMethod: newApi.fetchPaymentMethod,

  // Reports
};
