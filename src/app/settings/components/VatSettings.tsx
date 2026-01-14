import { useTranslations } from "next-intl";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";

export function VatSettings() {
  const t = useTranslations();

  return (
    <>
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.vatTax.title")}
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.registrationStatus")}
              </label>
              <select className={cn(styles.input, "mt-1.5")}>
                <option>I am VAT registered</option>
                <option>I am not VAT registered</option>
                <option>Small business exemption (Kleinunternehmer)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.vatNumber")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="DE123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.declarationPeriod")}
              </label>
              <select className={cn(styles.input, "mt-1.5")}>
                <option>Quarterly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.vatTax.scheme")}
              </label>
              <select className={cn(styles.input, "mt-1.5")}>
                <option>Standard</option>
                <option>Cash Accounting</option>
                <option>Flat Rate</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              {t("settings.vatTax.saveSettings")}
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
