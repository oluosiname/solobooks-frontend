"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { SearchInput } from "@/components/ui";
import { api } from "@/lib/api";
import { groupTransactionsByMonth } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import type { Transaction } from "@/types";
import { GroupedTransactionsTable } from "../grouped-transactions-table";

export default function SyncedTransactionsPage() {
  const t = useTranslations();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["synced-transactions"],
    queryFn: api.getUncheckedTransactions,
  });

  // Handle transactions data
  const transactionsArray = transactions || [];

  // For now, we'll allow search but it might not be as relevant for synced transactions
  // since they're typically processed in batches
  const groupedTransactions = transactionsArray.length > 0
    ? groupTransactionsByMonth(transactionsArray, (t: Transaction) => t.date)
    : {};

  return (
    <AppShell title={t("transactions.syncedTitle") || "Synced Transactions"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("transactions.syncedTitle") || "Synced Transactions"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t("transactions.syncedDescription") ||
                "Review and categorize transactions synced from your bank accounts"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/transactions/new-expense"
              className={buttonStyles("secondary")}
            >
              Add Manual Expense
            </Link>
            <Link
              href="/transactions/new-income"
              className={buttonStyles("secondary")}
            >
              Add Manual Income
            </Link>
          </div>
        </div>

        {/* Stats/Info Banner */}
        {transactionsArray.length > 0 && (
          <div className={`${styles.alert} ${styles.alertInfo}`}>
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                {transactionsArray.length} transactions need categorization
              </p>
              <p className="text-sm text-blue-700">
                Use the discard button to remove unwanted transactions, or categorize them by editing.
              </p>
            </div>
          </div>
        )}

        {/* Search - might be less useful for synced transactions */}
        <SearchInput
          placeholder={t("transactions.searchPlaceholder")}
          value=""
          onChange={() => {}}
          className="max-w-md"
        />

        {/* Transactions by Month */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">
              {t("transactions.loadingTransactions")}
            </p>
          </div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-slate-500 mb-2">
                {t("transactions.noSyncedTransactions") || "No synced transactions"}
              </p>
              <p className="text-sm text-slate-400">
                Transactions synced from your bank accounts will appear here
              </p>
              <Link
                href="/bank-connections"
                className={`${buttonStyles("primary")} mt-4 inline-block`}
              >
                Set up Bank Connections
              </Link>
            </div>
          </div>
        ) : (
          <GroupedTransactionsTable
            groupedTransactions={groupedTransactions}
            isPendingView={true}
          />
        )}
      </div>
    </AppShell>
  );
}