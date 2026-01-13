import type { Subscription, PaymentMethod } from "@/types";

export const subscription: Subscription = {
  id: "sub-1",
  plan: "pro",
  status: "active",
  currentPeriodStart: "2025-01-01",
  currentPeriodEnd: "2025-01-31",
  cancelAtPeriodEnd: false,
  price: 19,
  currency: "EUR",
};

export const paymentMethod: PaymentMethod = {
  id: "pm-1",
  type: "card",
  last4: "4242",
  brand: "Visa",
  expiryMonth: 12,
  expiryYear: 2026,
  isDefault: true,
};
