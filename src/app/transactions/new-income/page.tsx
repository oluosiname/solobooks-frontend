"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { AppShell } from "@/components/layout";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { createTransaction, fetchCategories } from "@/services/api";
import { showToast } from "@/lib/toast";
import { FileUpload } from "@/components/molecules/FileUpload";
import * as humps from "humps";

export default function NewIncomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(() => {
    // Check for prefilled data from sessionStorage
    const prefillData = sessionStorage.getItem('prefillTransactionData');
    if (prefillData) {
      try {
        const parsed = JSON.parse(prefillData);
        // Clear the stored data
        sessionStorage.removeItem('prefillTransactionData');
        return {
          transactionType: parsed.transactionType || "Income",
          categoryId: parsed.categoryId || "",
          date: parsed.date || new Date().toISOString().split("T")[0],
          amount: parsed.amount || "",
          description: parsed.description || "",
          vatRate: parsed.vatRate || 19,
          customerLocation: parsed.customerLocation || "germany",
          customerVatNumber: parsed.customerVatNumber || "",
        };
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }

    return {
      transactionType: "Income" as const,
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      vatRate: 19, // Default German VAT rate
      customerLocation: "germany",
      customerVatNumber: "",
    };
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "income"],
    queryFn: () => fetchCategories("income"),
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      showToast.created("Transaction");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/transactions");
    },
    onError: (error: any) => {
      console.error("Failed to create transaction:", error);
      showToast.error("Failed to create transaction. Please try again.");
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount || !formData.description) {
      showToast.error("Please fill in all required fields");
      return;
    }

    // Transform frontend data to match API spec
    const apiData = {
      transaction_type: formData.transactionType.toLowerCase(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      financial_category_id: parseInt(formData.categoryId),
      vat_rate: formData.vatRate,
      customer_location: formData.customerLocation,
      customer_vat_number: formData.customerVatNumber || undefined,
    };

    createTransactionMutation.mutate({
      transaction: humps.decamelizeKeys(apiData) as any,
      receipt: receiptFile || undefined,
    });
  };

  return (
    <AppShell title="New Income">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">
            New Income
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <form id="income-form" onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold text-slate-900">
                  Transaction Information
                </h3>

                <div className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Type
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.transactionType}
                        disabled
                      >
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Category
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.categoryId}
                        onChange={(e) =>
                          handleChange("categoryId", e.target.value)
                        }
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="">
                          {categoriesLoading
                            ? "Loading categories..."
                            : "Select category"}
                        </option>
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
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Date
                      </label>
                      <input
                        type="date"
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Amount (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={cn(styles.input, "mt-1.5")}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Customer Location
                    </label>
                    <select
                      className={cn(styles.input, "mt-1.5")}
                      value={formData.customerLocation}
                      onChange={(e) =>
                        handleChange("customerLocation", e.target.value)
                      }
                    >
                      <option value="germany">Germany</option>
                      <option value="in_eu">In EU (other EU countries)</option>
                      <option value="outside_eu">Outside EU</option>
                    </select>
                  </div>

                  {formData.customerLocation === "germany" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        VAT Rate (%)
                      </label>
                      <select
                        className={cn(styles.input, "mt-1.5")}
                        value={formData.vatRate}
                        onChange={(e) =>
                          handleChange("vatRate", e.target.value)
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
                        Customer VAT Number
                      </label>
                      <input
                        type="text"
                        className={cn(styles.input, "mt-1.5")}
                        placeholder="DE123456789"
                        value={formData.customerVatNumber}
                        onChange={(e) =>
                          handleChange("customerVatNumber", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      className={cn(styles.input, "mt-1.5 h-24 resize-none")}
                      placeholder="Enter transaction description..."
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Receipt / Attachment
                    </label>
                    <div className="mt-1.5">
                      <FileUpload
                        accept=".pdf,.png,.jpg,.jpeg"
                        maxSize="10MB"
                        onFileSelect={(file) => setReceiptFile(file)}
                        label={
                          receiptFile
                            ? `Selected: ${receiptFile.name}`
                            : "Click to upload or drag and drop"
                        }
                        description="PDF, PNG, JPG up to 10MB"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className={cn(styles.card, "sticky top-6")}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Transaction Type</span>
                  <span className="font-medium text-emerald-600">Income</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-medium text-slate-900">
                    {formData.date}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className="font-medium text-slate-900">
                    {receiptFile ? "Receipt Attached" : "No Receipt"}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  form="income-form"
                  disabled={createTransactionMutation.isPending}
                  className={cn(
                    buttonStyles("primary"),
                    "w-full justify-center"
                  )}
                >
                  <Check className="h-4 w-4" />
                  {createTransactionMutation.isPending
                    ? "Saving..."
                    : "Save Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={createTransactionMutation.isPending}
                  className={cn(
                    buttonStyles("secondary"),
                    "w-full justify-center"
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
