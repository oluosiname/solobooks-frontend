"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Check, ExternalLink, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout";
import { AlertBanner } from "@/components/organisms";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { Client, InvoiceCategory, ApiError } from "@/types";

interface LineItem {
  id: string;
  description: string;
  unitPrice: number;
  unit: string;
  quantity: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const t = useTranslations();

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

  const { data: creationRequirements } = useQuery({
    queryKey: ["invoice-creation-requirements"],
    queryFn: api.fetchInvoiceCreationRequirements,
  });

  const queryClient = useQueryClient();

  const createInvoiceMutation = useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      showToast.success(t("invoices.success.invoiceCreated"));
      router.push("/invoices");
    },
    onError: (error: ApiError) => {
      showToast.apiError(error, t("invoices.success.invoiceCreationFailed"));
    },
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", unitPrice: 0, unit: "pc", quantity: 1 },
  ]);

  const [formData, setFormData] = useState({
    category: "",
    clientId: "",
    currency: "",
    language: "en",
    invoiceDate: "",
    dueDate: "",
  });

  // Set default currency when currencies are loaded

  useEffect(() => {
    if (currencies && currencies.length > 0 && !formData.currency) {
      // Find EUR currency or use the first available
      const eurCurrency = currencies.find((c) => c.code === "EUR");
      if (eurCurrency) {
        setFormData((prev) => ({
          ...prev,
          currency: eurCurrency.id.toString(),
        }));
      } else if (currencies[0]) {
        setFormData((prev) => ({
          ...prev,
          currency: currencies[0].id.toString(),
        }));
      }
    }
  }, [currencies, formData.currency]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: "",
        unitPrice: 0,
        unit: "pc",
        quantity: 1,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
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

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const total = subtotal;

  const handleSave = () => {
    if (!formData.clientId || !formData.category) {
      showToast.error(t("invoices.validation.selectClientAndCategory"));
      return;
    }

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

    // Validate line items
    if (
      lineItems.length === 0 ||
      lineItems.some((item) => !item.description.trim() || item.unitPrice <= 0)
    ) {
      showToast.error(t("invoices.validation.lineItemsRequired"));
      return;
    }

    createInvoiceMutation.mutate({
      clientId: formData.clientId,
      category: formData.category,
      currency: formData.currency,
      language: formData.language,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      lineItems: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        unitPrice: item.unitPrice,
        unit: item.unit,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <AppShell title={t("invoices.new.title")}>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xl font-semibold text-slate-900">
            {t("invoices.new.title")}
          </span>
        </button>
      </div>

      {/* Creation Requirements Banners */}
      {creationRequirements && !creationRequirements.requirements.profileComplete && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-amber-800">{t("invoices.new.profileIncomplete")}</p>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {t("invoices.new.completeProfile")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      {creationRequirements && !creationRequirements.requirements.invoiceSettingExists && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-amber-800">{t("invoices.new.invoiceSettingsMissing")}</p>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {t("invoices.new.configureSettings")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary Sidebar - Mobile First */}
        <div className="lg:hidden">
          <div className={cn(styles.card)}>
            <div className={styles.cardContent}>
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold text-slate-900">
                    {t("invoices.new.total")}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    €{total.toFixed(2)}
                  </span>
                </div>
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
                  {lineItems.map((item) => (
                    <div key={item.id} className="space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 p-4 md:p-0 border md:border-0 border-slate-200 rounded-lg md:rounded-none">
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
                          disabled={lineItems.length === 1}
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
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold text-slate-900">
                    {t("invoices.new.total")}
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  className={cn(
                    buttonStyles("primary"),
                    "w-full justify-center"
                  )}
                  onClick={handleSave}
                  disabled={
                    createInvoiceMutation.isPending ||
                    !creationRequirements?.canCreate
                  }
                >
                  <Check className="h-4 w-4" />
                  {createInvoiceMutation.isPending
                    ? "Creating..."
                    : t("invoices.new.saveInvoice")}
                </button>
                <button
                  onClick={() => router.back()}
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

        {/* Action Buttons - Mobile */}
        <div className="lg:hidden space-y-3">
          <button
            className={cn(
              buttonStyles("primary"),
              "w-full justify-center"
            )}
            onClick={handleSave}
            disabled={
              createInvoiceMutation.isPending ||
              !creationRequirements?.canCreate
            }
          >
            <Check className="h-4 w-4" />
            {createInvoiceMutation.isPending
              ? "Creating..."
              : t("invoices.new.saveInvoice")}
          </button>
          <button
            onClick={() => router.back()}
            className={cn(
              buttonStyles("secondary"),
              "w-full justify-center"
            )}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
