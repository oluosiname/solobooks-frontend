import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { Toggle } from "@/components/atoms";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import * as humps from "humps";
import type { Settings } from "@/types";
import type { SettingsData as ApiSettingsData } from "@/lib/settings-api";

interface PrivacySettingsProps {
  privacy: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    clientConsentTrackingEnabled: boolean;
    clientDeletionRequestsEnabled: boolean;
    emailBreach: boolean;
    smsBreach: boolean;
    dataRetentionYears: number;
    dataProcessingLocation: "eu_only" | "global";
  };
  onPrivacyChange: (
    privacy: Partial<{
      essential: boolean;
      analytics: boolean;
      marketing: boolean;
      thirdParty: boolean;
      clientConsentTrackingEnabled: boolean;
      clientDeletionRequestsEnabled: boolean;
      emailBreach: boolean;
      smsBreach: boolean;
      dataRetentionYears: number;
      dataProcessingLocation: "eu_only" | "global";
    }>
  ) => void;
  unifiedSettings?: Settings;
}

export function PrivacySettings({
  privacy,
  onPrivacyChange,
  unifiedSettings,
}: PrivacySettingsProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const updatePrivacyMutation = useMutation({
    mutationFn: (data: Partial<ApiSettingsData>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedSettings"] });
      showToast.success("Privacy preferences saved successfully");
    },
    onError: (error: unknown) => {
      showToast.apiError(error, "Failed to save privacy preferences");
    },
  });

  const handleConsentSave = () => {
    if (unifiedSettings) {
      updatePrivacyMutation.mutate({
        privacy_preferences: {
          analytics: privacy.analytics,
          marketing: privacy.marketing,
          third_party: privacy.thirdParty,
          data_retention_years: privacy.dataRetentionYears,
          data_processing_location: privacy.dataProcessingLocation,
          client_consent_tracking_enabled: privacy.clientConsentTrackingEnabled,
          client_deletion_requests_enabled:
            privacy.clientDeletionRequestsEnabled,
        },
      });
    }
  };

  const handleRetentionSave = () => {
    if (unifiedSettings) {
      updatePrivacyMutation.mutate({
        privacy_preferences: {
          analytics: unifiedSettings.privacyPreferences.analytics,
          marketing: unifiedSettings.privacyPreferences.marketing,
          third_party: unifiedSettings.privacyPreferences.thirdParty,
          data_retention_years: privacy.dataRetentionYears,
          data_processing_location: privacy.dataProcessingLocation,
          client_consent_tracking_enabled: privacy.clientConsentTrackingEnabled,
          client_deletion_requests_enabled:
            privacy.clientDeletionRequestsEnabled,
        },
      });
    }
  };
  return (
    <>
      {/* Compliance Status */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-emerald-900">
            {t("settings.privacy.complianceStatus.title")}
          </p>
          <p className="text-sm text-emerald-700">
            {t("settings.privacy.complianceStatus.description")}
          </p>
        </div>
      </div>

      {/* Consent Management */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.consentManagement.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.privacy.consentManagement.description")}
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.consentManagement.essential.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t(
                    "settings.privacy.consentManagement.essential.description"
                  )}
                </p>
              </div>
              <Toggle enabled={privacy.essential} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.consentManagement.analytics.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t(
                    "settings.privacy.consentManagement.analytics.description"
                  )}
                </p>
              </div>
              <Toggle
                enabled={privacy.analytics}
                onChange={() =>
                  onPrivacyChange({ ...privacy, analytics: !privacy.analytics })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.consentManagement.marketing.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t(
                    "settings.privacy.consentManagement.marketing.description"
                  )}
                </p>
              </div>
              <Toggle
                enabled={privacy.marketing}
                onChange={() =>
                  onPrivacyChange({ ...privacy, marketing: !privacy.marketing })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.consentManagement.thirdParty.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t(
                    "settings.privacy.consentManagement.thirdParty.description"
                  )}
                </p>
              </div>
              <Toggle
                enabled={privacy.thirdParty}
                onChange={() =>
                  onPrivacyChange({
                    ...privacy,
                    thirdParty: !privacy.thirdParty,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button
              className={buttonStyles("primary")}
              onClick={handleConsentSave}
              disabled={updatePrivacyMutation.isPending}
            >
              <Check className="h-4 w-4" />
              {updatePrivacyMutation.isPending
                ? "Saving..."
                : t("settings.privacy.consentManagement.saveButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Your Data Rights */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.dataRights.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.privacy.dataRights.description")}
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t("settings.privacy.dataRights.portability.title")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("settings.privacy.dataRights.portability.description")}
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>
                {t("settings.privacy.dataRights.portability.button")}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t("settings.privacy.dataRights.access.title")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("settings.privacy.dataRights.access.description")}
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>
                {t("settings.privacy.dataRights.access.button")}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t("settings.privacy.dataRights.rectification.title")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("settings.privacy.dataRights.rectification.description")}
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>
                {t("settings.privacy.dataRights.rectification.button")}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t("settings.privacy.dataRights.erasure.title")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("settings.privacy.dataRights.erasure.description")}
                  </p>
                </div>
              </div>
              <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                {t("settings.privacy.dataRights.erasure.button")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention & Processing */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.dataRetention.title")}
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.privacy.dataRetention.retentionLabel")}
              </label>
              <select
                className={cn(styles.input, "mt-1.5")}
                value={privacy.dataRetentionYears}
                onChange={(e) =>
                  onPrivacyChange({
                    dataRetentionYears: parseInt(e.target.value),
                  })
                }
              >
                <option value={10}>
                  {t("settings.privacy.dataRetention.retentionOptions.10years")}
                </option>
                <option value={7}>
                  {t("settings.privacy.dataRetention.retentionOptions.7years")}
                </option>
                <option value={5}>
                  {t("settings.privacy.dataRetention.retentionOptions.5years")}
                </option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {t("settings.privacy.dataRetention.retentionNote")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.privacy.dataRetention.processingLabel")}
              </label>
              <select
                className={cn(styles.input, "mt-1.5")}
                value={privacy.dataProcessingLocation}
                onChange={(e) =>
                  onPrivacyChange({
                    dataProcessingLocation: e.target.value as
                      | "eu_only"
                      | "global",
                  })
                }
              >
                <option value="eu_only">
                  {t("settings.privacy.dataRetention.processingOptions.euOnly")}
                </option>
                <option value="global">
                  {t("settings.privacy.dataRetention.processingOptions.global")}
                </option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {t("settings.privacy.dataRetention.processingNote")}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <h4 className="font-semibold text-slate-900">
              {t("settings.privacy.dataRetention.clientProcessing.title")}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {t("settings.privacy.dataRetention.clientProcessing.description")}
            </p>
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {t(
                      "settings.privacy.dataRetention.clientProcessing.consentTracking.title"
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t(
                      "settings.privacy.dataRetention.clientProcessing.consentTracking.description"
                    )}
                  </p>
                </div>
                <Toggle
                  enabled={privacy.clientConsentTrackingEnabled}
                  onChange={() =>
                    onPrivacyChange({
                      ...privacy,
                      clientConsentTrackingEnabled:
                        !privacy.clientConsentTrackingEnabled,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {t(
                      "settings.privacy.dataRetention.clientProcessing.deletionRequests.title"
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t(
                      "settings.privacy.dataRetention.clientProcessing.deletionRequests.description"
                    )}
                  </p>
                </div>
                <Toggle
                  enabled={privacy.clientDeletionRequestsEnabled}
                  onChange={() =>
                    onPrivacyChange({
                      ...privacy,
                      clientDeletionRequestsEnabled:
                        !privacy.clientDeletionRequestsEnabled,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button
              className={buttonStyles("primary")}
              onClick={handleRetentionSave}
              disabled={updatePrivacyMutation.isPending}
            >
              <Check className="h-4 w-4" />
              {updatePrivacyMutation.isPending
                ? "Saving..."
                : t("settings.privacy.dataRetention.saveButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Documents */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.legalDocuments.title")}
          </h3>
          <div className="mt-6 space-y-4">
            {[
              {
                name: t(
                  "settings.privacy.legalDocuments.documents.privacyPolicy.name"
                ),
                date: t(
                  "settings.privacy.legalDocuments.documents.privacyPolicy.date"
                ),
                action: "view",
              },
              {
                name: t(
                  "settings.privacy.legalDocuments.documents.termsOfService.name"
                ),
                date: t(
                  "settings.privacy.legalDocuments.documents.termsOfService.date"
                ),
                action: "view",
              },
              {
                name: t("settings.privacy.legalDocuments.documents.dpa.name"),
                desc: t("settings.privacy.legalDocuments.documents.dpa.desc"),
                action: "download",
              },
              {
                name: t(
                  "settings.privacy.legalDocuments.documents.impressum.name"
                ),
                desc: t(
                  "settings.privacy.legalDocuments.documents.impressum.desc"
                ),
                action: "view",
              },
              {
                name: t(
                  "settings.privacy.legalDocuments.documents.cookiePolicy.name"
                ),
                desc: t(
                  "settings.privacy.legalDocuments.documents.cookiePolicy.desc"
                ),
                action: "view",
              },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{doc.name}</p>
                    <p className="text-sm text-slate-500">
                      {doc.date ? `Last updated: ${doc.date}` : doc.desc}
                    </p>
                  </div>
                </div>
                {doc.action === "view" ? (
                  <Eye className="h-5 w-5 cursor-pointer text-slate-400 hover:text-slate-600" />
                ) : (
                  <Download className="h-5 w-5 cursor-pointer text-slate-400 hover:text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Protection Officer */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.dpo.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.privacy.dpo.description")}
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {t("settings.privacy.dpo.nameLabel")}
              </p>
              <p className="mt-1.5 text-sm text-slate-900">
                Olumuyiwa Osiname
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {t("settings.privacy.dpo.emailLabel")}
              </p>
              <p className="mt-1.5 text-sm text-slate-900">
                olu@solobooks.de
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700">
                {t("settings.privacy.dpo.addressLabel")}
              </p>
              <p className="mt-1.5 text-sm text-slate-900">
                Dorfstr 36D, 13057 Berlin, Germany
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Breach Notification */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.breachNotification.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.privacy.breachNotification.description")}
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.breachNotification.email.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("settings.privacy.breachNotification.email.description")}
                </p>
              </div>
              <Toggle
                enabled={privacy.emailBreach}
                onChange={() =>
                  onPrivacyChange({
                    ...privacy,
                    emailBreach: !privacy.emailBreach,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {t("settings.privacy.breachNotification.sms.title")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("settings.privacy.breachNotification.sms.description")}
                </p>
              </div>
              <Toggle
                enabled={privacy.smsBreach}
                onChange={() =>
                  onPrivacyChange({ ...privacy, smsBreach: !privacy.smsBreach })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("settings.privacy.breachNotification.emergencyContact")}
              </label>
              <input
                type="email"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="emergency@yourcompany.com"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {t("settings.privacy.breachNotification.emergencyNote")}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              {t("settings.privacy.breachNotification.saveButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Audit Log */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("settings.privacy.auditLog.title")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t("settings.privacy.auditLog.description")}
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {t("settings.privacy.auditLog.lastExport")}
              </span>
              <span className="text-sm font-medium text-slate-900">
                December 15, 2025
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {t("settings.privacy.auditLog.lastConsent")}
              </span>
              <span className="text-sm font-medium text-slate-900">
                January 1, 2026
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {t("settings.privacy.auditLog.policyAcceptance")}
              </span>
              <span className="text-sm font-medium text-slate-900">
                November 10, 2025
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button className={buttonStyles("secondary")}>
              <Download className="h-4 w-4" />
              {t("settings.privacy.auditLog.downloadButton")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
