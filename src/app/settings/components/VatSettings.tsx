"use client";

import { useTranslations } from "next-intl";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { useState, useEffect } from "react";
import { fetchVatStatus, createVatStatus, updateVatStatus } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { VatStatus, DeclarationPeriod } from "@/types";

export function VatSettings() {
  const t = useTranslations();
  const [vatStatus, setVatStatus] = useState<VatStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form state
  const [vatRegistered, setVatRegistered] = useState(true);
  const [kleinunternehmer, setKleinunternehmer] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  const [declarationPeriod, setDeclarationPeriod] = useState<DeclarationPeriod>("monthly");
  const [startsOn, setStartsOn] = useState("");
  const [taxExemptReason, setTaxExemptReason] = useState("");

  // Load VAT status on mount
  useEffect(() => {
    async function loadVatStatus() {
      try {
        const data = await fetchVatStatus();
        if (data) {
          setVatStatus(data);
          setVatRegistered(data.vatRegistered);
          setKleinunternehmer(data.kleinunternehmer);
          setVatNumber(data.vatNumber || "");
          setDeclarationPeriod(data.declarationPeriod);
          setStartsOn(data.startsOn || "");
          setTaxExemptReason(data.taxExemptReason || "");
        }
      } catch (error) {
        console.error("Failed to load VAT status:", error);
        showToast.error("Failed to load VAT settings");
      } finally {
        setLoading(false);
      }
    }
    loadVatStatus();
  }, []);

  const handleFieldChange = (field: string) => {
    // Clear field-specific errors when user types
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    setErrorMessage("");

    try {
      const data = {
        vatRegistered,
        kleinunternehmer,
        declarationPeriod,
        vatNumber: vatNumber || null,
        startsOn: startsOn || null,
        taxExemptReason: taxExemptReason || null,
      };

      if (vatStatus) {
        // Update existing VAT status
        const updated = await updateVatStatus(data);
        setVatStatus(updated);
        showToast.updated("VAT settings");
      } else {
        // Create new VAT status
        const created = await createVatStatus(data);
        setVatStatus(created);
        showToast.created("VAT settings");
      }
    } catch (error: any) {
      console.error("Failed to save VAT status:", error);

      // Handle API errors
      if (error?.error) {
        const errorMsg = error.error.message || "Failed to save VAT settings";
        setErrorMessage(errorMsg);
        showToast.error(errorMsg);

        // Set field-specific validation errors
        if (error.error.details) {
          setErrors(error.error.details);
        }
      } else {
        const errorMsg = "An unexpected error occurred";
        setErrorMessage(errorMsg);
        showToast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <p className="text-slate-500">Loading VAT settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.vatTax.title")}
          </h3>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </h3>
                  {errors.base && errors.base.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {errors.base.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.registrationStatus")}
              </label>
              <select
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.vat_registered && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={kleinunternehmer ? "kleinunternehmer" : (vatRegistered ? "registered" : "not_registered")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "kleinunternehmer") {
                    setKleinunternehmer(true);
                    setVatRegistered(false);
                  } else if (value === "registered") {
                    setVatRegistered(true);
                    setKleinunternehmer(false);
                  } else {
                    setVatRegistered(false);
                    setKleinunternehmer(false);
                  }
                  handleFieldChange("vat_registered");
                }}
              >
                <option value="registered">I am VAT registered</option>
                <option value="not_registered">I am not VAT registered</option>
                <option value="kleinunternehmer">Small business exemption (Kleinunternehmer)</option>
              </select>
              {errors.vat_registered && (
                <p className="mt-1.5 text-sm text-red-600">{errors.vat_registered[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.vatNumber")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.vat_number && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={vatNumber}
                onChange={(e) => {
                  setVatNumber(e.target.value);
                  handleFieldChange("vat_number");
                }}
                placeholder="DE123456789"
              />
              {errors.vat_number && (
                <p className="mt-1.5 text-sm text-red-600">{errors.vat_number[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.declarationPeriod")}
              </label>
              <select
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.declaration_period && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={declarationPeriod}
                onChange={(e) => {
                  setDeclarationPeriod(e.target.value as DeclarationPeriod);
                  handleFieldChange("declaration_period");
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.declaration_period && (
                <p className="mt-1.5 text-sm text-red-600">{errors.declaration_period[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.starts_on && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={startsOn}
                onChange={(e) => {
                  setStartsOn(e.target.value);
                  handleFieldChange("starts_on");
                }}
              />
              {errors.starts_on && (
                <p className="mt-1.5 text-sm text-red-600">{errors.starts_on[0]}</p>
              )}
            </div>
            {!vatRegistered && !kleinunternehmer && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tax Exempt Reason
                </label>
                <textarea
                  className={cn(
                    styles.input,
                    "mt-1.5",
                    errors.tax_exempt_reason && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                  value={taxExemptReason}
                  onChange={(e) => {
                    setTaxExemptReason(e.target.value);
                    handleFieldChange("tax_exempt_reason");
                  }}
                  rows={3}
                  placeholder="Explain why you are not VAT registered..."
                />
                {errors.tax_exempt_reason && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.tax_exempt_reason[0]}</p>
                )}
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button
              className={buttonStyles("primary")}
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : t("settings.vatTax.saveSettings")}
            </button>
          </div>
        </div>
      </div>

      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.vatTax.elsterCertificate.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.vatTax.elsterCertificate.description")}
          </p>
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              Certificate File
            </label>
            <div className="mt-1.5 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  .p12 or .pfx files only
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.vatTax.elsterCertificate.password")}
            </label>
            <input
              type="password"
              className={cn(styles.input, "mt-1.5")}
              placeholder="Enter certificate password"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              The password for your Elster certificate file
            </p>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              {t("settings.vatTax.elsterCertificate.upload")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
