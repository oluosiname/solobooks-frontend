import { ClientData } from "@/lib/clients-api";
import {
  InvoiceSettingData,
  CurrencyData,
} from "@/lib/invoice-settings-api";
import { VatStatusData } from "@/lib/vat-status-api";
import { Client, InvoiceSettings, Currency, VatStatus } from "@/types";
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
