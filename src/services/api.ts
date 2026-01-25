/**
 * API Service Layer
 *
 * This module provides API-like functions that simulate backend calls.
 * Currently uses mock data, but can be easily switched to real API calls.
 *
 * Each function returns a Promise to mimic async API behavior.
 */

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
import { pnlReportsApi } from "@/lib/pnl-reports-api";
import type { PnlData } from "@/types";
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
import { vatReportsApi } from "@/lib/vat-reports-api";
import { zmdoReportsApi } from "@/lib/zmdo-reports-api";
import { stripeInvoicesApi } from "@/lib/stripe-invoices-api";
import { helpApi } from "@/lib/help-api";
import { dataExportsApi } from "@/lib/data-exports-api";
import type { ExportType } from "@/lib/data-exports-api";

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
  ZmdoReport,
  ZmdoReportPreview,
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
  InvoiceCreationRequirements,
  Currency,
  VatStatus,
  VatStatusInput,
  Plan,
  VatReportPreview,
  StripeInvoice,
  HelpItem,
} from "@/types";

import {
  camelize,
  transformClientData,
  transformInvoiceSettingData,
  transformCurrencyData,
  transformVatStatusData,
  transformVatReportData,
  transformVatReportPreviewData,
  transformZmdoReportData,
  transformZmdoReportPreviewData,
  transformProfileData,
  transformTransactionData,
  transformSubscriptionData,
  transformPaymentMethodData,
  transformBankConnectionData,
  transformBankData,
  transformSyncedTransactionData,
  transformSettingsData,
  transformInvoiceCreationRequirements,
  transformDashboardStatsData,
  transformFinancialCategoryData,
  transformInvoiceCategoryData,
  transformInvoiceData,
  transformPnlData,
  transformVatPreviewData,
  transformStripeInvoiceData,
  transformHelpItemData,
  type VatPreview,
} from "./api-transformer";


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

export async function fetchInvoice(_id: string): Promise<Invoice | null> {
  throw new Error("Fetch invoice by ID API endpoint not implemented yet");
}

export async function createInvoice(data: {
  clientId: string;
  category: string;
  currency: string;
  language: string;
  invoiceDate: string;
  dueDate: string;
  vatRate?: number;
  lineItems: Array<{
    id: string;
    description: string;
    unitPrice: number;
    unit: string;
    quantity: number;
  }>;
}): Promise<Invoice> {
  const invoiceData = {
    invoice: {
      client_id: data.clientId,
      invoice_category_id: data.category,
      currency_id: data.currency,
      date: data.invoiceDate,
      due_date: data.dueDate,
      language: data.language,
      vat_rate: data.vatRate || 19, // Use provided VAT rate or default to 19
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
  _id: string,
  _data: Partial<Invoice>
): Promise<Invoice | null> {
  throw new Error("Update invoice API endpoint not implemented yet");
}

export async function deleteInvoice(_id: string): Promise<boolean> {
  throw new Error("Delete invoice API endpoint not implemented yet");
}

export async function fetchInvoiceCreationRequirements(): Promise<InvoiceCreationRequirements> {
  try {
    const response = await invoicesApi.getCreationRequirements();
    return transformInvoiceCreationRequirements(response);
  } catch {
    // Return default values if the endpoint doesn't exist yet
    return {
      canCreate: true,
      requirements: {
        profileComplete: true,
        invoiceSettingExists: true,
      },
    };
  }
}

export async function calculateVatPreview(data: {
  subtotal: number;
  vatRate: number;
  clientCountry: string;
}): Promise<VatPreview> {
  const response = await invoicesApi.calculateVatPreview({
    subtotal: data.subtotal,
    vat_rate: data.vatRate,
    client_country: data.clientCountry,
  });

  return transformVatPreviewData(response);
}

export async function sendInvoice(id: string): Promise<Invoice> {
  const response = await invoicesApi.sendInvoice(id);
  return transformInvoiceData(response.data);
}

export async function payInvoice(id: string): Promise<Invoice> {
  const response = await invoicesApi.payInvoice(id);
  return transformInvoiceData(response.data);
}

export async function downloadInvoicePdf(id: string): Promise<Blob> {
  return await invoicesApi.downloadInvoicePdf(id);
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
 * Bulk discard synced transactions
 * POST /api/v1/synced_transactions/bulk_discard
 */
export async function bulkDiscardSyncedTransactions(
  ids: (string | number)[]
): Promise<{ message: string }> {
  return await transactionsApi.bulkDiscardSyncedTransactions(ids);
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

export async function downloadCsvTemplate(): Promise<Blob> {
  return transactionsApi.downloadCsvTemplate();
}

export async function downloadXlsxTemplate(): Promise<Blob> {
  return transactionsApi.downloadXlsxTemplate();
}

export async function importTransactions(
  file: File
): Promise<{ message: string }> {
  const response = await transactionsApi.importTransactions(file);
  return response.data;
}

// ============================================
// Dashboard API
// ============================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await dashboardApi.getDashboardStats();
  return transformDashboardStatsData(response.data);
}

// ============================================
// PNL Reports API
// ============================================

export async function fetchPnlData(
  startDate: string,
  endDate: string
): Promise<PnlData> {
  const response = await pnlReportsApi.getPnlData(startDate, endDate);
  return transformPnlData(response.data);
}

export async function downloadPnlPdf(
  startDate: string,
  endDate: string
): Promise<void> {
  try {
    const blob = await pnlReportsApi.downloadPnlPdf(startDate, endDate);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PNL_Report_${startDate}_${endDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}


// Legacy functions - now use PNL data

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

export async function fetchVatReports(): Promise<{
  upcoming: VatReport[];
  submitted: VatReport[];
}> {
  const response = await vatReportsApi.listVatReports();
  return {
    upcoming: response.data.upcoming.map(transformVatReportData),
    submitted: response.data.submitted.map(transformVatReportData),
  };
}

export async function submitVatReport(id: string): Promise<{
  success: boolean;
  message: string;
  pdfUrl?: string;
}> {
  const response = await vatReportsApi.submitVatReport(id);
  return camelize(response.data);
}

export async function testSubmitVatReport(id: string): Promise<{
  success: boolean;
  message: string;
  pdfData?: string;
}> {
  const response = await vatReportsApi.testSubmitVatReport(id);
  return camelize(response.data);
}

export async function previewVatReport(id: string): Promise<VatReportPreview> {
  const response = await vatReportsApi.previewVatReport(id);
  return transformVatReportPreviewData(response.data);
}

// ============================================
// ZMDO Reports API (Zusammenfassende Meldung / EC Sales List)
// ============================================

export async function fetchZmdoReports(): Promise<{
  draft: ZmdoReport[];
  submitted: ZmdoReport[];
}> {
  const response = await zmdoReportsApi.listZmdoReports();
  return {
    draft: response.data.draft.map(transformZmdoReportData),
    submitted: response.data.submitted.map(transformZmdoReportData),
  };
}

export async function submitZmdoReport(id: string): Promise<{
  success: boolean;
  message: string;
  pdfUrl?: string;
}> {
  const response = await zmdoReportsApi.submitZmdoReport(id);
  return camelize(response.data);
}

export async function testSubmitZmdoReport(id: string): Promise<{
  success: boolean;
  message: string;
  pdfData?: string;
}> {
  const response = await zmdoReportsApi.testSubmitZmdoReport(id);
  return camelize(response.data);
}

export async function previewZmdoReport(id: string): Promise<ZmdoReportPreview> {
  const response = await zmdoReportsApi.previewZmdoReport(id);
  return transformZmdoReportPreviewData(response.data);
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

export async function updateSubscription(data: { plan: string }): Promise<Subscription> {
  const response = await subscriptionApi.changeSubscription(data);
  return transformSubscriptionData(response.data);
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
// Stripe Invoices API
// ============================================

export async function fetchStripeInvoices(year?: number): Promise<StripeInvoice[]> {
  const response = await stripeInvoicesApi.listStripeInvoices(year);
  return response.data.map(transformStripeInvoiceData);
}

// ============================================
// Help API
// ============================================

export async function getHelpForUser(locale?: string): Promise<HelpItem[]> {
  const response = await helpApi.getHelpForUser(locale);
  return response.data.map(transformHelpItemData);
}

export async function getHelpItem(key: string): Promise<HelpItem> {
  const response = await helpApi.getHelpItem(key);
  return transformHelpItemData(response.data);
}

export async function getHelpByCategory(category: string): Promise<HelpItem[]> {
  const response = await helpApi.getHelpByCategory(category);
  return response.data.map(transformHelpItemData);
}

export async function dismissHelp(key: string): Promise<void> {
  await helpApi.dismissHelp(key);
}

// ============================================
// Dashboard Prompt Cards
// ============================================

export async function dismissPromptCard(key: string): Promise<void> {
  await dashboardApi.dismissPromptCard(key);
}

// ============================================
// Data Exports API
// ============================================

export async function createDataExport(exportType: ExportType): Promise<{
  uuid: string;
  exportType: string;
  status: string;
  createdAt: string;
}> {
  const response = await dataExportsApi.createDataExport(exportType);
  return {
    uuid: response.data.uuid,
    exportType: response.data.export_type,
    status: response.data.status,
    createdAt: response.data.created_at,
  };
}

export async function getLatestDataExport(exportType: ExportType): Promise<{
  uuid: string;
  exportType: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
} | null> {
  const response = await dataExportsApi.getLatestDataExport(exportType);
  if (!response.data) {
    return null;
  }
  return {
    uuid: response.data.uuid,
    exportType: response.data.export_type,
    status: response.data.status,
    createdAt: response.data.created_at,
    completedAt: response.data.completed_at,
    expiresAt: response.data.expires_at,
    downloadUrl: response.data.download_url,
  };
}

export async function downloadDataExport(id: string): Promise<{ blob: Blob; contentType: string }> {
  return dataExportsApi.downloadDataExport(id);
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
  fetchInvoiceCreationRequirements,
  calculateVatPreview,
  sendInvoice,
  payInvoice,
  downloadInvoicePdf,

  // Transactions
  fetchTransactions,
  fetchTransaction,
  fetchUncheckedTransactions,
  discardSyncedTransaction,
  bulkDiscardSyncedTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  downloadCsvTemplate,
  downloadXlsxTemplate,
  importTransactions,

  // Financial Categories
  fetchCategories,

  // Dashboard
  fetchDashboardStats,
  dismissPromptCard,

  // Help
  getHelpForUser,
  getHelpItem,
  getHelpByCategory,
  dismissHelp,

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
  submitVatReport,
  testSubmitVatReport,
  previewVatReport,

  // ZMDO Reports (EC Sales List)
  fetchZmdoReports,
  submitZmdoReport,
  testSubmitZmdoReport,
  previewZmdoReport,

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

  // PNL Reports
  fetchPnlData,
  downloadPnlPdf,

  // Stripe Invoices
  fetchStripeInvoices,

  // Data Exports
  createDataExport,
  getLatestDataExport,
  downloadDataExport,
};

// Helper functions to process PNL data for different chart types
export function processPnlForRevenueChart(pnlData: PnlData): RevenueExpenseData[] {
  // Return a single data point for the period
  return [{
    month: pnlData.period.label,
    revenue: pnlData.summary.totalIncome,
    expenses: pnlData.summary.totalExpenses,
  }];
}

export function processPnlForCategoryChart(pnlData: PnlData): CategoryData[] {
  const categories: CategoryData[] = [];
  const colors = ['#f43f5e', '#ef4444', '#ec4899', '#d946ef', '#c084fc', '#a855f7', '#9333ea'];

  Object.entries(pnlData.expenseBreakdown.byCategory).forEach(([category, amount], index) => {
    categories.push({
      category,
      amount,
      color: colors[index % colors.length],
    });
  });

  return categories;
}

export function processPnlForProfitChart(pnlData: PnlData): ProfitLossData[] {
  // Return a single data point for the period
  return [{
    month: pnlData.period.label,
    profit: pnlData.summary.netProfit,
  }];
}