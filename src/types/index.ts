// Core business types for Solobooks

// API Error types
export interface ApiErrorDetails {
  [field: string]: string[];
}

export interface ApiError {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetails;
  };
  message?: string;
}

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
  date: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  currency: string;
  notes?: string;
  createdAt: string;
  pdfAttached: boolean;
}

export interface InvoiceCreationRequirements {
  canCreate: boolean;
  requirements: {
    profileComplete: boolean;
    invoiceSettingExists: boolean;
  };
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
  category?: TransactionCategory; // For normal transactions
  financialCategory?: TransactionCategory | null; // For synced transactions (camelized from financial_category)
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  transaction_type: "income" | "expense";
  amount: number;
  date: string;
  description: string;
  financial_category_id: string;
  vat_rate?: number;
  customer_location?: string;
  customer_vat_number?: string;
  synced_transaction_id?: string;
  receipt?: File;
}

export interface TransactionFilters {
  page?: number;
  perPage?: number;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: string | number | boolean | undefined;
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

export interface Bank {
  id: string;
  name: string;
  logo?: string;
  countries: string[];
}

export interface BankConnection {
  id: number;
  status: string;
  syncEnabled: boolean;
  bankName: string;
  accountNumber: string;
  institutionId: string;
  lastSyncAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  pendingTransactionsCount: number;
}

export type VatReportStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "rejected"
  | "error";

export interface VatReport {
  id: number;
  status: VatReportStatus;
  startDate: string;
  endDate: string;
  year: number;
  periodLabel: string;
  elsterPeriod: number;
  dueDate: string;
  submittedAt: string | null;
  errorMessage: string | null;
  canSubmit: boolean;
  submittable: boolean;
  overdue: boolean;
  dueSoon: boolean;
  xmlAttached: boolean;
  pdfAttached: boolean;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VatReportPreview {
  report: VatReport;
  financialData: {
    domesticNet: number;
    domesticVat: number;
    euB2bNet: number;
    nonEuNet: number;
    euExpenseNet: number;
    euExpenseVat: number;
    remainingVat: number;
  };
}

export interface VatReportsResponse {
  data: {
    upcoming: VatReport[];
    submitted: VatReport[];
  };
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

// Invoice Category types
export interface InvoiceCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export interface Settings {
  id: number;
  language: string;
  currency: Currency;
  notificationPreferences: {
    invoiceOverdue: boolean;
    vatReminders: boolean;
    deliveryMethods: string[];
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

// Notification types
export type NotificationType = "invoice_overdue" | "vat_reminders" | "payment_received" | "invoice_created";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  status?: string;
  sentAt?: string;
  readAt?: string | null;
  updatedAt?: string;
}

// VAT Status types
export type DeclarationPeriod = "monthly" | "quarterly" | "annually";

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

// PNL Report types
export interface PnlPeriod {
  startDate: string;
  endDate: string;
  label: string;
}

export interface PnlSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
}

export interface PnlIncomeBreakdown {
  byCategory: Record<string, number>;
  notSubjectToVat: number;
  vatRefunded: number;
}

export interface PnlExpenseBreakdown {
  byCategory: Record<string, number>;
  vatPaid: number;
}

export interface PnlData {
  period: PnlPeriod;
  summary: PnlSummary;
  incomeBreakdown: PnlIncomeBreakdown;
  expenseBreakdown: PnlExpenseBreakdown;
}

export interface PnlReportResponse {
  data: PnlData;
}

// Elster Certificate types
export interface ElsterCertificate {
  id: string;
  expired: boolean;
  expiringSoon: boolean;
}

// Stripe Invoice types
export type StripeInvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface StripeInvoice {
  id: string;
  date: string;
  status: StripeInvoiceStatus;
  amountDue: number;
  amountPaid: number;
  currency: string;
  hostedInvoiceUrl: string;
  description: string;
}

export interface StripeInvoicesResponse {
  data: StripeInvoice[];
}

// Google OAuth types
export interface GoogleAuthRequest {
  id_token: string; // Google ID token (JWT)
  plan?: string; // Selected subscription plan
  language?: string; // User language preference
}

export interface GoogleAuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}
