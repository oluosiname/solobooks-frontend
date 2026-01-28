"use client";

import { Link2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { PossibleTransaction } from "@/types";

interface PossibleMatchBannerProps {
  possibleTransaction: PossibleTransaction;
  onLink: () => void;
  onDismiss: () => void;
  isLinking?: boolean;
  isDismissing?: boolean;
  className?: string;
}

export function PossibleMatchBanner({
  possibleTransaction,
  onLink,
  onDismiss,
  isLinking = false,
  isDismissing = false,
  className,
}: PossibleMatchBannerProps) {
  const t = useTranslations();
  const isLoading = isLinking || isDismissing;

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-200 bg-amber-50 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Link2 className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-amber-900">
            {t("transactions.possibleMatch.title")}
          </h4>
          <p className="mt-1 text-sm text-amber-700">
            {t("transactions.possibleMatch.description")}
          </p>
          <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">
                  {possibleTransaction.description}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(possibleTransaction.date)} · {possibleTransaction.category?.translatedName}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p
                  className={cn(
                    "font-semibold",
                    possibleTransaction.transactionType === "Income"
                      ? "text-emerald-600"
                      : "text-slate-900"
                  )}
                >
                  {possibleTransaction.transactionType === "Income" ? "+" : "-"}
                  {formatCurrency(Math.abs(possibleTransaction.amount))}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={onLink}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Link2 className="h-4 w-4" />
              {isLinking
                ? t("transactions.possibleMatch.linking")
                : t("transactions.possibleMatch.linkButton")}
            </button>
            <button
              onClick={onDismiss}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              {isDismissing
                ? t("transactions.possibleMatch.dismissing")
                : t("transactions.possibleMatch.dismissButton")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
