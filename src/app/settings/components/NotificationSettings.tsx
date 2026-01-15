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
  unifiedSettings?: Settings;
}

export function NotificationSettings({
  notifications,
  unifiedSettings,
}: NotificationSettingsProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  // Component is currently read-only - no save functionality

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
                Get notified when an invoice is sent to a client
              </p>
            </div>
            <Toggle
              enabled={notifications.invoiceCreated}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.invoicePaid")}
              </p>
              <p className="text-sm text-slate-500">
                Get notified when an invoice is marked as paid
              </p>
            </div>
            <Toggle
              enabled={notifications.paymentReceived}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.invoiceOverdue")}
              </p>
              <p className="text-sm text-slate-500">
                Get notified when an invoice becomes overdue
              </p>
            </div>
            <Toggle
              enabled={notifications.invoiceOverdue}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.notifications.email.newClient")}
              </p>
              <p className="text-sm text-slate-500">
                Get notified when a new client is added
              </p>
            </div>
            <Toggle
              enabled={notifications.newClient}
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
                  Remind me 7 days before VAT declaration is due
                </p>
              </div>
              <Toggle
                enabled={notifications.monthlySummary}
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
                  Confirm when VAT declaration is successfully submitted
                </p>
              </div>
              <Toggle
                enabled={notifications.vatSubmitted}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.vatReminders.taxYearEnd")}
                </p>
                <p className="text-sm text-slate-500">
                  Remind me 30 days before tax year end
                </p>
              </div>
              <Toggle
                enabled={notifications.taxYearEnd}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <button
            className={buttonStyles("primary")}
            disabled={true}
          >
            <Check className="h-4 w-4" />
            {t("settings.notifications.savePreferences")} (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
