import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import type { User } from "@/types";

interface ProfileSettingsProps {
  profile?: User;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const t = useTranslations();

  return (
    <div className={cn(styles.card)}>
      <div className={styles.cardHeader}>
        <h3 className="text-lg font-semibold text-slate-900">
          {t("settings.profile.title")}
        </h3>
      </div>
      <div className={styles.cardContent}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.businessName")}
            </label>
            <input
              type="text"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.businessName || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("clients.form.name")}
            </label>
            <input
              type="text"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.name || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.email")}
            </label>
            <input
              type="email"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.email || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.phoneNumber")}
            </label>
            <input
              type="tel"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.phoneNumber || ""}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.address")}
            </label>
            <input
              type="text"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.address || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.taxId")}
            </label>
            <input
              type="text"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.taxId || ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("settings.profile.website")}
            </label>
            <input
              type="url"
              className={cn(styles.input, "mt-1.5")}
              defaultValue={profile?.website || ""}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
          <button className={buttonStyles("primary")}>
            <Save className="h-4 w-4" />
            {t("settings.profile.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
