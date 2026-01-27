"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { Client, InvoiceCategory, ApiError } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { entitledToEditInvoices } from "@/lib/entitlements";

interface LineItem {
  id: string;
  description: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  _destroy?: boolean;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const t = useTranslations();
  const { user } = useAuth();

  // Check if user is entitled to edit invoices
  const canEditInvoices = entitledToEditInvoices(user);

  // Fetch the invoice being edited
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => api.fetchInvoice(invoiceId),
  });

  // Fetch clients and invoice categories
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: api.fetchClients,
  });

  const { data: invoiceCategories } = useQuery({
    queryKey: ["invoice-categories"],
    queryFn: api.fetchInvoiceCategories,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: api.fetchCurrencies,
  });

  const queryClient = useQueryClient();

  const updateInvoiceMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.updateInvoice>[1]) =>
      api.updateInvoice(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      showToast.success(t("invoices.success.invoiceUpdated"));
      router.push("/invoices");
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.error?.message || error?.message;
      if (errorMessage?.includes("Cannot update") || errorMessage?.includes("draft")) {
        showToast.error(t("invoices.errors.cannotEditNonDraft"));
      } else {
        showToast.apiError(error, t("invoices.success.invoiceUpdateFailed"));
      }
    },
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formData, setFormData] = useState({
    category: "",
    clientId: "",
    currency: "",
    language: "en",
    invoiceDate: "",
    dueDate: "",
    vatRate: 19,
    notes: "",
  });

  // Populate form with invoice data when loaded
  useEffect(() => {
    if (invoice) {
      // Check if invoice is in draft status
      if (invoice.status !== "draft") {
        showToast.error(t("invoices.errors.cannotEditNonDraft"));
        router.push("/invoices");
        return;
      }

      setFormData({
        category: invoice.invoiceCategory?.id?.toString() || "",
        clientId: invoice.clientId || "",
        currency: invoice.currencyData?.id?.toString() || "",
        language: invoice.language || "en",
        invoiceDate: invoice.date || "",
        dueDate: invoice.dueDate || "",
        vatRate: invoice.vatRate || 19,
        notes: invoice.notes || "",
      });

      setLineItems(
        invoice.lineItems?.map((item) => ({
          id: item.id,
          description: item.description,
          unitPrice: item.unitPrice,
          unit: item.unit,
          quantity: item.quantity,
        })) || []
      );
    }
  }, [invoice, router, t]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `new-${Date.now()}`,
        description: "",
        unitPrice: 0,
        unit: "pc",
        quantity: 1,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      // If it's an existing item (has numeric id), mark for deletion
      if (!id.startsWith("new-")) {
        setLineItems(
          lineItems.map((item) =>
            item.id === id ? { ...item, _destroy: true } : item
          )
        );
      } else {
        // If it's a new item, just remove it
        setLineItems(lineItems.filter((item) => item.id !== id));
      }
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = lineItems
    .filter((item) => !item._destroy)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // VAT preview state
  const [vatPreview, setVatPreview] = useState<{
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    reverseCharge: boolean;
    note: string | null;
  } | null>(null);

  const [isCalculatingVat, setIsCalculatingVat] = useState(false);

  // Get selected client data
  const selectedClient = useMemo(
    () => clients?.find((c) => c.id === formData.clientId),
    [clients, formData.clientId]
  );

  // Debounced VAT calculation
  useEffect(() => {
    // Don't calculate if missing required data
    const clientCountry = selectedClient?.address?.country;
    if (!clientCountry || subtotal === 0) {
      setVatPreview(null);
      return;
    }

    // Debounce the API call
    const timer = setTimeout(async () => {
      setIsCalculatingVat(true);
      try {
        const result = await api.calculateVatPreview({
          subtotal,
          vatRate: formData.vatRate,
          clientCountry,
        });
        setVatPreview(result);
      } catch (error) {
        console.error("Failed to calculate VAT preview:", error);
        // Fallback to simple calculation
        setVatPreview({
          subtotal,
          vatRate: formData.vatRate,
          vatAmount: subtotal * (formData.vatRate / 100),
          total: subtotal * (1 + formData.vatRate / 100),
          reverseCharge: false,
          note: null,
        });
      } finally {
        setIsCalculatingVat(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedClient?.address?.country, subtotal, formData.vatRate]);

  const total = vatPreview?.total || subtotal;

  const handleSave = () => {
    // Validate required fields
    if (!formData.category) {
      showToast.error(t("invoices.validation.selectCategory"));
      return;
    }
    if (!formData.clientId) {
      showToast.error(t("invoices.validation.selectClient"));
      return;
    }
    if (!formData.currency) {
      showToast.error(t("invoices.validation.selectCurrency"));
      return;
    }
    if (!formData.invoiceDate) {
      showToast.error(t("invoices.validation.selectInvoiceDate"));
      return;
    }
    if (!formData.dueDate) {
      showToast.error(t("invoices.validation.selectDueDate"));
      return;
    }

    // Validate line items (exclude items marked for deletion)
    const activeItems = lineItems.filter((item) => !item._destroy);
    if (
      activeItems.length === 0 ||
      activeItems.some((item) => !item.description.trim() || item.unitPrice <= 0)
    ) {
      showToast.error(t("invoices.validation.lineItemsRequired"));
      return;
    }

    updateInvoiceMutation.mutate({
      clientId: formData.clientId,
      category: formData.category,
      currency: formData.currency,
      language: formData.language,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      vatRate: vatPreview?.vatRate || formData.vatRate,
      notes: formData.notes,
      lineItems: lineItems.map((item) => ({
        id: item.id.startsWith("new-") ? undefined : item.id,
        description: item.description,
        unitPrice: item.unitPrice,
        unit: item.unit,
        quantity: item.quantity,
        _destroy: item._destroy,
      })),
    });
  };

  // Show loading state
  if (isLoadingInvoice) {
    return (
      <AppShell title={t("invoices.edit.title")}>
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">{t("common.loading")}</div>
        </div>
      </AppShell>
    );
  }

  // Show error if invoice not found or user doesn't have permission
  if (!invoice || !canEditInvoices) {
    return (
      <AppShell title={t("invoices.edit.title")}>
        <div className="mb-6">
          <Link
            href="/invoices"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xl font-semibold text-slate-900">
              {t("invoices.edit.title")}
            </span>
          </Link>
        </div>
        <div className={cn(styles.card)}>
          <div className={styles.cardContent}>
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="h-6 w-6" />
              <p className="text-lg">
                {!canEditInvoices
                  ? t("invoices.errors.editNotAvailable")
                  : t("invoices.errors.invoiceNotFound")}
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("invoices.edit.title")}>
      <div className="mb-6">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">
            {t("invoices.edit.title")} - {invoice.invoiceNumber}
          </span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary Sidebar - Mobile First */}
        <div className="lg:hidden">
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    VAT ({vatPreview?.vatRate || 0}%)
                  </span>
                  <span className="font-medium text-slate-900">
                    {isCalculatingVat ? (
                      <span className="text-slate-400">
                        {t("invoices.new.calculatingVat")}
                      </span>
                    ) : (
                      `€${(vatPreview?.vatAmount || 0).toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">
                    {t("invoices.new.total")}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    €{total.toFixed(2)}
                  </span>
                </div>
                {vatPreview?.note && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-blue-800">{vatPreview.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invoice Details */}
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("invoices.new.details")}
              </h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.category")}
                  </label>
                  <select
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">{t("invoices.new.pleaseSelect")}</option>
                    {invoiceCategories?.map((category: InvoiceCategory) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.client")}
                  </label>
                  <select
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                  >
                    <option value="">{t("invoices.new.selectClient")}</option>
                    {clients?.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.currency")}
                  </label>
                  <select
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  >
                    <option value="">{t("invoices.new.pleaseSelect")}</option>
                    {currencies?.map((currency) => (
                      <option key={currency.id} value={currency.id.toString()}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.language")}
                  </label>
                  <select
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  >
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.invoiceDate")}
                  </label>
                  <input
                    type="date"
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("invoices.new.dueDate")}
                  </label>
                  <input
                    type="date"
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  {t("invoices.new.vatRate")} *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vatRate"
                      value="19"
                      checked={formData.vatRate === 19}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vatRate: parseInt(e.target.value),
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t("invoices.new.vatStandard")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vatRate"
                      value="7"
                      checked={formData.vatRate === 7}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vatRate: parseInt(e.target.value),
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t("invoices.new.vatReduced")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vatRate"
                      value="0"
                      checked={formData.vatRate === 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vatRate: parseInt(e.target.value),
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t("invoices.new.vatExempt")}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700">
                  {t("invoices.new.notes")}
                </label>
                <textarea
                  className={cn(styles.input, "mt-1.5")}
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={t("invoices.new.notesPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("invoices.new.lineItems")}
              </h3>
              <div className="mt-6">
                {/* Header - Hidden on mobile */}
                <div className="mb-4 hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-slate-600">
                  <div className="col-span-5">
                    {t("invoices.new.description")}
                  </div>
                  <div className="col-span-2">{t("invoices.new.price")}</div>
                  <div className="col-span-2">{t("invoices.new.unit")}</div>
                  <div className="col-span-2">{t("invoices.new.quantity")}</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {lineItems
                    .filter((item) => !item._destroy)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 p-4 md:p-0 border md:border-0 border-slate-200 rounded-lg md:rounded-none"
                      >
                        <div className="md:col-span-5">
                          <label className="block md:hidden text-sm font-medium text-slate-700 mb-1.5">
                            {t("invoices.new.description")}
                          </label>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder={t("invoices.new.itemDescription")}
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block md:hidden text-sm font-medium text-slate-700 mb-1.5">
                            {t("invoices.new.price")}
                          </label>
                          <input
                            type="number"
                            className={styles.input}
                            placeholder="0.00"
                            value={item.unitPrice || ""}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-2">
                          <div className="md:col-span-1">
                            <label className="block md:hidden text-sm font-medium text-slate-700 mb-1.5">
                              {t("invoices.new.unit")}
                            </label>
                            <select
                              className={styles.input}
                              value={item.unit}
                              onChange={(e) =>
                                updateLineItem(item.id, "unit", e.target.value)
                              }
                            >
                              <option value="pc">pc</option>
                              <option value="hr">hr</option>
                              <option value="day">day</option>
                              <option value="month">month</option>
                            </select>
                          </div>
                          <div className="md:col-span-1">
                            <label className="block md:hidden text-sm font-medium text-slate-700 mb-1.5">
                              {t("invoices.new.quantity")}
                            </label>
                            <input
                              type="number"
                              className={styles.input}
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="w-full md:w-auto rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            disabled={
                              lineItems.filter((i) => !i._destroy).length === 1
                            }
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              <span className="md:hidden">Remove</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add Line Item Button */}
                <button
                  onClick={addLineItem}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
                >
                  <Plus className="h-4 w-4" />
                  {t("invoices.new.addLineItem")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className={cn(styles.card, "sticky top-6")}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    VAT ({vatPreview?.vatRate || 0}%)
                  </span>
                  <span className="font-medium text-slate-900">
                    {isCalculatingVat ? (
                      <span className="text-slate-400">
                        {t("invoices.new.calculatingVat")}
                      </span>
                    ) : (
                      `€${(vatPreview?.vatAmount || 0).toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">
                    {t("invoices.new.total")}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    €{total.toFixed(2)}
                  </span>
                </div>
                {vatPreview?.note && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-blue-800">{vatPreview.note}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <button
                  className={cn(
                    buttonStyles("primary"),
                    "w-full justify-center"
                  )}
                  onClick={handleSave}
                  disabled={updateInvoiceMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                  {updateInvoiceMutation.isPending
                    ? "Updating..."
                    : t("invoices.edit.updateInvoice")}
                </button>
                <Link
                  href="/invoices"
                  className={cn(
                    buttonStyles("secondary"),
                    "w-full justify-center"
                  )}
                >
                  {t("common.cancel")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="lg:hidden space-y-3">
          <button
            className={cn(buttonStyles("primary"), "w-full justify-center")}
            onClick={handleSave}
            disabled={updateInvoiceMutation.isPending}
          >
            <Check className="h-4 w-4" />
            {updateInvoiceMutation.isPending
              ? "Updating..."
              : t("invoices.edit.updateInvoice")}
          </button>
          <Link
            href="/invoices"
            className={cn(buttonStyles("secondary"), "w-full justify-center")}
          >
            {t("common.cancel")}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
