"use client";

import { Edit2, Trash2, Receipt } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { styles } from "@/lib/styles";
import type { Transaction } from "@/types";

interface GroupedTransactionsTableProps {
  groupedTransactions: Record<string, Transaction[]>;
}

export function GroupedTransactionsTable({
  groupedTransactions,
}: GroupedTransactionsTableProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(
        ([month, monthTransactions], groupIndex) => (
          <div
            key={month}
            className={cn(
              styles.card,
              "overflow-hidden animate-slide-up"
            )}
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            <div className={cn(styles.cardHeader, "bg-slate-50")}>
              <h3 className="font-semibold text-slate-900">{month}</h3>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>
                    {t("transactions.columns.description")}
                  </th>
                  <th className={styles.th}>
                    {t("transactions.columns.date")}
                  </th>
                  <th className={styles.th}>
                    {t("transactions.columns.amount")}
                  </th>
                  <th className={styles.th}>
                    {t("transactions.columns.receipt")}
                  </th>
                  <th className={cn(styles.th, "w-24")}>
                    {t("transactions.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className={styles.td}>
                      <div>
                        <p className="font-medium text-slate-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-slate-500">
                          {transaction.category?.name || "Unknown"}
                        </p>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {formatDate(transaction.date)}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`font-medium ${
                          transaction.transactionType === "Income"
                            ? "text-emerald-600"
                            : "text-slate-700"
                        }`}
                      >
                        {transaction.transactionType === "Income"
                          ? "+"
                          : ""}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {transaction.receiptUrl ? (
                        <Link
                          href={transaction.receiptUrl}
                          target="_blank"
                        >
                          <Receipt className="h-4 w-4 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className="flex gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}