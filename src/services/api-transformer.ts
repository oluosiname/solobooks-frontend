import { ClientData } from "@/lib/clients-api";
import { InvoiceSettingData, CurrencyData } from "@/lib/invoice-settings-api";
import { VatStatusData } from "@/lib/vat-status-api";
import { ProfileData } from "@/lib/profile-api";
import { TransactionData } from "@/lib/transactions-api";
import type { SubscriptionData } from "@/lib/subscription-api";
import type { PaymentMethodData } from "@/lib/payment-method-api";
import {
  Client,
  InvoiceSettings,
  Currency,
  VatStatus,
  User,
  Transaction,
  Subscription,
  PaymentMethod,
} from "@/types";
import humps from "humps";

function camelize<T>(input: unknown): T {
  return humps.camelizeKeys(input) as T;
}

export function transformClientData(data: ClientData): Client {
  const base = camelize<Client>(data);
  return {
    address: data.address
      ? {
          streetAddress: data.address.street_address,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postal_code,
          country: data.address.country,
        }
      : undefined,
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

export function transformTransactionData(data: TransactionData): Transaction {
  return camelize<Transaction>(data);
}

export function transformProfileData(data: ProfileData): User {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = camelize<any>(data);
  return {
    id: String(data.id),
    email: "", // TODO: Add when backend provides this
    name: base.fullName,
    businessName: base.businessName || "",
    fullAddress: data.address?.full_address,
    phoneNumber: base.phoneNumber || "",
    address: data.address?.full_address || "",
    taxId: base.taxNumber || "",
    vatNumber: "", // TODO: Add when backend provides this
    website: "", // TODO: Add when backend provides this
    language: "en" as const, // TODO: Add when backend provides this
    currency: "EUR", // TODO: Add when backend provides this
    createdAt: base.createdAt,
  };
}

export function transformSubscriptionData(
  data: SubscriptionData
): Subscription {
  return camelize<Subscription>(data);
}

export function transformPaymentMethodData(data: PaymentMethodData): PaymentMethod {
  return {
    id: data.id,
    type: data.type,
    brand: data.brand,
    last4: data.last4,
    expiryMonth: data.exp_month,
    expiryYear: data.exp_year,
    created: data.created,
  };
}
