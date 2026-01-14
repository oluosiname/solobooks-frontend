/**
 * API Service Layer
 *
 * This module provides API-like functions that simulate backend calls.
 * Currently uses mock data, but can be easily switched to real API calls.
 *
 * Each function returns a Promise to mimic async API behavior.
 */

import {
  mockUser,
  invoices,
  transactions,
  uncheckedTransactions,
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
import type { ClientData } from "@/lib/clients-api";
import { invoiceSettingsApi } from "@/lib/invoice-settings-api";
import type { InvoiceSettingData, CurrencyData } from "@/lib/invoice-settings-api";

import type {
  User,
  Client,
  Invoice,
  Transaction,
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
} from "@/types";

// Simulate network delay
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// User API
// ============================================

export async function fetchUser(): Promise<User> {
  await delay();
  return mockUser;
}

export async function updateUser(data: Partial<User>): Promise<User> {
  await delay();
  return { ...mockUser, ...data };
}

// ============================================
// Clients API
// ============================================

/**
 * Helper to transform backend ClientData to frontend Client type
 */
function transformClientData(data: ClientData): Client {
  return {
    id: data.id.toString(),
    name: data.name,
    email: data.email,
    phone: data.phone_number,
    location: data.address?.full_address || data.full_address || '',
    businessName: data.business_name,
    taxNumber: data.business_tax_id,
    vatId: data.vat_number,
    address: data.address ? {
      street: data.address.street_address,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.postal_code,
      country: data.address.country,
    } : undefined,
    totalInvoiced: 0, // TODO: Add when backend provides this
    outstanding: 0, // TODO: Add when backend provides this
    invoiceCount: 0, // TODO: Add when backend provides this
    createdAt: new Date().toISOString(), // TODO: Add when backend provides this
  };
}

export async function fetchClients(): Promise<Client[]> {
  const response = await clientsApi.listClients();
  return response.data.map(transformClientData);
}

export async function fetchClient(id: string): Promise<Client | null> {
  const response = await clientsApi.getClient(id);
  return transformClientData(response.data);
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt" | "totalInvoiced" | "outstanding" | "invoiceCount">
): Promise<Client> {
  const response = await clientsApi.createClient({
    client: {
      name: data.name,
      email: data.email,
      phone_number: data.phone,
      business_name: data.businessName,
      business_tax_id: data.taxNumber,
      vat_number: data.vatId,
      address: data.address ? {
        street_address: data.address.street,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.zipCode,
        country: data.address.country,
      } : undefined,
    },
  });
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
      ...(data.phone && { phone_number: data.phone }),
      ...(data.businessName && { business_name: data.businessName }),
      ...(data.taxNumber && { business_tax_id: data.taxNumber }),
      ...(data.vatId && { vat_number: data.vatId }),
      ...(data.address && {
        address: {
          street_address: data.address.street,
          city: data.address.city,
          state: data.address.state,
          postal_code: data.address.zipCode,
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

export async function fetchTransactions(): Promise<Transaction[]> {
  await delay();
  return transactions;
}

export async function fetchUncheckedTransactions(): Promise<Transaction[]> {
  await delay();
  return uncheckedTransactions;
}

export async function fetchTransaction(
  id: string
): Promise<Transaction | null> {
  await delay();
  return transactions.find((t) => t.id === id) || null;
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  await delay();
  const newTransaction: Transaction = {
    ...data,
    id: `txn-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newTransaction;
}

export async function updateTransaction(
  id: string,
  data: Partial<Transaction>
): Promise<Transaction | null> {
  await delay();
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return null;
  return { ...transaction, ...data };
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await delay();
  return transactions.some((t) => t.id === id);
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

export async function syncBankConnection(id: string): Promise<BankConnection | null> {
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

/**
 * Helper to transform backend InvoiceSettingData to frontend InvoiceSettings type
 */
function transformInvoiceSettingData(data: InvoiceSettingData): InvoiceSettings {
  return {
    id: data.id,
    prefix: data.prefix,
    language: data.language,
    accountHolder: data.account_holder,
    accountNumber: data.account_number,
    bankName: data.bank_name,
    iban: data.iban,
    bic: data.bic,
    swift: data.swift,
    sortCode: data.sort_code,
    routingNumber: data.routing_number,
    defaultNote: data.default_note,
    currency: transformCurrencyData(data.currency),
  };
}

/**
 * Helper to transform backend CurrencyData to frontend Currency type
 */
function transformCurrencyData(data: CurrencyData): Currency {
  return {
    id: data.id,
    code: data.code,
    symbol: data.symbol,
    name: data.name,
    default: data.default,
  };
}

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
// Export all API functions
// ============================================

export const api = {
  // User
  fetchUser,
  updateUser,

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
  fetchUncheckedTransactions,
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
  fetchSubscription,
  fetchPaymentMethod,
  updateSubscription,
  cancelSubscription,

  // Invoice Settings
  fetchInvoiceSettings,
  fetchCurrencies,
  createInvoiceSettings,
  updateInvoiceSettings,
};
