/**
 * Help System Type Definitions
 */

export type HelpPosition = "top" | "bottom" | "left" | "right";

export type HelpCategory =
  | "dashboard"
  | "invoices"
  | "clients"
  | "transactions"
  | "settings"
  | "bank_connections"
  | "vat"
  | "onboarding"
  | "tour";

export interface HelpItem {
  key: string;
  title: string;
  content: string;
  category: HelpCategory;
  order: number;
  locale: string;
  targetElement: string; // CSS selector
  position: HelpPosition;
  autoShow: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HelpForUserResponse {
  data: HelpItem[];
}

export interface DismissHelpResponse {
  data: {
    success: boolean;
    message?: string;
  };
}

// Prompt Cards Types
export type PromptCardKey =
  | "profile_incomplete"
  | "no_bank_connection"
  | "no_invoices"
  | "no_payment_method"
  | "trial_ending_soon"
  | "overdue_invoices"
  | "vat_due_soon";

export type PromptCardIcon =
  | "user"
  | "bank"
  | "invoice"
  | "credit-card"
  | "clock"
  | "alert"
  | "calendar";

export interface PromptCard {
  key: PromptCardKey;
  title: string;
  description: string;
  icon: PromptCardIcon;
  actionUrl: string;
  dismissible: boolean;
  priority: number; // 1 = critical, 2 = important, 3 = informational
}
