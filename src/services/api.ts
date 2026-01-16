/**
 * API Service Layer
 *
 * This module provides API-like functions that simulate backend calls.
 * Currently uses mock data, but can be easily switched to real API calls.
 *
 * Each function returns a Promise to mimic async API behavior.
 */

import {
  invoices,
  revenueExpenseData,
  categoryData,
  profitLossData,
  vatReports,
} from "@/data";

import { clientsApi } from "@/lib/clients-api";
import type { CreateClientRequest } from "@/lib/clients-api";
import { financialCategoriesApi } from "@/lib/financial-categories-api";
import type { TransactionCategory } from "@/types";
import * as humps from "humps";
import { invoiceSettingsApi } from "@/lib/invoice-settings-api";
import type {
  CreateInvoiceSettingRequest,
  UpdateInvoiceSettingRequest,
} from "@/lib/invoice-settings-api";
import { vatStatusApi } from "@/lib/vat-status-api";
import type {
  CreateVatStatusRequest,
  UpdateVatStatusRequest,
} from "@/lib/vat-status-api";
import { profileApi } from "@/lib/profile-api";
import type { UpdateProfileRequest } from "@/lib/profile-api";
import { transactionsApi } from "@/lib/transactions-api";
import type {
  TransactionFilters as ApiTransactionFilters,
  CreateTransactionRequest,
} from "@/lib/transactions-api";
import { plansApi } from "@/lib/plans-api";
import { subscriptionApi } from "@/lib/subscription-api";
import { settingsApi } from "@/lib/settings-api";
import type { SettingsData as ApiSettingsData } from "@/lib/settings-api";
import { dashboardApi } from "@/lib/dashboard-api";
import { invoiceCategoriesApi } from "@/lib/invoice-categories-api";
import { invoicesApi, InvoicesQueryParams } from "@/lib/invoices-api";
import { paymentMethodApi } from "@/lib/payment-method-api";
import { bankConnectionsApi } from "@/lib/bank-connections-api";

import type {
  Profile,
  Client,
  Invoice,
  Transaction,
  TransactionFilters,
  PaginatedTransactions,
  BankConnection,
  Bank,
  VatReport,
  Subscription,
  PaymentMethod,
  DashboardStats,
  Settings,
  RevenueExpenseData,
  CategoryData,
  ProfitLossData,
  InvoiceSettings,
  InvoiceSettingsInput,
  InvoiceCategory,
  Currency,
  VatStatus,
  VatStatusInput,
  Plan,
} from "@/types";

import {
  transformClientData,
  transformInvoiceSettingData,
  transformCurrencyData,
  transformVatStatusData,
  transformProfileData,
  transformTransactionData,
  transformSubscriptionData,
  transformPaymentMethodData,
  transformBankConnectionData,
  transformBankData,
  transformSyncedTransactionData,
  transformSettingsData,
  transformDashboardStatsData,
  transformFinancialCategoryData,
  transformInvoiceCategoryData,
  transformInvoiceData,
} from "./api-transformer";

// Simulate network delay
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Profile API
// ============================================

export async function fetchProfile(): Promise<Profile> {
  const response = await profileApi.getProfile();
  return transformProfileData(response.data);
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const profile: UpdateProfileRequest["profile"] = humps.decamelizeKeys(data);

  const requestObject = { profile } as UpdateProfileRequest;

  const response = await profileApi.updateProfile(requestObject);
  return transformProfileData(response.data);
}

// ============================================
// Clients API
// ============================================

/**
 * Helper to transform backend ClientData to frontend Client type
 */

export async function fetchClients(): Promise<Client[]> {
  const response = await clientsApi.listClients();
  return response.data.map(transformClientData);
}

export async function fetchClient(id: string): Promise<Client | null> {
  const response = await clientsApi.getClient(id);
  return transformClientData(response.data);
}

export async function createClient(
  data: Omit<
    Client,
    | "id"
    | "createdAt"
    | "totalInvoiced"
    | "outstanding"
    | "invoiceCount"
    | "fullAddress"
  >
): Promise<Client> {
  const client = humps.decamelizeKeys(data);
  const requestObject = { client } as CreateClientRequest;

  const response = await clientsApi.createClient(requestObject);
  return transformClientData(response.data);
}

export async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<Client | null> {
  const response = await clientsApi.updateClient(id, {
    client: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phoneNumber && { phone_number: data.phoneNumber }),
      ...(data.businessName && { business_name: data.businessName }),
      ...(data.taxNumber && { business_tax_id: data.taxNumber }),
      ...(data.vatId && { vat_number: data.vatId }),
      ...(data.address && {
        address: {
          street_address: data.address.streetAddress,
          city: data.address.city,
          state: data.address.state,
          postal_code: data.address.postalCode,
          country: data.address.country,
        },
      }),
    },
  });
  return transformClientData(response.data);
}

export async function deleteClient(id: string): Promise<boolean> {
  await clientsApi.deleteClient(id);
  return true;
}

// ============================================
// Invoices API
// ============================================

export async function fetchInvoices(params?: InvoicesQueryParams): Promise<{
  invoices: Invoice[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  };
}> {
  const response = await invoicesApi.listInvoices(params);
  return {
    invoices: response.data.map(transformInvoiceData),
    meta: humps.camelizeKeys(response.meta) as {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      perPage: number;
    },
  };
}

export async function fetchInvoice(id: string): Promise<Invoice | null> {
  await delay();
  return invoices.find((i) => i.id === id) || null;
}

export async function createInvoice(data: {
  clientId: string;
  category: string;
  currency: string;
  language: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Array<{
    id: string;
    description: string;
    unitPrice: number;
    unit: string;
    quantity: number;
  }>;
}): Promise<any> {
  const invoiceData = {
    invoice: {
      client_id: data.clientId,
      invoice_category_id: data.category,
      currency_id: data.currency,
      date: data.invoiceDate,
      due_date: data.dueDate,
      language: data.language,
      vat_rate: 19, // Default VAT rate
      vat_included: true,
      vat_technique: "standard",
      line_items: data.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
      })),
    },
  };

  const response = await invoicesApi.createInvoice(invoiceData);
  return transformInvoiceData(response.data);
}

export async function updateInvoice(
  id: string,
  data: Partial<Invoice>
): Promise<Invoice | null> {
  await delay();
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) return null;
  return { ...invoice, ...data };
}

export async function deleteInvoice(id: string): Promise<boolean> {
  await delay();
  return invoices.some((i) => i.id === id);
}

// ============================================
// Transactions API
// ============================================

/**
 * Fetch paginated transactions with optional filters
 * GET /api/v1/transactions
 */
export async function fetchTransactions(
  filters?: TransactionFilters
): Promise<PaginatedTransactions> {
  const apiFilters: ApiTransactionFilters | undefined = filters
    ? {
        page: filters.page,
        per_page: filters.perPage,
        transaction_type: filters.transactionType,
        start_date: filters.startDate,
        end_date: filters.endDate,
        description: filters.description,
      }
    : undefined;

  const response = await transactionsApi.listTransactions(apiFilters);
  return {
    data: response.data.map(transformTransactionData),
    meta: {
      currentPage: response.meta.current_page,
      totalPages: response.meta.total_pages,
      totalCount: response.meta.total_count,
      perPage: response.meta.per_page,
    },
  };
}

/**
 * Fetch unchecked transactions (synced from banks)
 * GET /api/v1/synced_transactions
 */
export async function fetchUncheckedTransactions(): Promise<Transaction[]> {
  const response = await transactionsApi.getSyncedTransactions();
  return response.data.map(transformSyncedTransactionData);
}

/**
 * Discard synced transaction
 * PATCH /api/v1/synced_transactions/{id}/discard
 */
export async function discardSyncedTransaction(
  id: string | number
): Promise<{ message: string }> {
  return await transactionsApi.discardSyncedTransaction(id);
}

/**
 * Fetch a single transaction
 * GET /api/v1/transactions/{id}
 */
export async function fetchTransaction(
  id: string | number
): Promise<Transaction> {
  const response = await transactionsApi.getTransaction(id);
  return transformTransactionData(response.data);
}

/**
 * Fetch financial categories
 * GET /api/v1/financial_categories
 */
export async function fetchCategories(
  type?: "income" | "expense"
): Promise<TransactionCategory[]> {
  const response = await financialCategoriesApi.listCategories(type);
  return response.data.map(transformFinancialCategoryData);
}

/**
 * Fetch invoice categories
 * GET /api/v1/invoice_categories
 */
export async function fetchInvoiceCategories(): Promise<InvoiceCategory[]> {
  const response = await invoiceCategoriesApi.getCategories();
  return response.data.map(transformInvoiceCategoryData);
}

/**
 * Create a new transaction
 * POST /api/v1/transactions
 */
export async function createTransaction(
  transactionData: CreateTransactionRequest
): Promise<Transaction> {
  const response = await transactionsApi.createTransaction(transactionData);
  return transformTransactionData(response.data);
}

/**
 * Update a transaction
 * PUT /api/v1/transactions/{id}
 */
export async function updateTransaction(
  id: string | number,
  transactionData: CreateTransactionRequest["transaction"] & {
    receipt?: File;
  }
): Promise<Transaction> {
  const response = await transactionsApi.updateTransaction(id, {
    transaction: transactionData,
    receipt: transactionData.receipt,
  });
  return transformTransactionData(response.data);
}

/**
 * Delete a transaction
 * DELETE /api/v1/transactions/{id}
 */
export async function deleteTransaction(id: string | number): Promise<boolean> {
  await transactionsApi.deleteTransaction(id);
  return true;
}

// ============================================
// Dashboard API
// ============================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await dashboardApi.getDashboardStats();
  return transformDashboardStatsData(response.data);
}

export async function fetchRevenueExpenseData(): Promise<RevenueExpenseData[]> {
  await delay();
  return revenueExpenseData;
}

export async function fetchCategoryData(): Promise<CategoryData[]> {
  await delay();
  return categoryData;
}

export async function fetchProfitLossData(): Promise<ProfitLossData[]> {
  await delay();
  return profitLossData;
}

// ============================================
// Bank Connections API
// ============================================

export async function fetchBankConnections(): Promise<BankConnection[]> {
  const response = await bankConnectionsApi.listBankConnections();
  return response.data.map(transformBankConnectionData);
}

export async function fetchBankConnection(
  id: string | number
): Promise<BankConnection | null> {
  const connections = await fetchBankConnections();
  return connections.find((b) => b.id === Number(id)) || null;
}

export async function syncBankConnection(id: string | number): Promise<void> {
  await bankConnectionsApi.syncBankConnection(id);
}

export async function toggleBankConnection(
  id: string | number
): Promise<BankConnection> {
  const response = await bankConnectionsApi.toggleBankConnection(id);
  return transformBankConnectionData(response.data);
}

export async function fetchBanks(): Promise<Bank[]> {
  const response = await bankConnectionsApi.getAvailableBanks();
  return response.data.map(transformBankData);
}

export async function initiateBankConnection(institutionId: string): Promise<{
  redirect_url: string;
  requisition_id: string;
}> {
  const response = await bankConnectionsApi.initiateConnection({
    institution_id: institutionId,
    locale: "en",
  });
  return response.data;
}

export async function completeBankConnection(): Promise<BankConnection> {
  const response = await bankConnectionsApi.completeConnection({});
  return transformBankConnectionData(response.data);
}

// ============================================
// VAT Reports API
// ============================================

export async function fetchVatReports(): Promise<VatReport[]> {
  await delay();
  return vatReports;
}

export async function fetchVatReport(id: string): Promise<VatReport | null> {
  await delay();
  return vatReports.find((v) => v.id === id) || null;
}

export async function createVatReport(
  data: Omit<VatReport, "id" | "createdAt">
): Promise<VatReport> {
  await delay();
  const newReport: VatReport = {
    ...data,
    id: `vat-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newReport;
}

export async function submitVatReport(id: string): Promise<VatReport | null> {
  await delay(1500); // Longer delay to simulate submission
  const report = vatReports.find((v) => v.id === id);
  if (!report) return null;
  return {
    ...report,
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
}

// ============================================
// Subscription API
// ============================================

export async function fetchPlans(): Promise<Plan[]> {
  const response = await plansApi.listPlans();
  return response.data;
}

export async function fetchSubscription(): Promise<Subscription | null> {
  try {
    const response = await subscriptionApi.getSubscription();
    return transformSubscriptionData(response.data);
  } catch {
    // If no subscription exists (404), return null
    return null;
  }
}

export async function fetchPaymentMethod(): Promise<PaymentMethod | null> {
  try {
    const response = await paymentMethodApi.getPaymentMethod();
    return transformPaymentMethodData(response.data);
  } catch {
    // If no payment method exists (404), return null
    return null;
  }
}

export async function updateSubscription(
  _data: Partial<Subscription> // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<Subscription> {
  // TODO: Implement subscription update API call
  throw new Error("Subscription update not implemented yet");
}

export async function cancelSubscription(): Promise<Subscription> {
  // TODO: Implement subscription cancellation API call
  throw new Error("Subscription cancellation not implemented yet");
}

// ============================================
// Invoice Settings API
// ============================================

export async function fetchInvoiceSettings(): Promise<InvoiceSettings | null> {
  const response = await invoiceSettingsApi.getInvoiceSettings();
  return response.data ? transformInvoiceSettingData(response.data) : null;
}

export async function fetchCurrencies(): Promise<Currency[]> {
  const response = await invoiceSettingsApi.getCurrencies();
  return response.data.map(transformCurrencyData);
}

export async function createInvoiceSettings(
  data: InvoiceSettingsInput
): Promise<InvoiceSettings> {
  const response = await invoiceSettingsApi.createInvoiceSettings({
    invoice_setting: humps.decamelizeKeys(
      data
    ) as CreateInvoiceSettingRequest["invoice_setting"],
  });

  if (!response.data) {
    throw new Error("Failed to create invoice settings");
  }

  return transformInvoiceSettingData(response.data);
}

export async function updateInvoiceSettings(
  data: InvoiceSettingsInput
): Promise<InvoiceSettings> {
  const response = await invoiceSettingsApi.updateInvoiceSettings({
    invoice_setting: humps.decamelizeKeys(
      data
    ) as UpdateInvoiceSettingRequest["invoice_setting"],
  });

  if (!response.data) {
    throw new Error("Failed to update invoice settings");
  }

  return transformInvoiceSettingData(response.data);
}

// ============================================
// Settings API
// ============================================

export async function fetchSettings(): Promise<Settings> {
  const response = await settingsApi.getSettings();
  return transformSettingsData(response.data);
}

export async function updateSettings(
  data: Partial<ApiSettingsData>
): Promise<Settings> {
  const response = await settingsApi.updateSettings(data);
  return transformSettingsData(response.data);
}

// ============================================
// VAT Status API
// ============================================

/**
 * Fetch VAT status
 * GET /api/v1/vat_status
 */
export async function fetchVatStatus(): Promise<VatStatus | null> {
  try {
    const response = await vatStatusApi.getVatStatus();
    return transformVatStatusData(response.data);
  } catch {
    // Return null if VAT status doesn't exist (404)
    return null;
  }
}

/**
 * Create VAT status
 * POST /api/v1/vat_status
 */
export async function createVatStatus(
  data: VatStatusInput
): Promise<VatStatus> {
  const vatStatus = humps.decamelizeKeys(data);
  const requestObject = { vat_status: vatStatus } as CreateVatStatusRequest;

  const response = await vatStatusApi.createVatStatus(requestObject);
  return transformVatStatusData(response.data);
}

/**
 * Update VAT status
 * PUT /api/v1/vat_status
 */
export async function updateVatStatus(
  data: Partial<VatStatusInput>
): Promise<VatStatus> {
  const vatStatus = humps.decamelizeKeys(data);
  const requestObject = { vat_status: vatStatus } as UpdateVatStatusRequest;

  const response = await vatStatusApi.updateVatStatus(requestObject);
  return transformVatStatusData(response.data);
}

// ============================================
// Export all API functions
// ============================================

export const api = {
  // Profile
  getUser: fetchProfile,
  fetchProfile,
  updateProfile,

  // Clients
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  deleteClient,

  // Invoices
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,

  // Transactions
  fetchTransactions,
  fetchTransaction,
  fetchUncheckedTransactions,
  discardSyncedTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,

  // Financial Categories
  fetchCategories,

  // Dashboard
  fetchDashboardStats,
  fetchRevenueExpenseData,
  fetchCategoryData,
  fetchProfitLossData,

  // Bank Connections
  fetchBanks,
  initiateBankConnection,
  completeBankConnection,
  fetchBankConnections,
  fetchBankConnection,
  syncBankConnection,
  toggleBankConnection,

  // VAT Reports
  fetchVatReports,
  fetchVatReport,
  createVatReport,
  submitVatReport,

  // Subscription
  fetchPlans,
  fetchSubscription,
  fetchPaymentMethod,
  updateSubscription,
  cancelSubscription,

  // Invoice Settings
  fetchInvoiceSettings,
  fetchCurrencies,
  createInvoiceSettings,
  updateInvoiceSettings,

  // VAT Status
  fetchVatStatus,
  createVatStatus,
  updateVatStatus,

  // Settings
  fetchSettings,
  updateSettings,

  // Invoice Categories
  fetchInvoiceCategories,
};
