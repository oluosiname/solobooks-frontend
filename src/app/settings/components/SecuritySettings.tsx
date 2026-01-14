import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { Toggle } from "@/components/atoms";

interface SecuritySettingsProps {
  twoFactorEnabled: boolean;
  onTwoFactorToggle: () => void;
  onSetActiveTab: (tab: string) => void;
}

export function SecuritySettings({
  twoFactorEnabled,
  onTwoFactorToggle,
  onSetActiveTab,
}: SecuritySettingsProps) {
  const t = useTranslations();

  return (
    <>
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.security.changePassword")}
          </h3>
          <div className="mt-6 max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.security.currentPassword")}
              </label>
              <input
                type="password"
                className={cn(styles.input, "mt-1.5")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.security.newPassword")}
              </label>
              <input
                type="password"
                className={cn(styles.input, "mt-1.5")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.security.confirmPassword")}
              </label>
              <input
                type="password"
                className={cn(styles.input, "mt-1.5")}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              {t("settings.security.updatePassword")}
            </button>
          </div>
        </div>
      </div>

      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.security.twoFactor.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.security.twoFactor.description")}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {t("settings.security.twoFactor.enable")}
              </p>
              <p className="text-sm text-slate-500">
                Require authentication code in addition to password
              </p>
            </div>
            <Toggle enabled={twoFactorEnabled} onChange={onTwoFactorToggle} />
          </div>
        </div>
      </div>

      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.security.sessions.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Manage your active sessions across different devices.
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-900">Chrome on macOS</p>
                <p className="text-sm text-slate-500">
                  London, UK · Last active now
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                {t("settings.security.sessions.current")}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-900">Safari on iPhone</p>
                <p className="text-sm text-slate-500">
                  London, UK · Last active 2 hours ago
                </p>
              </div>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">
                Revoke
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("secondary")}>
              {t("settings.security.sessions.logoutAll")}
            </button>
          </div>
        </div>
      </div>

      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Account Management
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            For data export, account deletion, and privacy settings, please
            visit the{" "}
            <button
              onClick={() => onSetActiveTab("privacy")}
              className="text-indigo-600 hover:text-indigo-700"
            >
              {t("settings.tabs.privacy")}
            </button>{" "}
            tab.
          </p>
        </div>
      </div>
    </>
  );
}
