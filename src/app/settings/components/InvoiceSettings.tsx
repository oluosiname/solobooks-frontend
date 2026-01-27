import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import type { InvoiceSettings as InvoiceSettingsType, Currency, InvoiceSettingsInput } from "@/types";

interface InvoiceSettingsProps {
  invoiceSettings: InvoiceSettingsType | null | undefined;
  currencies?: Currency[];
  isLoading: boolean;
  isSaving: boolean;
  formData: InvoiceSettingsInput;
  onFormChange: (data: InvoiceSettingsProps["formData"]) => void;
  onSave: () => void;
  errors?: Record<string, string[]>;
  errorMessage?: string;
}

export function InvoiceSettings({
  currencies,
  isLoading,
  isSaving,
  formData,
  onFormChange,
  onSave,
  errors = {},
  errorMessage = "",
}: InvoiceSettingsProps) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
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

      {/* Bank Account Details */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.invoiceSettings.bankDetails.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.invoiceSettings.bankDetails.description")}
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.accountHolder")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.account_holder && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.accountHolder}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    accountHolder: e.target.value,
                  })
                }
              />
              {errors.account_holder && (
                <p className="mt-1 text-sm text-red-500">{errors.account_holder[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.bankName")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.bankName || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    bankName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.accountNumber")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.accountNumber || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    accountNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.sortCode")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.sortCode || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    sortCode: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.iban")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.iban || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    iban: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                BIC
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.bic || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    bic: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.swift")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.swift || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    swift: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.bankDetails.routingNumber")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.routingNumber || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    routingNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Defaults */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.invoiceSettings.defaults.title")}
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Currency
              </label>
              <select
                className={cn(styles.input, "mt-1.5")}
                value={formData.currencyId}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    currencyId: Number(e.target.value),
                  })
                }
              >
                {currencies?.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Language
              </label>
              <select
                className={cn(styles.input, "mt-1.5")}
                value={formData.language}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    language: e.target.value as "en" | "de",
                  })
                }
              >
                <option value="en">English</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.defaults.invoicePrefix")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.prefix && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.prefix}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    prefix: e.target.value,
                  })
                }
              />
              {errors.prefix && (
                <p className="mt-1 text-sm text-red-500">{errors.prefix[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.defaults.startingSequence")}
              </label>
              <input
                type="number"
                min="1"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.starting_sequence && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.startingSequence || ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                  onFormChange({
                    ...formData,
                    startingSequence: value,
                  });
                }}
                onBlur={(e) => {
                  if (!e.target.value || parseInt(e.target.value) < 1) {
                    onFormChange({
                      ...formData,
                      startingSequence: 1,
                    });
                  }
                }}
              />
              {errors.starting_sequence && (
                <p className="mt-1 text-sm text-red-500">{errors.starting_sequence[0]}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.invoiceSettings.defaults.defaultNotes")}
              </label>
              <textarea
                className={cn(styles.input, "mt-1.5 h-24 resize-none")}
                value={formData.defaultNote || ""}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    defaultNote: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button
              className={buttonStyles("primary")}
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {t("settings.invoiceSettings.defaults.save")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
