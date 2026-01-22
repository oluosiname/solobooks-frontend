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
import humps from "humps";

interface NotificationSettingsProps {
  notifications: {
    invoiceOverdue: boolean;
    vatReminders: boolean;
    deliveryMethods: string[];
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
      const notificationPreferences = {
        invoiceOverdue: notifications.invoiceOverdue,
        vatReminders: notifications.vatReminders,
        deliveryMethods: notifications.deliveryMethods,
      };
      updateNotificationsMutation.mutate({
        notification_preferences: humps.decamelizeKeys(notificationPreferences) as ApiSettingsData['notification_preferences'],
      });
    }
  };

  const handleDeliveryMethodChange = (method: string, checked: boolean) => {
    const currentMethods = notifications.deliveryMethods || [];
    const newMethods = checked
      ? [...currentMethods, method]
      : currentMethods.filter((m) => m !== method);
    onNotificationsChange?.({ deliveryMethods: newMethods });
  };

  return (
    <div className={cn(styles.card)}>
      <div className={styles.cardContent}>
        {/* Notification Preferences */}
        <h3 className="text-lg font-semibold text-slate-900">
          {t("settings.notifications.title")}
        </h3>
        <div className="mt-6 space-y-6">
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
                {t("settings.notifications.vatReminders.title")}
              </p>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.vatReminders.declarationDueDesc")}
              </p>
            </div>
            <Toggle
              enabled={notifications.vatReminders}
              onChange={() => onNotificationsChange?.({ vatReminders: !notifications.vatReminders })}
            />
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Delivery Methods
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="delivery-email"
                checked={notifications.deliveryMethods?.includes("email") || false}
                onChange={(e) => handleDeliveryMethodChange("email", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="delivery-email"
                className="ml-3 text-sm font-medium text-slate-900"
              >
                Email
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="delivery-in-app"
                checked={notifications.deliveryMethods?.includes("in_app") || false}
                onChange={(e) => handleDeliveryMethodChange("in_app", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="delivery-in-app"
                className="ml-3 text-sm font-medium text-slate-900"
              >
                In-App
              </label>
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
