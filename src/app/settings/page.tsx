"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  User,
  Settings,
  Calculator,
  Bell,
  Shield,
  Lock,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { api as newApi } from "@/services/api";
import type { InvoiceSettingsInput, User as UserType } from "@/types";
import { showToast } from "@/lib/toast";
import {
  ProfileSettings,
  AppSettings,
  InvoiceSettings,
  VatSettings,
  NotificationSettings,
  SecuritySettings,
  PrivacySettings,
} from "./components";

export default function SettingsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("profile");
  const queryClient = useQueryClient();

  const settingsTabs = [
    { id: "profile", label: t("settings.tabs.profile"), icon: User },
    { id: "app", label: t("settings.tabs.appSettings"), icon: Settings },
    {
      id: "invoice",
      label: t("settings.tabs.invoiceSettings"),
      icon: FileText,
    },
    { id: "vat", label: t("settings.tabs.vatTax"), icon: Calculator },
    {
      id: "notifications",
      label: t("settings.tabs.notifications"),
      icon: Bell,
    },
    { id: "security", label: t("settings.tabs.security"), icon: Shield },
    { id: "privacy", label: t("settings.tabs.privacy"), icon: Lock },
  ];

  // Initialize state from unified settings when loaded
  const [notifications, setNotifications] = useState({
    invoiceSent: true,
    invoicePaid: true,
    invoiceOverdue: true,
    newClient: false,
    vatDue: true,
    vatSubmitted: true,
    taxYearEnd: true,
    largeExpense: false,
    dailySummary: false,
    weeklyReport: true,
  });

  const [privacy, setPrivacy] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    thirdParty: true,
    clientConsent: true,
    clientDeletion: true,
    emailBreach: true,
    smsBreach: true,
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: newApi.fetchProfile,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserType>) => newApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      showToast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      showToast.apiError(error, "Failed to update profile");
    },
  });

  // Fetch unified settings (for app settings, notifications, privacy)
  const { data: unifiedSettings } = useQuery({
    queryKey: ["unifiedSettings"],
    queryFn: newApi.fetchSettings,
  });

  // Fetch invoice settings and currencies (separate from unified settings)
  const { data: invoiceSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["invoiceSettings"],
    queryFn: newApi.fetchInvoiceSettings,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: newApi.fetchCurrencies,
  });

  // Update state when unified settings are loaded
  useEffect(() => {
    if (unifiedSettings) {
      setNotifications({
        invoiceSent: unifiedSettings.notification_preferences?.invoice_created ?? true,
        invoicePaid: unifiedSettings.notification_preferences?.payment_received ?? true,
        invoiceOverdue: unifiedSettings.notification_preferences?.invoice_overdue ?? true,
        newClient: false, // Not in unified settings
        vatDue: unifiedSettings.notification_preferences?.monthly_summary ?? true,
        vatSubmitted: false, // Not in unified settings
        taxYearEnd: false, // Not in unified settings
        largeExpense: false, // Not in unified settings
        dailySummary: false, // Not in unified settings
        weeklyReport: false, // Not in unified settings
      });

      setPrivacy({
        essential: true, // Not in unified settings
        analytics: unifiedSettings.privacy_preferences?.analytics ?? true,
        marketing: unifiedSettings.privacy_preferences?.marketing ?? false,
        thirdParty: unifiedSettings.privacy_preferences?.third_party ?? true,
        clientConsent: unifiedSettings.privacy_preferences?.client_consent_tracking_enabled === "1" || unifiedSettings.privacy_preferences?.client_consent_tracking_enabled === true,
        clientDeletion: unifiedSettings.privacy_preferences?.client_deletion_requests_enabled === "1" || unifiedSettings.privacy_preferences?.client_deletion_requests_enabled === true,
        emailBreach: false, // Not in unified settings
        smsBreach: false, // Not in unified settings
      });
    }
  }, [unifiedSettings]);

  // Invoice settings form state
  const [invoiceFormData, setInvoiceFormData] = useState<InvoiceSettingsInput>({
    prefix: "",
    currencyId: 1,
    language: "en",
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    bic: "",
    swift: "",
    sortCode: "",
    routingNumber: "",
    defaultNote: "",
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (invoiceSettings) {
      setInvoiceFormData({
        prefix: invoiceSettings.prefix,
        currencyId: invoiceSettings.currency.id,
        language: invoiceSettings.language,
        accountHolder: invoiceSettings.accountHolder,
        accountNumber: invoiceSettings.accountNumber || "",
        bankName: invoiceSettings.bankName || "",
        iban: invoiceSettings.iban || "",
        bic: invoiceSettings.bic || "",
        swift: invoiceSettings.swift || "",
        sortCode: invoiceSettings.sortCode || "",
        routingNumber: invoiceSettings.routingNumber || "",
        defaultNote: invoiceSettings.defaultNote || "",
      });
    }
  }, [invoiceSettings]);

  // Mutation for creating/updating invoice settings
  const saveInvoiceSettingsMutation = useMutation({
    mutationFn: (data: InvoiceSettingsInput) => {
      if (invoiceSettings) {
        return newApi.updateInvoiceSettings(data);
      }
      return newApi.createInvoiceSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSettings"] });
      showToast.success("Invoice settings saved successfully");
    },
    onError: (error: any) => {
      showToast.apiError(error, "Failed to save invoice settings");
    },
  });

  const handleInvoiceSettingsSave = async () => {
    try {
      await saveInvoiceSettingsMutation.mutateAsync(invoiceFormData);
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  return (
    <AppShell title={t("settings.title")}>
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <ProfileSettings
              profile={user}
              onSave={(data) => updateProfileMutation.mutate(data)}
              isSaving={updateProfileMutation.isPending}
            />
          )}
          {activeTab === "app" && <AppSettings settings={unifiedSettings} />}
          {activeTab === "invoice" && (
            <InvoiceSettings
              invoiceSettings={invoiceSettings}
              currencies={currencies}
              isLoading={isLoadingSettings}
              isSaving={saveInvoiceSettingsMutation.isPending}
              formData={invoiceFormData}
              onFormChange={setInvoiceFormData}
              onSave={handleInvoiceSettingsSave}
            />
          )}
          {activeTab === "vat" && <VatSettings />}
          {activeTab === "notifications" && (
            <NotificationSettings
              notifications={notifications}
              onNotificationsChange={setNotifications}
              unifiedSettings={unifiedSettings}
            />
          )}
          {activeTab === "security" && (
            <SecuritySettings
              twoFactorEnabled={twoFactorEnabled}
              onTwoFactorToggle={() => setTwoFactorEnabled(!twoFactorEnabled)}
              onSetActiveTab={setActiveTab}
            />
          )}
          {activeTab === "privacy" && (
            <PrivacySettings
              privacy={privacy}
              onPrivacyChange={setPrivacy}
              unifiedSettings={unifiedSettings}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
