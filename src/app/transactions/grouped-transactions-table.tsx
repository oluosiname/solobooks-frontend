"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Receipt, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Checkbox } from "@/components/atoms";
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
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set()
  );
  const [bulkDiscardDialogOpen, setBulkDiscardDialogOpen] = useState(false);

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string | number) => api.deleteTransaction(id),
    onSuccess: () => {
      showToast.success(t("transactions.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unchecked-transactions"] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    },
    onError: () => {
      showToast.error(t("transactions.deleteError"));
    },
  });

  const discardTransactionMutation = useMutation({
    mutationFn: (id: string | number) => api.discardSyncedTransaction(id),
    onSuccess: () => {
      showToast.success(t("transactions.discardSuccess"));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unchecked-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["synced-transactions"] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    },
    onError: () => {
      showToast.error(t("transactions.discardError"));
    },
  });

  const bulkDiscardMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => api.bulkDiscardSyncedTransactions(ids),
    onSuccess: () => {
      showToast.success(
        t("transactions.bulkDiscardSuccess", {
          count: selectedTransactions.size,
        }) || `Successfully discarded ${selectedTransactions.size} transaction(s)`
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unchecked-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["synced-transactions"] });
      setBulkDiscardDialogOpen(false);
      setSelectedTransactions(new Set());
    },
    onError: () => {
      showToast.error(
        t("transactions.bulkDiscardError") ||
          "Failed to discard transactions. Please try again."
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

  const handleToggleSelect = (transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (transactions: Transaction[]) => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map((t) => t.id)));
    }
  };

  const handleBulkDiscard = () => {
    if (selectedTransactions.size === 0) return;
    setBulkDiscardDialogOpen(true);
  };

  const handleConfirmBulkDiscard = () => {
    if (selectedTransactions.size > 0) {
      bulkDiscardMutation.mutate(Array.from(selectedTransactions));
    }
  };

  const handleCancelBulkDiscard = () => {
    setBulkDiscardDialogOpen(false);
  };

  // Get all transactions for select all functionality
  const allTransactions = Object.values(groupedTransactions).flat();

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
      syncedTransactionId: transaction.id.toString(),
    });

   
    const category = transaction.financialCategory ?? transaction.category;
    if (category?.id) {
      params.set("categoryId", category.id.toString());
    }

    // Navigate to the appropriate new transaction page with prefilled data
    router.push(`/transactions/${newRoute}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {isPendingView && allTransactions.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {selectedTransactions.size > 0
                ? t("transactions.selectedCount", {
                    count: selectedTransactions.size,
                  })
                : t("transactions.transactionCount", {
                    count: allTransactions.length,
                  })}
            </span>
            {selectedTransactions.size > 0 && (
              <button
                onClick={() => setSelectedTransactions(new Set())}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {t("transactions.clearSelection")}
              </button>
            )}
          </div>
          {selectedTransactions.size > 0 && (
            <button
              onClick={handleBulkDiscard}
              disabled={bulkDiscardMutation.isPending}
              className={cn(
                buttonStyles("danger"),
                "flex items-center gap-2"
              )}
            >
              <Trash2 className="h-4 w-4" />
              {bulkDiscardMutation.isPending
                ? t("transactions.discarding")
                : t("transactions.discardSelected", {
                    count: selectedTransactions.size,
                  })}
            </button>
          )}
        </div>
      )}

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
            <div className="overflow-x-auto">
              <table className={styles.table}>
                <thead>
                  <tr>
                    {isPendingView && (
                      <th className={cn(styles.th, "w-12")}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={
                              selectedTransactions.size === monthTransactions.length &&
                              monthTransactions.every((t) =>
                                selectedTransactions.has(t.id)
                              )
                            }
                            onChange={() => handleSelectAll(monthTransactions)}
                            aria-label={
                              selectedTransactions.size === monthTransactions.length
                                ? "Deselect all"
                                : "Select all"
                            }
                          />
                        </div>
                      </th>
                    )}
                    <th className={styles.th}>
                      {t("transactions.columns.description")}
                    </th>
                    <th className={cn(styles.th, "hidden sm:table-cell")}>
                      {t("transactions.columns.date")}
                    </th>
                    <th className={styles.th}>
                      {t("transactions.columns.amount")}
                    </th>
                    <th className={cn(styles.th, "hidden md:table-cell")}>
                      {t("transactions.columns.receipt")}
                    </th>
                    <th className={cn(styles.th, "w-24")}>
                      {t("transactions.columns.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={cn(
                        "hover:bg-slate-50",
                        selectedTransactions.has(transaction.id) &&
                          "bg-blue-50"
                      )}
                    >
                      {isPendingView && (
                        <td className={styles.td}>
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectedTransactions.has(transaction.id)}
                              onChange={() => handleToggleSelect(transaction.id)}
                              aria-label={`Select ${transaction.description}`}
                            />
                          </div>
                        </td>
                      )}
                      <td className={styles.td}>
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-slate-500">
                            {(transaction.financialCategory ?? transaction.category)?.translatedName || "Unknown"}
                          </p>
                        </div>
                      </td>
                      <td className={cn(styles.td, "hidden sm:table-cell")}>
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
                      <td className={cn(styles.td, "hidden md:table-cell")}>
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
                    ? t("transactions.discardTitle")
                    : t("transactions.deleteTitle")}
                </h3>
                <p className="text-sm text-slate-600">
                  {isPendingView
                    ? t("transactions.discardConfirm", {
                        description: transactionToDelete.description,
                      })
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
                    ? t("transactions.discarding")
                    : t("common.deleting")
                  : isPendingView
                  ? t("common.discard")
                  : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Discard Confirmation Dialog */}
      {bulkDiscardDialogOpen && selectedTransactions.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">
                  {t("transactions.bulkDiscardTitle")}
                </h3>
                <p className="text-sm text-slate-600">
                  {t("transactions.bulkDiscardConfirm", {
                    count: selectedTransactions.size,
                  })}
                </p>
              </div>
              <button
                onClick={handleCancelBulkDiscard}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancelBulkDiscard}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                disabled={bulkDiscardMutation.isPending}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmBulkDiscard}
                disabled={bulkDiscardMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDiscardMutation.isPending
                  ? t("transactions.discarding")
                  : t("common.discard")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
