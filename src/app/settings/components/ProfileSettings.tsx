import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { type SelectOption } from "@/components/atoms";
import type { Profile } from "@/types";
import { GERMAN_STATES } from "@/lib/constants";

interface ProfileSettingsProps {
  profile?: Profile;
  onSave: (data: Partial<Profile>) => void;
  isSaving: boolean;
  errors?: Record<string, string[]>;
  errorMessage?: string;
}

export function ProfileSettings({
  profile,
  onSave,
  isSaving,
  errors = {},
  errorMessage = "",
}: ProfileSettingsProps) {
  const t = useTranslations();

  const countryOptions: SelectOption[] = [
    { value: "DE", label: t("countries.germany") },
    { value: "AT", label: t("countries.austria") },
    { value: "CH", label: t("countries.switzerland") },
    { value: "GB", label: t("countries.unitedKingdom") },
    { value: "FR", label: t("countries.france") },
    { value: "NL", label: t("countries.netherlands") },
    { value: "BE", label: t("countries.belgium") },
    { value: "OTHER", label: t("countries.other") },
  ];

  const [formData, setFormData] = useState({
    businessName: profile?.businessName || "",
    fullName: profile?.fullName || "",
    phoneNumber: profile?.phoneNumber || "",
    taxNumber: profile?.taxNumber || "",
    address: {
      streetAddress: profile?.address?.streetAddress || "",
      city: profile?.address?.city || "",
      state: profile?.address?.state || "",
      postalCode: profile?.address?.postalCode || "",
      country: profile?.address?.country || "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        businessName: profile.businessName || "",
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        taxNumber: profile.taxNumber || "",
        address: {
          streetAddress: profile.address?.streetAddress || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          postalCode: profile.address?.postalCode || "",
          country: profile.address?.country || "",
        },
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: formData.fullName,
      businessName: formData.businessName,
      phoneNumber: formData.phoneNumber,
      taxNumber: formData.taxNumber,
      address: {
        streetAddress: formData.address.streetAddress,
        city: formData.address.city,
        state: formData.address.state,
        postalCode: formData.address.postalCode,
        country: formData.address.country,
      },
    });
  };

  const handleChange = (field: string, value: string, isAddress = false) => {
    if (isAddress) {
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Only show base errors in the banner list
  const baseErrors = errors.base || [];

  return (
    <form onSubmit={handleSubmit}>
      <div className={cn(styles.card)}>
        <div className={styles.cardHeader}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.profile.title")}
          </h3>
        </div>
        <div className={styles.cardContent}>
          {/* Error Message Banner */}
          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
              <div className="flex">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </h3>
                  {baseErrors.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {baseErrors.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("clients.form.name")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
              {errors.fullName?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.businessName")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.businessName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
              />
              {errors.businessName?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.businessName[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.phoneNumber")}
              </label>
              <input
                type="tel"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.phoneNumber && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
              {errors.phoneNumber?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.profile.taxId")}
              </label>
              <input
                type="text"
                className={cn(
                  styles.input,
                  "mt-1.5",
                  errors.taxNumber && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                value={formData.taxNumber}
                onChange={(e) => handleChange("taxNumber", e.target.value)}
              />
              {errors.taxNumber?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.taxNumber[0]}</p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              {t("settings.profile.address")}
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  {t("clients.form.streetAddress")}
                </label>
                <input
                  type="text"
                  className={cn(styles.input, "mt-1.5")}
                  value={formData.address.streetAddress}
                  onChange={(e) => handleChange("streetAddress", e.target.value, true)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {t("clients.form.city")}
                </label>
                <input
                  type="text"
                  className={cn(styles.input, "mt-1.5")}
                  value={formData.address.city}
                  onChange={(e) => handleChange("city", e.target.value, true)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {t("clients.form.country")}
                </label>
                <select
                  className={cn(styles.input, "mt-1.5")}
                  value={formData.address.country}
                  onChange={(e) => {
                    handleChange("country", e.target.value, true);
                    // Clear state if country is not DE
                    if (e.target.value !== "DE") {
                      handleChange("state", "", true);
                    }
                  }}
                >
                  <option value="">{t("common.select")}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.address.country === "DE" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t("clients.form.state")}
                  </label>
                  <select
                    className={cn(styles.input, "mt-1.5")}
                    value={formData.address.state}
                    onChange={(e) => handleChange("state", e.target.value, true)}
                  >
                    <option value="">{t("common.select")}</option>
                    {GERMAN_STATES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={formData.address.country === "DE" ? "" : "md:col-span-2"}>
                <label className="block text-sm font-medium text-slate-700">
                  {t("clients.form.postalCode")}
                </label>
                <input
                  type="text"
                  className={cn(styles.input, "mt-1.5")}
                  value={formData.address.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value, true)}
                />
              </div>
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
