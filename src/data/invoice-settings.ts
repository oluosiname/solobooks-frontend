import type { Currency } from "@/types";

// Available currencies
export const currencies: Currency[] = [
  {
    id: 1,
    code: "EUR",
    symbol: "€",
    name: "Euro",
    default: true,
  },
  {
    id: 2,
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    default: false,
  },
  {
    id: 3,
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    default: false,
  },
  {
    id: 4,
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    default: false,
  },
];
