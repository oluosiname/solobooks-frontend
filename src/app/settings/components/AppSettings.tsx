import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";

export function AppSettings() {
  const t = useTranslations();

  return (
    <div className={cn(styles.card)}>
      <div className={styles.cardContent}>
        <h3 className="text-lg font-semibold text-slate-900">
          {t("settings.appSettings.title")}
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.appSettings.language")}
            </label>
            <select className={cn(styles.input, "mt-1.5")}>
              <option>English</option>
              <option>German</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.appSettings.currency")}
            </label>
            <select className={cn(styles.input, "mt-1.5")}>
              <option>EUR - Euro</option>
              <option>USD - US Dollar</option>
              <option>GBP - British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.appSettings.dateFormat")}
            </label>
            <select className={cn(styles.input, "mt-1.5")}>
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.appSettings.timezone")}
            </label>
            <select className={cn(styles.input, "mt-1.5")}>
              <option>London (GMT)</option>
              <option>Berlin (CET)</option>
              <option>New York (EST)</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <button className={buttonStyles("primary")}>
            <Check className="h-4 w-4" />
            {t("settings.appSettings.saveSettings")}
          </button>
        </div>
      </div>
    </div>
  );
}
