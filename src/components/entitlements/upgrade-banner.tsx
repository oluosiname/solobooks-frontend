import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  isFeatureAvailable,
  getFeatureUpgradeMessage,
  type FeatureKey,
} from "@/lib/entitlements";

interface UpgradeBannerProps {
  feature: FeatureKey;
  title?: string;
  description?: string;
  className?: string;
  showAlways?: boolean; // If true, shows even when entitled (for testing)
}

export function UpgradeBanner({
  feature,
  title,
  description,
  className = "",
  showAlways = false,
}: UpgradeBannerProps) {
  const { user } = useAuth();
  const router = useRouter();

  const isEntitled = isFeatureAvailable(user, feature);
  const upgradeMessage = getFeatureUpgradeMessage(user, feature);

  // Don't show banner if user is entitled (unless showAlways is true)
  if (isEntitled && !showAlways) {
    return null;
  }

  const handleUpgrade = () => {
    router.push("/subscription");
  };

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <Lock className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {title ||
              upgradeMessage ||
              `${feature.replace("_", " ")} is available on Pro`}
          </p>
          <p className="text-sm text-gray-600">
            {description || "Upgrade to unlock this premium feature."}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <button
          onClick={handleUpgrade}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}

// Specific component for transaction import (matches your example exactly)
export function TransactionImportUpgradeBanner() {
  return (
    <UpgradeBanner
      feature="transactionImport"
      title="Import is available on Pro"
      description="Upgrade to import CSV/XLS/XLSX files and automatically add transactions."
    />
  );
}

// Specific component for bank sync
export function BankSyncUpgradeBanner() {
  return (
    <UpgradeBanner
      feature="bankSync"
      title="Bank sync is available on Pro"
      description="Upgrade to automatically sync transactions from your bank accounts."
    />
  );
}

// Specific component for VAT submission
export function VatSubmissionUpgradeBanner() {
  return (
    <UpgradeBanner
      feature="vatSubmission"
      title="VAT submission is available on Pro"
      description="Upgrade to submit your VAT reports directly to tax authorities."
    />
  );
}
