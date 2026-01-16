"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Receipt, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { styles } from "@/lib/styles";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Transaction } from "@/types";

interface GroupedTransactionsTableProps {
  groupedTransactions: Record<string, Transaction[]>;
  isPendingView?: boolean;
}

export function GroupedTransactionsTable({
  groupedTransactions,
  isPendingView = false,
}: GroupedTransactionsTableProps) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string | number) => api.deleteTransaction(id),
    onSuccess: () => {
      showToast.success(t("transactions.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unchecked-transactions"] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete transaction:", error);
      showToast.error(t("transactions.deleteError"));
    },
  });

  const discardTransactionMutation = useMutation({
    mutationFn: (id: string | number) => api.discardSyncedTransaction(id),
    onSuccess: () => {
      showToast.success(
        t("transactions.discardSuccess") || "Transaction discarded successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unchecked-transactions"] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to discard transaction:", error);
      showToast.error(
        t("transactions.discardError") || "Failed to discard transaction"
      );
    },
  });

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      if (isPendingView) {
        discardTransactionMutation.mutate(transactionToDelete.id);
      } else {
        deleteTransactionMutation.mutate(transactionToDelete.id);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const handleEdit = (transaction: Transaction) => {
    // Determine if it's income or expense based on transactionType field
    const isIncome = transaction.transactionType === "Income";
    const newRoute = isIncome ? "new-income" : "new-expense";

    // Create URL search parameters with transaction data to prefill the form
    const params = new URLSearchParams({
      description: transaction.description,
      date: transaction.date,
      amount: transaction.amount.toString(),
      vatRate: transaction.vatRate.toString(),
      customerLocation: transaction.customerLocation,
      customerVatNumber: transaction.customerVatNumber || "",
      categoryId: transaction.category?.id?.toString() || "",
    });

    // Navigate to the appropriate new transaction page with prefilled data
    router.push(`/transactions/${newRoute}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(
        ([month, monthTransactions], groupIndex) => (
          <div
            key={month}
            className={cn(styles.card, "overflow-hidden animate-slide-up")}
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
                        {transaction.transactionType === "Income" ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {transaction.receiptUrl ? (
                        <Link href={transaction.receiptUrl} target="_blank">
                          <Receipt className="h-4 w-4 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction)}
                          disabled={
                            deleteTransactionMutation.isPending ||
                            discardTransactionMutation.isPending
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">
                  {isPendingView
                    ? t("transactions.discardTitle") || "Discard Transaction"
                    : t("transactions.deleteTitle")}
                </h3>
                <p className="text-sm text-slate-600">
                  {isPendingView
                    ? t("transactions.discardConfirm", {
                        description: transactionToDelete.description,
                      }) ||
                      `Are you sure you want to discard "${transactionToDelete.description}"? This action cannot be undone.`
                    : t("transactions.deleteConfirm", {
                        description: transactionToDelete.description,
                      })}
                </p>
              </div>
              <button
                onClick={handleCancelDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                disabled={deleteTransactionMutation.isPending}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={
                  deleteTransactionMutation.isPending ||
                  discardTransactionMutation.isPending
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteTransactionMutation.isPending ||
                discardTransactionMutation.isPending
                  ? isPendingView
                    ? t("common.discarding") || "Discarding..."
                    : t("common.deleting")
                  : isPendingView
                  ? t("common.discard") || "Discard"
                  : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
