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
  clients,
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

export async function fetchClients(): Promise<Client[]> {
  await delay();
  return clients;
}

export async function fetchClient(id: string): Promise<Client | null> {
  await delay();
  return clients.find((c) => c.id === id) || null;
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt" | "totalInvoiced" | "outstanding" | "invoiceCount">
): Promise<Client> {
  await delay();
  const newClient: Client = {
    ...data,
    id: `client-${Date.now()}`,
    totalInvoiced: 0,
    outstanding: 0,
    invoiceCount: 0,
    createdAt: new Date().toISOString(),
  };
  return newClient;
}

export async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<Client | null> {
  await delay();
  const client = clients.find((c) => c.id === id);
  if (!client) return null;
  return { ...client, ...data };
}

export async function deleteClient(id: string): Promise<boolean> {
  await delay();
  return clients.some((c) => c.id === id);
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
};
