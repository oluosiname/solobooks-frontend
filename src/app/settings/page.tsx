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
  CreditCard,
  Menu,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { cn } from "@/lib/utils";
import { Sheet, SheetHeader, SheetContent } from "@/components/ui/sheet";
import { api as newApi } from "@/services/api";
import type { InvoiceSettingsInput, Profile, ApiError } from "@/types";
import { showToast } from "@/lib/toast";
import humps from "humps";
import {
  ProfileSettings,
  AppSettings,
  InvoiceSettings,
  VatSettings,
  NotificationSettings,
  SecuritySettings,
  PrivacySettings,
  PaymentSettings,
} from "./components";

export default function SettingsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { id: "payment", label: t("settings.tabs.payment"), icon: CreditCard },
    { id: "privacy", label: t("settings.tabs.privacy"), icon: Lock },
  ];

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Profile form errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [profileErrorMessage, setProfileErrorMessage] = useState<string>("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: newApi.fetchProfile,
  });

  // Fetch unified settings (for app settings, notifications, privacy)
  const { data: unifiedSettings } = useQuery({
    queryKey: ["unifiedSettings"],
    queryFn: newApi.fetchSettings,
  });

  // Local state for notifications settings
  const [notifications, setNotifications] = useState({
    invoiceOverdue: true,
    vatReminders: true,
    deliveryMethods: ["email", "in_app"] as string[],
  });

  // Local state for privacy settings
  const [privacy, setPrivacy] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    thirdParty: true,
    clientConsentTrackingEnabled: true,
    clientDeletionRequestsEnabled: true,
    emailBreach: true,
    smsBreach: true,
    dataRetentionYears: 10,
    dataProcessingLocation: "eu_only" as "eu_only" | "global",
  });

  // Update notifications when unifiedSettings loads
  useEffect(() => {
    if (unifiedSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications({
        invoiceOverdue: unifiedSettings.notificationPreferences.invoiceOverdue ?? true,
        vatReminders: unifiedSettings.notificationPreferences.vatReminders ?? true,
        deliveryMethods: unifiedSettings.notificationPreferences.deliveryMethods ?? ["email", "in_app"],
      });
    }
  }, [unifiedSettings]);

  // Update privacy when unifiedSettings loads
  useEffect(() => {
    if (unifiedSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrivacy({
        essential: true, // Not in unified settings
        analytics: unifiedSettings.privacyPreferences.analytics,
        marketing: unifiedSettings.privacyPreferences.marketing,
        thirdParty: unifiedSettings.privacyPreferences.thirdParty,
        clientConsentTrackingEnabled:
          unifiedSettings.privacyPreferences.clientConsentTrackingEnabled,
        clientDeletionRequestsEnabled:
          unifiedSettings.privacyPreferences.clientDeletionRequestsEnabled,
        emailBreach: false, // Not in unified settings
        smsBreach: false, // Not in unified settings
        dataRetentionYears:
          unifiedSettings.privacyPreferences.dataRetentionYears ?? 10,
        dataProcessingLocation: (unifiedSettings.privacyPreferences
          .dataProcessingLocation === "eu_only" ? "eu_only" : "global") as "eu_only" | "global",
      });
    }
  }, [unifiedSettings]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => newApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      showToast.success("Profile updated successfully");
      setProfileErrors({});
      setProfileErrorMessage("");
    },
    onError: (error: ApiError) => {
      showToast.apiError(error, "Failed to update profile");
      
      // Extract error message
      const errorMsg = error?.error?.message || "Failed to update profile";
      setProfileErrorMessage(errorMsg);
      
      // Extract and transform field-specific validation errors
      if (error?.error?.details) {
        // Transform snake_case keys to camelCase using humps
        const transformedErrors = humps.camelizeKeys(error.error.details) as Record<string, string[]>;
        setProfileErrors(transformedErrors);
      } else {
        setProfileErrors({});
      }
    },
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


  // Invoice settings form state
  const [invoiceFormData, setInvoiceFormData] = useState<InvoiceSettingsInput>({
    prefix: "",
    startingSequence: 1,
    currencyId: 0, // Will be set when currencies load
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

  // Invoice settings errors
  const [invoiceErrors, setInvoiceErrors] = useState<Record<string, string[]>>({});
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState<string>("");

  // Set default currency when currencies are loaded
  useEffect(() => {
    if (currencies && currencies.length > 0 && invoiceFormData.currencyId === 0 && !invoiceSettings) {
      // Find EUR currency or use the first available
      const eurCurrency = currencies.find((c) => c.code === "EUR");
      if (eurCurrency) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoiceFormData((prev) => ({
          ...prev,
          currencyId: eurCurrency.id,
        }));
      } else if (currencies[0]) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoiceFormData((prev) => ({
          ...prev,
          currencyId: currencies[0].id,
        }));
      }
    }
  }, [currencies, invoiceFormData.currencyId, invoiceSettings]);

  // Update form when settings are loaded
  useEffect(() => {
    if (invoiceSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInvoiceFormData({
        prefix: invoiceSettings.prefix,
        startingSequence: invoiceSettings.startingSequence,
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
      setInvoiceErrors({});
      setInvoiceErrorMessage("");
    },
    onError: (error: ApiError) => {
      showToast.apiError(error, "Failed to save invoice settings");

      // Extract error message
      const errorMsg = error?.error?.message || "Failed to save invoice settings";
      setInvoiceErrorMessage(errorMsg);

      // Extract and set field-specific validation errors
      if (error?.error?.details) {
        setInvoiceErrors(error.error.details);
      } else {
        setInvoiceErrors({});
      }
    },
  });

  const handleInvoiceSettingsSave = async () => {
    // Validate required fields
    if (!invoiceFormData.currencyId || invoiceFormData.currencyId === 0) {
      showToast.error("Please select a currency");
      return;
    }
    if (!invoiceFormData.prefix.trim()) {
      showToast.error("Please enter an invoice prefix");
      return;
    }

    try {
      await saveInvoiceSettingsMutation.mutateAsync(invoiceFormData);
    } catch {
      // Error is handled by onError callback
    }
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const activeTabLabel = settingsTabs.find((tab) => tab.id === activeTab)?.label;
  const ActiveTabIcon = settingsTabs.find((tab) => tab.id === activeTab)?.icon;

  return (
    <AppShell title={t("settings.title")}>
      {/* Mobile Menu Button */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            {ActiveTabIcon && <ActiveTabIcon className="h-5 w-5 text-indigo-600" />}
            <span className="font-medium text-slate-900">{activeTabLabel}</span>
          </div>
          <Menu className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      {/* Mobile Sheet/Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} side="left">
        <SheetHeader onClose={() => setMobileMenuOpen(false)}>
          {t("settings.title")}
        </SheetHeader>
        <SheetContent>
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </div>
                  <ChevronRight className={cn("h-4 w-4", isActive ? "text-indigo-500" : "text-slate-300")} />
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex gap-6">
        {/* Sidebar Tabs - Hidden on mobile */}
        <div className="hidden w-64 shrink-0 md:block">
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
              errors={profileErrors}
              errorMessage={profileErrorMessage}
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
              errors={invoiceErrors}
              errorMessage={invoiceErrorMessage}
            />
          )}
          {activeTab === "vat" && <VatSettings />}
          {activeTab === "notifications" && (
            <NotificationSettings
              notifications={notifications}
              onNotificationsChange={(changes) => setNotifications((prev) => ({ ...prev, ...changes }))}
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
          {activeTab === "payment" && <PaymentSettings />}
          {activeTab === "privacy" && (
            <PrivacySettings
              privacy={privacy}
              onPrivacyChange={(changes) => setPrivacy((prev) => ({ ...prev, ...changes }))}
              unifiedSettings={unifiedSettings}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
