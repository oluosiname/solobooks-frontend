import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { SettingsData } from "@/lib/settings-api";

interface AppSettingsProps {
  settings?: SettingsData;
}

export function AppSettings({ settings }: AppSettingsProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    language: settings?.language || "en",
    currency: settings?.currency.code || "EUR",
  });

  // Update form data when settings change
  React.useEffect(() => {
    if (settings) {
      setFormData({
        language: settings.language,
        currency: settings.currency.code,
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<SettingsData>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedSettings"] });
      showToast.success("App settings saved successfully");
    },
    onError: (error: any) => {
      showToast.apiError(error, "Failed to save app settings");
    },
  });

  const handleSave = () => {
    if (settings) {
      updateSettingsMutation.mutate({
        language: formData.language,
        currency: {
          ...settings.currency,
          code: formData.currency,
        },
      });
    }
  };

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
            <select
              className={cn(styles.input, "mt-1.5")}
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.appSettings.currency")}
            </label>
            <select
              className={cn(styles.input, "mt-1.5")}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
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
          <button
            className={buttonStyles("primary")}
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
          >
            <Check className="h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : t("settings.appSettings.saveSettings")}
          </button>
        </div>
      </div>
    </div>
  );
}
