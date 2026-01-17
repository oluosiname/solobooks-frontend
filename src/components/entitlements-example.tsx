/**
 * Example component demonstrating how to use the entitlement system
 * This is for demonstration purposes and can be removed later
 */

import { useAuth } from "@/contexts/AuthContext";
import {
  entitledToTransactionImportFeature,
  getFeatureUpgradeMessage,
  canCreateTransaction,
  getTransactionUsage,
  entitledToBankSync,
  entitledToVatSubmission,
} from "@/lib/entitlements";

export function EntitlementsExample() {
  const { user } = useAuth();

  if (!user) return <div>Please log in to see entitlements</div>;

  const canImportTransactions = entitledToTransactionImportFeature(user);
  const importUpgradeMessage = getFeatureUpgradeMessage(
    user,
    "transactionImport"
  );
  const canCreateTx = canCreateTransaction(user);
  const transactionUsage = getTransactionUsage(user);
  const canSyncBank = entitledToBankSync(user);
  const canSubmitVat = entitledToVatSubmission(user);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Entitlements Demo</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Plan: {user.plan}</h3>
          <p className="text-sm text-gray-600">
            Trial: {user.onTrial ? "Yes" : "No"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h4 className="font-medium">Transaction Import</h4>
            <p
              className={`text-sm ${
                canImportTransactions ? "text-green-600" : "text-red-600"
              }`}
            >
              {canImportTransactions ? "Available" : "Not Available"}
            </p>
            {importUpgradeMessage && (
              <p className="text-xs text-gray-500 mt-1">
                {importUpgradeMessage}
              </p>
            )}
          </div>

          <div className="border rounded p-3">
            <h4 className="font-medium">Transaction Creation</h4>
            <p
              className={`text-sm ${
                canCreateTx ? "text-green-600" : "text-red-600"
              }`}
            >
              {canCreateTx ? "Available" : "Limit Reached"}
            </p>
            <p className="text-xs text-gray-500">
              Used: {transactionUsage.current} /{" "}
              {transactionUsage.max === 0 ? "∞" : transactionUsage.max}
            </p>
          </div>

          <div className="border rounded p-3">
            <h4 className="font-medium">Bank Sync</h4>
            <p
              className={`text-sm ${
                canSyncBank ? "text-green-600" : "text-red-600"
              }`}
            >
              {canSyncBank ? "Available" : "Not Available"}
            </p>
          </div>

          <div className="border rounded p-3">
            <h4 className="font-medium">VAT Submission</h4>
            <p
              className={`text-sm ${
                canSubmitVat ? "text-green-600" : "text-red-600"
              }`}
            >
              {canSubmitVat ? "Available" : "Not Available"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Raw Permissions Data:</h4>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(user.permissions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
