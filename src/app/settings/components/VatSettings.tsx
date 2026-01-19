"use client";

import { useTranslations } from "next-intl";
import { Check, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { useState, useEffect } from "react";
import {
  fetchVatStatus,
  createVatStatus,
  updateVatStatus,
} from "@/services/api";
import {
  uploadElsterCertificate,
  deleteElsterCertificate,
  getElsterCertificate,
} from "@/lib/elster-certificates-api";
import { showToast } from "@/lib/toast";
import type { VatStatus, DeclarationPeriod, ElsterCertificate } from "@/types";

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
  const [declarationPeriod, setDeclarationPeriod] =
    useState<DeclarationPeriod>("monthly");
  const [startsOn, setStartsOn] = useState("");
  const [taxExemptReason, setTaxExemptReason] = useState("");

  // Elster Certificate state
  const [elsterCertificate, setElsterCertificate] = useState<ElsterCertificate | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePassword, setCertificatePassword] = useState("");
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certificateDeleting, setCertificateDeleting] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(true);

  // Load VAT status and Elster certificate on mount
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

    async function loadElsterCertificate() {
      try {
        const certificate = await getElsterCertificate();
        setElsterCertificate(certificate);
      } catch (error) {
        console.error("Failed to load Elster certificate:", error);
        // Don't show error toast for certificate loading as it's optional
      } finally {
        setCertificateLoading(false);
      }
    }

    loadVatStatus();
    loadElsterCertificate();
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
    } catch (error: unknown) {
      console.error("Failed to save VAT status:", error);

      // Handle API errors
      const apiError = error as { error?: { message?: string; details?: Record<string, string[]> } };
      if (apiError?.error) {
        const errorMsg = apiError.error.message || "Failed to save VAT settings";
        setErrorMessage(errorMsg);
        showToast.error(errorMsg);

        // Set field-specific validation errors
        if (apiError.error.details) {
          setErrors(apiError.error.details);
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

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/x-pkcs12', 'application/x-pfx'];
      const validExtensions = ['.p12', '.pfx'];
      const fileName = file.name.toLowerCase();

      const isValidType = validTypes.includes(file.type) ||
        validExtensions.some(ext => fileName.endsWith(ext));

      if (!isValidType) {
        showToast.error("Please select a valid .p12 or .pfx certificate file");
        return;
      }

      setCertificateFile(file);
    }
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile || !certificatePassword.trim()) {
      showToast.error("Please select a certificate file and enter the password");
      return;
    }

    setCertificateUploading(true);
    try {
      const certificate = await uploadElsterCertificate(certificateFile, certificatePassword);
      setElsterCertificate(certificate);
      setCertificateFile(null);
      setCertificatePassword("");
      showToast.success("Elster certificate uploaded successfully");
    } catch (error: unknown) {
      console.error("Failed to upload certificate:", error);
      const apiError = error as { response?: { data?: { error?: { message?: string } } } };
      const message = apiError?.response?.data?.error?.message || "Failed to upload certificate";
      showToast.error(message);
    } finally {
      setCertificateUploading(false);
    }
  };

  const handleDeleteCertificate = async () => {
    if (!elsterCertificate) return;

    setCertificateDeleting(true);
    try {
      await deleteElsterCertificate();
      setElsterCertificate(null);
      showToast.success("Elster certificate deleted successfully");
    } catch (error: unknown) {
      console.error("Failed to delete certificate:", error);
      const apiError = error as { response?: { data?: { error?: { message?: string } } } };
      const message = apiError?.response?.data?.error?.message || "Failed to delete certificate";
      showToast.error(message);
    } finally {
      setCertificateDeleting(false);
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
                  errors.vat_registered &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={
                  kleinunternehmer
                    ? "kleinunternehmer"
                    : vatRegistered
                    ? "registered"
                    : "not_registered"
                }
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
                <option value="kleinunternehmer">
                  Small business exemption (Kleinunternehmer)
                </option>
              </select>
              {errors.vat_registered && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.vat_registered[0]}
                </p>
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
                  errors.vat_number &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={vatNumber}
                onChange={(e) => {
                  setVatNumber(e.target.value);
                  handleFieldChange("vat_number");
                }}
                placeholder="DE123456789"
              />
              {errors.vat_number && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.vat_number[0]}
                </p>
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
                  errors.declaration_period &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.declaration_period[0]}
                </p>
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
                  errors.starts_on &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={startsOn}
                onChange={(e) => {
                  setStartsOn(e.target.value);
                  handleFieldChange("starts_on");
                }}
              />
              {errors.starts_on && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.starts_on[0]}
                </p>
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
                    errors.tax_exempt_reason &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.tax_exempt_reason[0]}
                  </p>
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

          {/* Current Certificate Status */}
          {certificateLoading ? (
            <div className="mt-6 flex items-center justify-center py-8">
              <p className="text-slate-500">Loading certificate status...</p>
            </div>
          ) : elsterCertificate ? (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-green-800">
                    Certificate Uploaded
                  </h4>
                  <div className="mt-2 text-sm text-green-700">
                    <p>ID: {elsterCertificate.id}</p>
                    {elsterCertificate.expired && (
                      <p className="text-red-600">Status: Expired</p>
                    )}
                    {elsterCertificate.expiringSoon && !elsterCertificate.expired && (
                      <p className="text-yellow-600">Status: Expiring Soon</p>
                    )}
                    {!elsterCertificate.expired && !elsterCertificate.expiringSoon && (
                      <p className="text-green-600">Status: Valid</p>
                    )}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={handleDeleteCertificate}
                      disabled={certificateDeleting}
                      className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                    >
                      {certificateDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Remove Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Form */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700">
                  Certificate File
                </label>
                <div className="mt-1.5">
                  <input
                    type="file"
                    accept=".p12,.pfx"
                    onChange={handleCertificateFileChange}
                    className="hidden"
                    id="certificate-file"
                  />
                  <label
                    htmlFor="certificate-file"
                    className="flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 cursor-pointer hover:border-slate-400 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600">
                        {certificateFile ? certificateFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        .p12 or .pfx files only
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700">
                  {t("settings.vatTax.elsterCertificate.password")}
                </label>
                <input
                  type="password"
                  className={cn(styles.input, "mt-1.5")}
                  value={certificatePassword}
                  onChange={(e) => setCertificatePassword(e.target.value)}
                  placeholder="Enter certificate password"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  The password for your Elster certificate file
                </p>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
                <button
                  onClick={handleUploadCertificate}
                  disabled={certificateUploading || !certificateFile || !certificatePassword.trim()}
                  className={buttonStyles("primary")}
                >
                  {certificateUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {t("settings.vatTax.elsterCertificate.upload")}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Warning when no certificate */}
          {!certificateLoading && !elsterCertificate && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">
                    Certificate Required for Tax Submissions
                  </h4>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      You need an Elster certificate to submit VAT reports to the German tax authorities.
                      Upload your certificate above to enable tax submissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
