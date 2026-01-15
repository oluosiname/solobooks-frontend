// Core business types for Solobooks

export interface Profile {
  id: number;
  fullName: string;
  businessName?: string;
  fullAddress?: string;
  phoneNumber?: string;
  taxNumber?: string;
  address?: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
}

export interface ClientAddress {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Client {
  fullAddress: string;
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  businessName?: string;
  taxNumber?: string;
  vatId?: string;
  address?: ClientAddress;
  totalInvoiced: number;
  outstanding: number;
  invoiceCount: number;
  createdAt: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  currency: string;
  notes?: string;
  createdAt: string;
}

export type TransactionType = "income" | "expense";

export interface TransactionCategory {
  id: number;
  name: string;
  categoryType: TransactionType;
  translatedName: string;
}

export interface Transaction {
  id: number;
  description: string;
  date: string;
  vatRate: number;
  vatAmount: number;
  amount: number;
  customerLocation: string;
  customerVatNumber: string | null;
  vatTechnique: string;
  source: string;
  receiptUrl: string | null;
  transactionType: "Expense" | "Income";
  category: TransactionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  perPage?: number;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: PaginationMeta;
}

export type BankConnectionStatus = "active" | "inactive" | "error";

export interface BankConnection {
  id: number;
  status: string;
  syncEnabled: boolean;
  bankName: string;
  accountNumber: string;
  institutionId: string;
  lastSynced: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  pendingTransactionsCount: number;
}

export type VatReportStatus = "draft" | "submitted" | "accepted" | "rejected";

export interface VatReport {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  netRevenue: number;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
  status: VatReportStatus;
  submittedAt: string | null;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  amount_cents: number;
  currency: string;
  stripe_price_id: string;
  features: string[];
}

export type SubscriptionPlan = "free" | "pro" | "business" | "starter";
export type SubscriptionStatus = "active" | "trial" | "cancelled" | "past_due";

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  activatedAt?: string;
  deactivatedAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  created: number;
}

export interface DashboardStats {
  totalIncomeMtd: number;
  incomeChangePercent: number;
  expensesMtd: number;
  expenseChangePercent: number;
  outstandingAmount: number;
  overdueInvoicesCount: number;
  activeClientsCount: number;
  newClientsThisMonth: number;
  clientGrowthPercent: number;
  profitMargin: number;
}

export interface RevenueExpenseData {
  month: string;
  revenue: number;
  expenses: number;
  [key: string]: string | number;
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
  [key: string]: string | number;
}

export interface ProfitLossData {
  month: string;
  profit: number;
  [key: string]: string | number;
}

// Chart data input type for Recharts compatibility
export interface ChartDataInput {
  [key: string]: string | number;
}

// Invoice Settings types
export interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
  default: boolean;
}

export interface InvoiceSettings {
  id: number;
  prefix: string;
  language: "en" | "de";
  accountHolder: string;
  accountNumber: string | null;
  bankName: string | null;
  iban: string | null;
  bic: string | null;
  swift: string | null;
  sortCode: string | null;
  routingNumber: string | null;
  defaultNote: string | null;
  currency: Currency;
}

export interface InvoiceSettingsInput {
  prefix: string;
  currencyId: number;
  language: "en" | "de";
  accountHolder: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  bic?: string;
  swift?: string;
  sortCode?: string;
  routingNumber?: string;
  defaultNote?: string;
}

// Settings types
export interface Settings {
  id: number;
  language: string;
  currency: Currency;
  notificationPreferences: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    monthlySummary: boolean;
  };
  privacyPreferences: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    dataRetentionYears: number;
    dataProcessingLocation: string;
    clientConsentTrackingEnabled: boolean;
    clientDeletionRequestsEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// VAT Status types
export type DeclarationPeriod = "monthly" | "quarterly" | "yearly";

export interface VatStatus {
  id: number;
  vatRegistered: boolean;
  declarationPeriod: DeclarationPeriod;
  vatNumber: string | null;
  startsOn: string | null;
  kleinunternehmer: boolean;
  taxExemptReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VatStatusInput {
  vatRegistered: boolean;
  declarationPeriod: DeclarationPeriod;
  vatNumber?: string | null;
  startsOn?: string | null;
  kleinunternehmer: boolean;
  taxExemptReason?: string | null;
}
