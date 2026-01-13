import type { BankConnection } from "@/types";

export const bankConnections: BankConnection[] = [
  {
    id: "bank-1",
    bankName: "Deutsche Bank",
    accountName: "Business Checking",
    accountNumber: "****4567",
    balance: 45230.5,
    currency: "EUR",
    lastSynced: "2025-01-12T08:30:00Z",
    status: "connected",
  },
  {
    id: "bank-2",
    bankName: "Commerzbank",
    accountName: "Savings Account",
    accountNumber: "****8901",
    balance: 125000,
    currency: "EUR",
    lastSynced: "2025-01-12T08:30:00Z",
    status: "connected",
  },
  {
    id: "bank-3",
    bankName: "N26",
    accountName: "Business Account",
    accountNumber: "****2345",
    balance: 8750.25,
    currency: "EUR",
    lastSynced: "2025-01-11T14:00:00Z",
    status: "connected",
  },
];
