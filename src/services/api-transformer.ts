import { ClientData } from "@/lib/clients-api";
import { InvoiceSettingData, CurrencyData } from "@/lib/invoice-settings-api";
import { VatStatusData } from "@/lib/vat-status-api";
import { VatReportData, VatReportPreviewData } from "@/lib/vat-reports-api";
import { ProfileData } from "@/lib/profile-api";
import { TransactionData, SyncedTransactionData } from "@/lib/transactions-api";
import type { SubscriptionData } from "@/lib/subscription-api";
import type { PaymentMethodData } from "@/lib/payment-method-api";
import type { BankConnectionData, BankData } from "@/lib/bank-connections-api";
import { SettingsData as ApiSettingsData } from "@/lib/settings-api";
import { DashboardStatsData } from "@/lib/dashboard-api";
import { FinancialCategoryData } from "@/lib/financial-categories-api";
import { InvoiceCategoryData } from "@/lib/invoice-categories-api";
import {
  Client,
  Invoice,
  InvoiceSettings,
  Currency,
  VatStatus,
  VatReport,
  VatReportPreview,
  Profile,
  Transaction,
  Subscription,
  PaymentMethod,
  BankConnection,
  Settings,
  DashboardStats,
  TransactionCategory,
  InvoiceCategory,
  Bank,
  PnlData,
  PnlReportResponse,
  InvoiceCreationRequirements,
  StripeInvoice,
} from "@/types";
import humps from "humps";
import {
  InvoiceData,
  InvoiceCreationRequirementsResponse,
  VatPreviewResponse,
} from "@/lib/invoices-api";
import type { StripeInvoiceData } from "@/lib/stripe-invoices-api";

export function camelize<T>(input: unknown): T {
  return humps.camelizeKeys(input) as T;
}

export function transformClientData(data: ClientData): Client {
  const base = camelize<Client>(data);
  return {
    ...base,
    totalInvoiced: 0, // TODO: Add when backend provides this
    outstanding: 0, // TODO: Add when backend provides this
    invoiceCount: 0, // TODO: Add when backend provides this
    createdAt: new Date().toISOString(), // TODO: Add when backend provides this
  };
}

export function transformInvoiceSettingData(
  data: InvoiceSettingData
): InvoiceSettings {
  const base = camelize<InvoiceSettings>(data);
  return {
    ...base,
    currency: transformCurrencyData(data.currency),
  };
}

export function transformCurrencyData(data: CurrencyData): Currency {
  return camelize<Currency>(data);
}

export function transformVatStatusData(data: VatStatusData): VatStatus {
  return camelize<VatStatus>(data);
}

export function transformVatReportData(data: VatReportData): VatReport {
  return camelize<VatReport>(data);
}

export function transformVatReportPreviewData(
  data: VatReportPreviewData
): VatReportPreview {
  return {
    report: transformVatReportData(data.report),
    financialData: camelize(data.financial_data),
  };
}

export function transformTransactionData(data: TransactionData): Transaction {
  return camelize<Transaction>(data);
}

export function transformSyncedTransactionData(
  data: SyncedTransactionData
): Transaction {
  return {
    id: data.id,
    description: data.description,
    date: data.booked_at,
    vatRate: 0, // Not provided in synced data
    vatAmount: 0, // Not provided in synced data
    amount: data.amount,
    customerLocation: "", // Not provided in synced data
    customerVatNumber: null, // Not provided in synced data
    vatTechnique: "", // Not provided in synced data
    source: "bank_sync", // Indicate this came from bank sync
    receiptUrl: null, // Not provided in synced data
    transactionType: data.amount >= 0 ? "Income" : "Expense", // Infer from amount
    category: {
      id: 0,
      name: "Uncategorized",
      categoryType: data.amount >= 0 ? "income" : "expense",
      translatedName: "Uncategorized",
    }, // Default category for uncategorized transactions
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function transformProfileData(data: ProfileData): Profile {
  return camelize<Profile>(data);
}

export function transformSubscriptionData(
  data: SubscriptionData
): Subscription {
  return camelize<Subscription>(data);
}

export function transformPaymentMethodData(
  data: PaymentMethodData
): PaymentMethod {
  return camelize<PaymentMethod>(data);
}

export function transformBankConnectionData(
  data: BankConnectionData
): BankConnection {
  return camelize<BankConnection>(data);
}

export function transformSettingsData(data: ApiSettingsData): Settings {
  const base = camelize<Settings>(data);
  return {
    ...base,
    currency: transformCurrencyData(data.currency),
  };
}

export function transformDashboardStatsData(
  data: DashboardStatsData
): DashboardStats {
  return camelize<DashboardStats>(data);
}

export function transformFinancialCategoryData(
  data: FinancialCategoryData
): TransactionCategory {
  return camelize<TransactionCategory>(data);
}

export function transformInvoiceCategoryData(
  data: InvoiceCategoryData
): InvoiceCategory {
  return camelize<InvoiceCategory>(data);
}

export function transformBankData(data: BankData): Bank {
  return camelize<Bank>(data);
}

export function transformInvoiceData(data: InvoiceData): Invoice {
  const base =
    camelize<Omit<Invoice, "clientId" | "currency">>(data);

  return {
    ...base,
    clientId: data.client.id.toString(),
    currency: data.currency.code,
  };
}

export function transformPnlData(data: PnlReportResponse["data"]): PnlData {
  return camelize<PnlData>(data);
}

export function transformInvoiceCreationRequirements(
  data: InvoiceCreationRequirementsResponse
): InvoiceCreationRequirements {
  return camelize<InvoiceCreationRequirements>(data);
}

export interface VatPreview {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  reverseCharge: boolean;
  note: string | null;
}

export function transformVatPreviewData(data: VatPreviewResponse): VatPreview {
  return camelize<VatPreview>(data);
}

export function transformStripeInvoiceData(data: StripeInvoiceData): StripeInvoice {
  return camelize<StripeInvoice>(data);
}
