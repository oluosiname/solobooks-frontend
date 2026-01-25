"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check } from "lucide-react";
import { AppShell } from "@/components/layout";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import {
  updateTransaction,
  fetchCategories,
  fetchTransaction,
} from "@/services/api";
import { showToast } from "@/lib/toast";
import { FileUpload } from "@/components/molecules/FileUpload";
import type { TransactionInput, ApiError } from "@/types";

export default function EditExpensePage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const transactionId = searchParams.get("id");

  const [formData, setFormData] = useState<{
    transactionType: "Expense" | "Income";
    categoryId: string;
    date: string;
    amount: string;
    description: string;
    vatRate: number;
    customerLocation: string;
    customerVatNumber: string;
  }>({
    transactionType: "Expense",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    vatRate: 19, // Default German VAT rate
    customerLocation: "germany",
    customerVatNumber: "",
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Fetch transaction data
  const { data: transactionData, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => (transactionId ? fetchTransaction(transactionId) : null),
    enabled: !!transactionId,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories", "expense"],
    queryFn: () => fetchCategories("expense"),
  });

  // Update form data when transaction data is loaded
  useEffect(() => {
    if (transactionData && !isLoadingTransaction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        transactionType: transactionData.transactionType || "Expense",
        categoryId: (transactionData.financialCategory ?? transactionData.category)?.id.toString() || "",
        date: transactionData.date || new Date().toISOString().split("T")[0],
        // Ensure amount uses period as decimal separator (not locale-aware)
        amount: Math.abs(transactionData.amount).toFixed(2).replace(/,/g, "."),
        description: transactionData.description || "",
        vatRate: transactionData.vatRate || 19,
        customerLocation: transactionData.customerLocation || "germany",
        customerVatNumber: transactionData.customerVatNumber || "",
      });
    }
  }, [transactionData, isLoadingTransaction]);

  const updateTransactionMutation = useMutation({
    mutationFn: (data: { id: string; transactionData: TransactionInput }) =>
      updateTransaction(data.id, data.transactionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
      showToast.success("Expense transaction updated successfully");
      router.push("/transactions");
    },
    onError: (error: ApiError) => {
      showToast.apiError(error, "Failed to update expense transaction");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId) {
      showToast.error("Transaction ID is required");
      return;
    }

    if (!formData.categoryId) {
      showToast.error("Please select a category");
      return;
    }

    const transactionData = {
      transaction_type: "expense" as const,
      description: formData.description,
      amount: -Math.abs(parseFloat(formData.amount)), // Negative for expenses
      date: formData.date,
      financial_category_id: formData.categoryId,
      vat_rate: formData.vatRate,
      customer_location: formData.customerLocation,
      customer_vat_number: formData.customerVatNumber || undefined,
      receipt: receiptFile || undefined,
    };

    updateTransactionMutation.mutate({
      id: transactionId,
      transactionData,
    });
  };

  if (isLoadingTransaction) {
    return (
      <AppShell title={t("transactions.editExpense")}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("transactions.editExpense")}>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">
            {t("transactions.editExpense")}
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <form id="expense-form" onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("transactions.form.transactionInfo")}
                </h3>

                <div className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.type")}
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.transactionType}
                        disabled
                      >
                        <option value="Income">{t("transactions.types.income")}</option>
                        <option value="Expense">{t("transactions.types.expense")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.category")}
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">{t("transactions.form.placeholders.selectCategory")}</option>
                        {categories?.map((category) => (
                          <option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.translatedName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.date")} *
                      </label>
                      <input
                        type="date"
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.amount")}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={cn(styles.input, "mt-1.5")}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      {t("transactions.form.description")}
                    </label>
                    <textarea
                      className={cn(styles.input, "mt-1.5")}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder={t("transactions.form.placeholders.enterDescription")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      {t("transactions.form.customerLocation")}
                    </label>
                    <select
                      className={cn(styles.input, "mt-1.5")}
                      value={formData.customerLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerLocation: e.target.value,
                        })
                      }
                    >
                      <option value="germany">{t("transactions.form.customerLocationOptions.germany")}</option>
                      <option value="in_eu">{t("transactions.form.customerLocationOptions.inEu")}</option>
                      <option value="outside_eu">{t("transactions.form.customerLocationOptions.outsideEu")}</option>
                    </select>
                  </div>

                  {formData.customerLocation === "germany" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.vatRate")}
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.vatRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vatRate: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={0}>0%</option>
                        <option value={7}>7%</option>
                        <option value={19}>19%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>
                  )}

                  {formData.customerLocation === "in_eu" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t("transactions.form.customerVatNumber")}
                      </label>
                      <input
                        type="text"
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.customerVatNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerVatNumber: e.target.value,
                          })
                        }
                        placeholder={t("transactions.form.placeholders.vatNumber")}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      {t("transactions.form.receipt")}
                    </label>
                    <div className="mt-1.5">
                      <FileUpload
                        onFileSelect={(file) => setReceiptFile(file)}
                        accept="image/*,.pdf"
                        maxSize="5MB"
                      />
                      {receiptFile && (
                        <p className="mt-2 text-sm text-slate-600">
                          Selected: {receiptFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className={cn(styles.card)}>
              <div className={styles.cardContent}>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("transactions.form.summary")}
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{t("transactions.form.amount")}</span>
                    <span className="font-semibold text-slate-900">
                      €{parseFloat(formData.amount || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{t("transactions.form.receipt")}</span>
                    <span className="text-sm text-slate-900">
                      {receiptFile ? t("transactions.form.attached") : t("transactions.form.none")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-900">{t("transactions.form.total")}</span>
                    <span className="text-lg font-semibold text-slate-900">
                      €{parseFloat(formData.amount || "0").toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                form="expense-form"
                disabled={updateTransactionMutation.isPending}
                className={cn(buttonStyles("primary"), "w-full justify-center")}
              >
                <Check className="h-4 w-4" />
                {updateTransactionMutation.isPending
                  ? t("transactions.form.updating")
                  : t("transactions.form.updateExpense")}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={updateTransactionMutation.isPending}
                className={cn(
                  buttonStyles("secondary"),
                  "w-full justify-center"
                )}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
