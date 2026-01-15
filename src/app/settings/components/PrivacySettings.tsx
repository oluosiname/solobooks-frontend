import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Download, Eye, Edit, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles, buttonStyles } from "@/lib/styles";
import { Toggle } from "@/components/atoms";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { SettingsData } from "@/lib/settings-api";

interface PrivacySettingsProps {
  privacy: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    clientConsent: boolean;
    clientDeletion: boolean;
    emailBreach: boolean;
    smsBreach: boolean;
  };
  onPrivacyChange: (privacy: any) => void;
  unifiedSettings?: SettingsData;
}

export function PrivacySettings({
  privacy,
  onPrivacyChange,
  unifiedSettings,
}: PrivacySettingsProps) {
  const queryClient = useQueryClient();

  const updatePrivacyMutation = useMutation({
    mutationFn: (data: Partial<SettingsData>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedSettings"] });
      showToast.success("Privacy preferences saved successfully");
    },
    onError: (error: any) => {
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
          data_retention_years: unifiedSettings.privacy_preferences?.data_retention_years ?? 10,
          data_processing_location: unifiedSettings.privacy_preferences?.data_processing_location ?? "eu_only",
          client_consent_tracking_enabled: privacy.clientConsent,
          client_deletion_requests_enabled: privacy.clientDeletion,
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
            GDPR/DSGVO Compliance Status
          </p>
          <p className="text-sm text-emerald-700">
            Your account is configured to meet GDPR and DSGVO requirements
          </p>
        </div>
      </div>

      {/* Consent Management */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Consent Management
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Manage your consent for data processing activities
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Essential Data Processing
                </p>
                <p className="text-sm text-slate-500">
                  Required to provide core accounting services
                </p>
              </div>
              <Toggle enabled={privacy.essential} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Analytics & Performance
                </p>
                <p className="text-sm text-slate-500">
                  Help us improve the application with usage data
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
                  Marketing Communications
                </p>
                <p className="text-sm text-slate-500">
                  Receive product updates and feature announcements
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
                  Third-Party Integrations
                </p>
                <p className="text-sm text-slate-500">
                  Allow data sharing with approved third-party services
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
              {updatePrivacyMutation.isPending ? "Saving..." : "Save Consent Preferences"}
            </button>
          </div>
        </div>
      </div>

      {/* Your Data Rights */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Your Data Rights (GDPR/DSGVO)
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Exercise your rights under the General Data Protection Regulation
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    Right to Data Portability
                  </p>
                  <p className="text-sm text-slate-500">
                    Download all your data in a machine-readable format
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>
                Request Export
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">Right to Access</p>
                  <p className="text-sm text-slate-500">
                    View all personal data we have stored about you
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>View Data</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    Right to Rectification
                  </p>
                  <p className="text-sm text-slate-500">
                    Correct any inaccurate personal information
                  </p>
                </div>
              </div>
              <button className={buttonStyles("secondary")}>Update Info</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    Right to Erasure (&quot;Right to be Forgotten&quot;)
                  </p>
                  <p className="text-sm text-slate-500">
                    Request permanent deletion of all your personal data
                  </p>
                </div>
              </div>
              <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                Request Deletion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention & Processing */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Data Retention & Processing
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Data Retention Period
              </label>
              <select className={cn(styles.input, "mt-1.5")}>
                <option>10 years (recommended for tax)</option>
                <option>7 years</option>
                <option>5 years</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                Note: German tax law requires 10 years retention for accounting
                records
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Data Processing Location
              </label>
              <select className={cn(styles.input, "mt-1.5")}>
                <option>European Union Only</option>
                <option>Global (GDPR compliant)</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                Your data will only be processed in these locations
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <h4 className="font-semibold text-slate-900">
              Client Data Processing
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              As you process client data in this application, you act as a data
              controller under GDPR
            </p>
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    Automatic Client Consent Tracking
                  </p>
                  <p className="text-sm text-slate-500">
                    Track GDPR consent for client data processing
                  </p>
                </div>
                <Toggle
                  enabled={privacy.clientConsent}
                  onChange={() =>
                    onPrivacyChange({
                      ...privacy,
                      clientConsent: !privacy.clientConsent,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    Client Data Deletion Requests
                  </p>
                  <p className="text-sm text-slate-500">
                    Enable clients to request data deletion
                  </p>
                </div>
                <Toggle
                  enabled={privacy.clientDeletion}
                  onChange={() =>
                    onPrivacyChange({
                      ...privacy,
                      clientDeletion: !privacy.clientDeletion,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              Save Retention Settings
            </button>
          </div>
        </div>
      </div>

      {/* Legal Documents */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Legal Documents & Compliance
          </h3>
          <div className="mt-6 space-y-4">
            {[
              {
                name: "Privacy Policy",
                date: "January 1, 2026",
                action: "view",
              },
              {
                name: "Terms of Service",
                date: "January 1, 2026",
                action: "view",
              },
              {
                name: "Data Processing Agreement (DPA)",
                desc: "GDPR Article 28 compliant",
                action: "download",
              },
              {
                name: "Impressum (German Legal Notice)",
                desc: "Required for German businesses",
                action: "view",
              },
              {
                name: "Cookie Policy",
                desc: "GDPR compliant cookie usage",
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
            Data Protection Officer (DPO)
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Contact information for data protection inquiries
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                DPO Name
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="Dr. Maria Schmidt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                DPO Email
              </label>
              <input
                type="email"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="dpo@solobooks.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                DPO Address
              </label>
              <input
                type="text"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="123 Data Protection Street, Berlin, Germany"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              Save DPO Information
            </button>
          </div>
        </div>
      </div>

      {/* Data Breach Notification */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Data Breach Notification
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Configure how you want to be notified in case of a data breach (GDPR
            Article 33)
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email Notification</p>
                <p className="text-sm text-slate-500">
                  Receive immediate email alerts
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
                <p className="font-medium text-slate-900">SMS Notification</p>
                <p className="text-sm text-slate-500">
                  Receive SMS alerts for critical breaches
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
                Emergency Contact
              </label>
              <input
                type="email"
                className={cn(styles.input, "mt-1.5")}
                defaultValue="emergency@yourcompany.com"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Secondary contact for data breach notifications
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
            <button className={buttonStyles("primary")}>
              <Check className="h-4 w-4" />
              Save Notification Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Audit Log */}
      <div className={cn(styles.card)}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            Privacy Audit Log
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Track all privacy-related activities for GDPR compliance
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last data export:</span>
              <span className="text-sm font-medium text-slate-900">
                December 15, 2025
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Last consent update:
              </span>
              <span className="text-sm font-medium text-slate-900">
                January 1, 2026
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Privacy policy acceptance:
              </span>
              <span className="text-sm font-medium text-slate-900">
                November 10, 2025
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button className={buttonStyles("secondary")}>
              <Download className="h-4 w-4" />
              Download Full Audit Log
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
