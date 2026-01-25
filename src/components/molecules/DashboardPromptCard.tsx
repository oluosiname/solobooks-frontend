"use client";

import {
  X,
  User,
  Building2,
  FileText,
  CreditCard,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button, Card } from "@/components/atoms";
import { useRouter } from "next/navigation";
import type { PromptCard } from "@/types/help";
import { cn } from "@/lib/utils";

export interface DashboardPromptCardProps {
  card: PromptCard;
  onDismiss: (key: string) => void;
}

const iconMap = {
  user: User,
  bank: Building2,
  invoice: FileText,
  "credit-card": CreditCard,
  clock: Clock,
  alert: AlertTriangle,
  calendar: Calendar,
};

export function DashboardPromptCard({
  card,
  onDismiss,
}: DashboardPromptCardProps) {
  const router = useRouter();
  const Icon = iconMap[card.icon] || FileText;

  const handleAction = () => {
    router.push(card.actionUrl);
  };

  const handleDismiss = () => {
    onDismiss(card.key);
  };

  return (
    <Card
      className={cn(
        "relative p-4 border-l-4",
        card.priority === 1 && "border-l-red-500 bg-red-50/50",
        card.priority === 2 && "border-l-amber-500 bg-amber-50/50",
        card.priority === 3 && "border-l-blue-500 bg-blue-50/50"
      )}
    >
      {card.dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss card"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-2 rounded-lg",
            card.priority === 1 && "bg-red-100 text-red-600",
            card.priority === 2 && "bg-amber-100 text-amber-600",
            card.priority === 3 && "bg-blue-100 text-blue-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            {card.title}
          </h3>
          <p className="text-sm text-slate-600 mb-3">{card.description}</p>
          <Button onClick={handleAction} size="sm" variant="primary">
            {getActionLabel(card.key)}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function getActionLabel(key: string): string {
  const labels: Record<string, string> = {
    profile_incomplete: "Complete Profile",
    no_bank_connection: "Connect Bank",
    no_invoices: "Create Invoice",
    no_payment_method: "Add Payment Method",
    trial_ending_soon: "Upgrade Now",
    overdue_invoices: "View Invoices",
    vat_due_soon: "View VAT Reports",
  };
  return labels[key] || "Take Action";
}
