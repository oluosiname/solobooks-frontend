"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout";
import { showToast } from "@/lib/toast";
import {
  Button,
  Card,
  CardContent,
  type SelectOption,
} from "@/components/atoms";
import { InputField, SelectField } from "@/components/molecules";
import { PageHeader } from "@/components/organisms";
import { api } from "@/services/api";

export default function NewClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    taxNumber: "",
    vatId: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Germany",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear field-specific errors when user types
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setErrorMessage("");

    try {
      await api.createClient({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName,
        taxNumber: formData.taxNumber,
        vatId: formData.vatId,
        address: {
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      });

      // Show success toast
      showToast.created("Client");

      // Invalidate clients cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      // Redirect to clients list
      router.push("/clients");
    } catch (error: any) {
      console.error("Failed to create client:", error);

      // Handle API errors
      if (error?.error) {
        const errorMsg = error.error.message || "Failed to create client";
        setErrorMessage(errorMsg);
        showToast.error(errorMsg);

        // Set field-specific validation errors
        if (error.error.details) {
          setErrors(error.error.details);
        }
      } else {
        const errorMsg = "An unexpected error occurred";
        setErrorMessage(errorMsg);
        showToast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log({ errors, errorMessage });
  const countryOptions: SelectOption[] = [
    { value: "Germany", label: t("countries.germany") },
    { value: "Austria", label: t("countries.austria") },
    { value: "Switzerland", label: t("countries.switzerland") },
    { value: "United Kingdom", label: t("countries.unitedKingdom") },
    { value: "France", label: t("countries.france") },
    { value: "Netherlands", label: t("countries.netherlands") },
    { value: "Belgium", label: t("countries.belgium") },
    { value: "Other", label: t("countries.other") },
  ];

  return (
    <AppShell title={t("clients.newClient")}>
      <PageHeader title={t("clients.newClient")} backButton />

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message Banner */}
              {errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {errorMessage}
                      </h3>
                      {errors.base.length > 0 && (
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc list-inside space-y-1">
                            {errors.base.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <InputField
                label={t("clients.form.name")}
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name?.[0]}
                required
              />

              <InputField
                label={t("clients.form.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email?.[0]}
                required
              />

              <InputField
                label={t("clients.form.phoneNumber")}
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                error={errors.phone_number?.[0]}
              />

              <InputField
                label={t("clients.form.businessName")}
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                error={errors.business_name?.[0]}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label={t("clients.form.taxNumber")}
                  name="taxNumber"
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleChange("taxNumber", e.target.value)}
                />
                <InputField
                  label={t("clients.form.vatId")}
                  name="vatId"
                  type="text"
                  value={formData.vatId}
                  onChange={(e) => handleChange("vatId", e.target.value)}
                />
              </div>

              {/* Address Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  {t("clients.form.address")}
                </h3>

                <div className="space-y-6">
                  <InputField
                    label={t("clients.form.streetAddress")}
                    name="streetAddress"
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      handleChange("streetAddress", e.target.value)
                    }
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <InputField
                      label={t("clients.form.city")}
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                    <InputField
                      label={t("clients.form.state")}
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <InputField
                      label={t("clients.form.postalCode")}
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleChange("postalCode", e.target.value)
                      }
                    />
                    <SelectField
                      label={t("clients.form.country")}
                      name="country"
                      options={countryOptions}
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  <Check className="h-4 w-4" />
                  {t("clients.form.createClient")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
