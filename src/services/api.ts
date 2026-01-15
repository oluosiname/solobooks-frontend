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
  dashboardStats,
  revenueExpenseData,
  categoryData,
  profitLossData,
  bankConnections,
  vatReports,
  subscription,
  paymentMethod,
} from "@/data";

import { clientsApi } from "@/lib/clients-api";
import type { CreateClientRequest } from "@/lib/clients-api";
import { invoiceSettingsApi } from "@/lib/invoice-settings-api";
import { vatStatusApi } from "@/lib/vat-status-api";
import type {
  CreateVatStatusRequest,
  UpdateVatStatusRequest,
} from "@/lib/vat-status-api";
import { profileApi } from "@/lib/profile-api";
import type { UpdateProfileRequest } from "@/lib/profile-api";
import { transactionsApi } from "@/lib/transactions-api";
import type { TransactionFilters as ApiTransactionFilters } from "@/lib/transactions-api";
import { plansApi } from "@/lib/plans-api";

import type {
  User,
  Client,
  Invoice,
  Transaction,
  TransactionFilters,
  PaginatedTransactions,
  BankConnection,
  VatReport,
  Subscription,
  PaymentMethod,
  DashboardStats,
  RevenueExpenseData,
  CategoryData,
  ProfitLossData,
  InvoiceSettings,
  InvoiceSettingsInput,
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
} from "./api-transformer";
import humps from "humps";

// Simulate network delay
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Profile API
// ============================================

export async function fetchProfile(): Promise<User> {
  const response = await profileApi.getProfile();
  return transformProfileData(response.data);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const profile = humps.decamelizeKeys({
    fullName: data.name,
    businessName: data.businessName,
    phoneNumber: data.phoneNumber,
    taxNumber: data.taxId,
  });
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

export async function fetchInvoices(): Promise<Invoice[]> {
  await delay();
  return invoices;
}

export async function fetchInvoice(id: string): Promise<Invoice | null> {
  await delay();
  return invoices.find((i) => i.id === id) || null;
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "createdAt">
): Promise<Invoice> {
  await delay();
  const newInvoice: Invoice = {
    ...data,
    id: `inv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newInvoice;
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
 * Fetch a single transaction by ID
 * GET /api/v1/transactions/{id}
 */
export async function fetchTransaction(
  id: string | number
): Promise<Transaction | null> {
  try {
    const response = await transactionsApi.getTransaction(id);
    return transformTransactionData(response.data);
  } catch {
    return null;
  }
}

/**
 * Create a new transaction
 * POST /api/v1/transactions
 */
export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const response = await transactionsApi.createTransaction({
    transaction: {
      description: data.description,
      amount: data.amount,
      vat_rate: data.vatRate,
      vat_amount: data.vatAmount,
      customer_location: data.customerLocation,
      customer_vat_number: data.customerVatNumber || undefined,
      vat_technique: data.vatTechnique,
      source: data.source,
      receipt_url: data.receiptUrl || undefined,
      category_id: data.category?.id,
    },
  });
  return transformTransactionData(response.data);
}

/**
 * Update a transaction
 * PUT /api/v1/transactions/{id}
 */
export async function updateTransaction(
  id: string | number,
  data: Partial<Transaction>
): Promise<Transaction | null> {
  const response = await transactionsApi.updateTransaction(id, {
    transaction: {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.vatRate !== undefined && { vat_rate: data.vatRate }),
      ...(data.vatAmount !== undefined && { vat_amount: data.vatAmount }),
      ...(data.customerLocation !== undefined && {
        customer_location: data.customerLocation,
      }),
      ...(data.customerVatNumber !== undefined && {
        customer_vat_number: data.customerVatNumber || undefined,
      }),
      ...(data.vatTechnique !== undefined && {
        vat_technique: data.vatTechnique,
      }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.receiptUrl !== undefined && {
        receipt_url: data.receiptUrl || undefined,
      }),
      ...(data.category?.id !== undefined && { category_id: data.category.id }),
    },
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
  await delay();
  return dashboardStats;
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
  await delay();
  return bankConnections;
}

export async function fetchBankConnection(
  id: string
): Promise<BankConnection | null> {
  await delay();
  return bankConnections.find((b) => b.id === id) || null;
}

export async function syncBankConnection(
  id: string
): Promise<BankConnection | null> {
  await delay(1000); // Longer delay to simulate sync
  const connection = bankConnections.find((b) => b.id === id);
  if (!connection) return null;
  return { ...connection, lastSynced: new Date().toISOString() };
}

export async function disconnectBank(id: string): Promise<boolean> {
  await delay();
  return bankConnections.some((b) => b.id === id);
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

export async function fetchSubscription(): Promise<Subscription> {
  await delay();
  return subscription;
}

export async function fetchPaymentMethod(): Promise<PaymentMethod> {
  await delay();
  return paymentMethod;
}

export async function updateSubscription(
  data: Partial<Subscription>
): Promise<Subscription> {
  await delay();
  return { ...subscription, ...data };
}

export async function cancelSubscription(): Promise<Subscription> {
  await delay();
  return { ...subscription, cancelAtPeriodEnd: true };
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
    invoice_setting: {
      prefix: data.prefix,
      currency_id: data.currencyId,
      language: data.language,
      account_holder: data.accountHolder,
      account_number: data.accountNumber,
      bank_name: data.bankName,
      iban: data.iban,
      bic: data.bic,
      swift: data.swift,
      sort_code: data.sortCode,
      routing_number: data.routingNumber,
      default_note: data.defaultNote,
    },
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
    invoice_setting: {
      prefix: data.prefix,
      currency_id: data.currencyId,
      language: data.language,
      account_holder: data.accountHolder,
      account_number: data.accountNumber,
      bank_name: data.bankName,
      iban: data.iban,
      bic: data.bic,
      swift: data.swift,
      sort_code: data.sortCode,
      routing_number: data.routingNumber,
      default_note: data.defaultNote,
    },
  });

  if (!response.data) {
    throw new Error("Failed to update invoice settings");
  }

  return transformInvoiceSettingData(response.data);
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
  createTransaction,
  updateTransaction,
  deleteTransaction,

  // Dashboard
  fetchDashboardStats,
  fetchRevenueExpenseData,
  fetchCategoryData,
  fetchProfitLossData,

  // Bank Connections
  fetchBankConnections,
  fetchBankConnection,
  syncBankConnection,
  disconnectBank,

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
};
