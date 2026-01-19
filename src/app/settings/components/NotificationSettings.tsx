import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { Toggle } from "@/components/atoms";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { Settings } from "@/types";
import type { SettingsData as ApiSettingsData } from "@/lib/settings-api";

interface NotificationSettingsProps {
  notifications: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    monthlySummary: boolean;
    newClient: boolean;
    vatSubmitted: boolean;
    taxYearEnd: boolean;
  };
  onNotificationsChange?: (changes: Partial<NotificationSettingsProps['notifications']>) => void;
  unifiedSettings?: Settings;
}

export function NotificationSettings({
  notifications,
  onNotificationsChange,
  unifiedSettings,
}: NotificationSettingsProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: Partial<ApiSettingsData>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedSettings"] });
      showToast.success("Notification preferences saved successfully");
    },
    onError: (error: unknown) => {
      showToast.apiError(error, "Failed to save notification preferences");
    },
  });

  const handleSave = () => {
    if (unifiedSettings) {
      updateNotificationsMutation.mutate({
        notification_preferences: {
          invoice_created: notifications.invoiceCreated,
          payment_received: notifications.paymentReceived,
          invoice_overdue: notifications.invoiceOverdue,
          monthly_summary: notifications.monthlySummary,
        },
      });
    }
  };

  return (
    <div className={cn(styles.card)}>
      <div className={styles.cardContent}>
        {/* Email Notifications */}
        <h3 className="text-lg font-semibold text-slate-900">
          {t("settings.notifications.email.title")}
        </h3>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.invoiceSent")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.email.invoiceSentDesc")}
              </p>
            </div>
            <Toggle
              enabled={notifications.invoiceCreated}
              onChange={() => onNotificationsChange?.({ invoiceCreated: !notifications.invoiceCreated })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.invoicePaid")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.email.invoicePaidDesc")}
              </p>
            </div>
            <Toggle
              enabled={notifications.paymentReceived}
              onChange={() => onNotificationsChange?.({ paymentReceived: !notifications.paymentReceived })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.invoiceOverdue")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.email.invoiceOverdueDesc")}
              </p>
            </div>
            <Toggle
              enabled={notifications.invoiceOverdue}
              onChange={() => onNotificationsChange?.({ invoiceOverdue: !notifications.invoiceOverdue })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.newClient")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.email.newClientDesc")}
              </p>
            </div>
            <Toggle
              enabled={notifications.newClient}
              onChange={() => onNotificationsChange?.({ newClient: !notifications.newClient })}
            />
          </div>
        </div>

        {/* VAT & Tax Reminders */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.notifications.vatReminders.title")}
          </h3>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.vatReminders.declarationDue")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("settings.notifications.vatReminders.declarationDueDesc")}
                </p>
              </div>
              <Toggle
                enabled={notifications.monthlySummary}
                onChange={() => onNotificationsChange?.({ monthlySummary: !notifications.monthlySummary })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t(
                    "settings.notifications.vatReminders.declarationSubmitted"
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {t("settings.notifications.vatReminders.declarationSubmittedDesc")}
                </p>
              </div>
              <Toggle
                enabled={notifications.vatSubmitted}
                onChange={() => onNotificationsChange?.({ vatSubmitted: !notifications.vatSubmitted })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.vatReminders.taxYearEnd")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("settings.notifications.vatReminders.taxYearEndDesc")}
                </p>
              </div>
              <Toggle
                enabled={notifications.taxYearEnd}
                onChange={() => onNotificationsChange?.({ taxYearEnd: !notifications.taxYearEnd })}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <button
            className={buttonStyles("primary")}
            onClick={handleSave}
            disabled={updateNotificationsMutation.isPending}
          >
            <Check className="h-4 w-4" />
            {updateNotificationsMutation.isPending
              ? "Saving..."
              : t("settings.notifications.savePreferences")}
          </button>
        </div>
      </div>
    </div>
  );
}
