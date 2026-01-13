"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout";
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
  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    taxNumber: "",
    vatId: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Germany",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: `${formData.city}, ${formData.country}`,
        businessName: formData.businessName,
        taxNumber: formData.taxNumber,
        vatId: formData.vatId,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
      router.push("/clients");
    } catch (error) {
      console.error("Failed to create client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {/* Basic Information */}
              <InputField
                label={t("clients.form.name")}
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />

              <InputField
                label={t("clients.form.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />

              <InputField
                label={t("clients.form.phone")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />

              <InputField
                label={t("clients.form.businessName")}
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
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
                    label={t("clients.form.street")}
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
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
                      label={t("clients.form.zipCode")}
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
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
