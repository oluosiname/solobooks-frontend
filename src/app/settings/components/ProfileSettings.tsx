import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import type { User } from "@/types";

interface ProfileSettingsProps {
  profile?: User;
  onSave: (data: Partial<User>) => void;
  isSaving: boolean;
}

export function ProfileSettings({
  profile,
  onSave,
  isSaving,
}: ProfileSettingsProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || "",
    fullName: profile?.name || "",
    phoneNumber: profile?.phoneNumber || "",
    taxNumber: profile?.taxId || "",
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || "",
        fullName: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        taxNumber: profile.taxId || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Transform camelCase field names to User type field names
    onSave({
      name: formData.fullName,
      businessName: formData.businessName,
      phoneNumber: formData.phoneNumber,
      taxId: formData.taxNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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
                {t("clients.form.name")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.businessName")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.phoneNumber")}
              </label>
              <input
                type="tel"
                className={cn(styles.input, "mt-1.5")}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.taxId")}
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                value={formData.taxNumber}
                onChange={(e) =>
                  setFormData({ ...formData, taxNumber: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button
              type="submit"
              className={buttonStyles("primary")}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("settings.profile.saveChanges")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
