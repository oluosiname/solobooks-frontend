"use client";

import { Link2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { styles } from "@/lib/styles";
import type { PossibleTransaction } from "@/types";

interface PossibleMatchCardProps {
  possibleTransaction: PossibleTransaction;
  onLink: () => void;
  onDismiss: () => void;
  isLinking?: boolean;
  isDismissing?: boolean;
  className?: string;
}

export function PossibleMatchCard({
  possibleTransaction,
  onLink,
  onDismiss,
  isLinking = false,
  isDismissing = false,
  className,
}: PossibleMatchCardProps) {
  const t = useTranslations();
  const isLoading = isLinking || isDismissing;

  return (
    <div className={cn(styles.card, "border-amber-200 bg-amber-50/50", className)}>
      <div className={cn(styles.cardContent, "space-y-4")}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <Link2 className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="font-semibold text-amber-900">
            {t("transactions.possibleMatch.cardTitle")}
          </h3>
        </div>

        <div className="rounded-md border border-amber-200 bg-white p-3">
          <p className="font-medium text-slate-900 truncate">
            {possibleTransaction.description}
          </p>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {formatDate(possibleTransaction.date)}
            </span>
            <span
              className={cn(
                "font-semibold",
                possibleTransaction.transactionType === "Income"
                  ? "text-emerald-600"
                  : "text-slate-900"
              )}
            >
              {possibleTransaction.transactionType === "Income" ? "+" : "-"}
              {formatCurrency(Math.abs(possibleTransaction.amount))}
            </span>
          </div>
          {possibleTransaction.category && (
            <p className="mt-1 text-xs text-slate-400">
              {possibleTransaction.category.translatedName}
            </p>
          )}
        </div>

        <p className="text-sm text-amber-700">
          {t("transactions.possibleMatch.question")}
        </p>

        <div className="space-y-2">
          <button
            onClick={onLink}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link2 className="h-4 w-4" />
            {isLinking
              ? t("transactions.possibleMatch.linking")
              : t("transactions.possibleMatch.linkButton")}
          </button>
          <button
            onClick={onDismiss}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            {isDismissing
              ? t("transactions.possibleMatch.dismissing")
              : t("transactions.possibleMatch.dismissButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
