"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { SearchInput, Tabs } from "@/components/ui";
import { api } from "@/lib/api";
import { groupTransactionsByMonth, cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import type { TransactionType, Transaction } from "@/types";
import { GroupedTransactionsTable } from "./grouped-transactions-table";

export default function TransactionsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", activeTab],
    queryFn: () =>
      api.getTransactions(
        activeTab === "all" ? undefined : (activeTab as TransactionType)
      ),
  });

  // const { data: uncheckedTransactions } = useQuery({
  //   queryKey: ["unchecked-transactions"],
  //   queryFn: api.getUncheckedTransactions,
  // });

  const uncheckedTransactions: Transaction[] = [];
  console.log({ transactions });

  const filteredTransactions = transactions?.data?.filter(
    (t: Transaction) =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTransactions = filteredTransactions
    ? groupTransactionsByMonth(filteredTransactions, (t: Transaction) => t.date)
    : {};

  console.log({ groupedTransactions });

  const tabs = [
    { id: "all", label: t("transactions.types.all") },
    { id: "income", label: t("transactions.types.income") },
    { id: "expense", label: t("transactions.types.expense") },
  ];

  return (
    <AppShell title={t("transactions.title")}>
      <div className="space-y-6">
        {/* Unchecked Alert */}
        {uncheckedTransactions && uncheckedTransactions.length > 0 && (
          <div
            className={cn(
              styles.alert,
              styles.alertWarning,
              "animate-slide-up"
            )}
          >
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p
                dangerouslySetInnerHTML={{
                  __html: t("transactions.uncheckedAlert", {
                    count: uncheckedTransactions.length,
                  }).replace(
                    String(uncheckedTransactions.length),
                    `<strong>${uncheckedTransactions.length}</strong>`
                  ),
                }}
              />
            </div>
            <Link
              href="/transactions?filter=pending"
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
            >
              {t("transactions.viewPending")}
            </Link>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex gap-2">
            <Link
              href="/transactions/new-expense"
              className={buttonStyles("secondary")}
            >
              <Plus className="h-4 w-4" />
              {t("transactions.addExpense")}
            </Link>
            <Link
              href="/transactions/new-income"
              className={buttonStyles("secondary")}
            >
              <Plus className="h-4 w-4" />
              {t("transactions.addIncome")}
            </Link>
            <Link
              href="/transactions/import"
              className={buttonStyles("secondary")}
            >
              <Upload className="h-4 w-4" />
              Import
            </Link>
          </div>
        </div>

        {/* Search */}
        <SearchInput
          placeholder={t("transactions.searchPlaceholder")}
          value={searchQuery}
          onChange={setSearchQuery}
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
            <p className="text-slate-500">{t("transactions.noTransactions")}</p>
          </div>
        ) : (
          <GroupedTransactionsTable groupedTransactions={groupedTransactions} />
        )}
      </div>
    </AppShell>
  );
}
