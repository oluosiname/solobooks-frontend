import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { Toggle } from "@/components/atoms";

interface NotificationSettingsProps {
  notifications: {
    invoiceSent: boolean;
    invoicePaid: boolean;
    invoiceOverdue: boolean;
    newClient: boolean;
    vatDue: boolean;
    vatSubmitted: boolean;
    taxYearEnd: boolean;
    largeExpense: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
  onNotificationsChange: (notifications: any) => void;
}

export function NotificationSettings({
  notifications,
  onNotificationsChange,
}: NotificationSettingsProps) {
  const t = useTranslations();

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
              enabled={notifications.invoiceSent}
              onChange={() =>
                onNotificationsChange({
                  ...notifications,
                  invoiceSent: !notifications.invoiceSent,
                })
              }
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
              enabled={notifications.invoicePaid}
              onChange={() =>
                onNotificationsChange({
                  ...notifications,
                  invoicePaid: !notifications.invoicePaid,
                })
              }
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
              onChange={() =>
                onNotificationsChange({
                  ...notifications,
                  invoiceOverdue: !notifications.invoiceOverdue,
                })
              }
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
              onChange={() =>
                onNotificationsChange({
                  ...notifications,
                  newClient: !notifications.newClient,
                })
              }
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
                enabled={notifications.vatDue}
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    vatDue: !notifications.vatDue,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.vatReminders.declarationSubmitted")}
                </p>
                <p className="text-sm text-slate-500">
                  Confirm when VAT declaration is successfully submitted
                </p>
              </div>
              <Toggle
                enabled={notifications.vatSubmitted}
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    vatSubmitted: !notifications.vatSubmitted,
                  })
                }
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
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    taxYearEnd: !notifications.taxYearEnd,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Transaction Alerts */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.notifications.transactionAlerts.title")}
          </h3>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.transactionAlerts.largeExpense")}
                </p>
                <p className="text-sm text-slate-500">
                  Get notified for expenses over €1,000
                </p>
              </div>
              <Toggle
                enabled={notifications.largeExpense}
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    largeExpense: !notifications.largeExpense,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.transactionAlerts.dailySummary")}
                </p>
                <p className="text-sm text-slate-500">
                  Receive a daily summary of all transactions
                </p>
              </div>
              <Toggle
                enabled={notifications.dailySummary}
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    dailySummary: !notifications.dailySummary,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.notifications.transactionAlerts.weeklySummary")}
                </p>
                <p className="text-sm text-slate-500">
                  Receive a weekly summary of income and expenses
                </p>
              </div>
              <Toggle
                enabled={notifications.weeklyReport}
                onChange={() =>
                  onNotificationsChange({
                    ...notifications,
                    weeklyReport: !notifications.weeklyReport,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <button className={buttonStyles("primary")}>
            <Check className="h-4 w-4" />
            {t("settings.notifications.savePreferences")}
          </button>
        </div>
      </div>
    </div>
  );
}
