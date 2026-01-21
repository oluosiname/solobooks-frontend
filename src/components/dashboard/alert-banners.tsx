"use client";

import Link from "next/link";
import {
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Receipt,
  Calendar,
} from "lucide-react";
import { styles, buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { EmailUnconfirmedBanner } from "./email-unconfirmed-banner";

interface AlertBannersProps {
  uncheckedCount: number;
}

export function AlertBanners({ uncheckedCount }: AlertBannersProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4 animate-slide-up stagger-1">
      {/* Email Unconfirmed Banner - Highest Priority */}
      <EmailUnconfirmedBanner />

      {/* Year in Taxes Banner */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your Year in Taxes - 2025</h3>
            <p className="text-sm text-indigo-100">
              Review your annual P&L statement and VAT summary for tax
              preparation.
            </p>
          </div>
        </div>
        <Link
          href="/reports"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          View Year Report
        </Link>
      </div>

      {/* Unchecked Transactions Alert */}
      {uncheckedCount > 0 && (
        <div className={cn(styles.alert, styles.alertWarning)}>
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">
              {t.rich("dashboard.uncheckedTransactions.title", {
                count: uncheckedCount,
                bold: (chunks) => <span className="font-semibold">{chunks}</span>
              })}
            </p>
            <p className="text-sm text-amber-700">
              {t("dashboard.uncheckedTransactions.description")}
            </p>
          </div>
          <Link
            href="/transactions/synced"
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
          >
            {t("dashboard.uncheckedTransactions.viewPending")}
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/invoices/new" className={buttonStyles("primary")}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
        <Link
          href="/transactions/new-expense"
          className={buttonStyles("secondary")}
        >
          <Receipt className="h-4 w-4" />
          Add Expense
        </Link>
        <Link href="/taxes" className={buttonStyles("secondary")}>
          <Calendar className="h-4 w-4" />
          VAT Q4 Due Jan 31
        </Link>
      </div>
    </div>
  );
}
