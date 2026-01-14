import { ClientData } from "@/lib/clients-api";
import { Client } from "@/types";
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
