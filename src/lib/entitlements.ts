/**
 * Entitlement utilities for checking user permissions, limits, and features
 *
 * This module provides functions to check if users are entitled to specific features
 * and whether they've reached usage limits.
 */

import type { AuthUser } from "@/contexts/AuthContext";

export type FeatureKey =
  | "bankSync"
  | "transactionImport"
  | "exportSteuerberater"
  | "exportVatCsv"
  | "vatReminders"
  | "prioritySupport"
  | "vatSubmission";

export type LimitKey = "invoice" | "transaction" | "client";

/**
 * Check if user is entitled to a specific feature
 */
export function isFeatureAvailable(
  user: AuthUser | null,
  feature: FeatureKey
): boolean {
  if (!user?.permissions?.features) return false;
  return user.permissions.features[feature]?.available ?? false;
}

/**
 * Get upgrade message for a locked feature
 */
export function getFeatureUpgradeMessage(
  user: AuthUser | null,
  feature: FeatureKey
): string | null {
  if (!user?.permissions?.features) return null;
  const featureInfo = user.permissions.features[feature];
  if (!featureInfo) return null;

  return featureInfo.available ? null : featureInfo.upgradeMessage;
}

/**
 * Check if user has reached a usage limit
 */
export function hasReachedLimit(
  user: AuthUser | null,
  limit: LimitKey
): boolean {
  if (!user?.permissions?.limits) return true; // Assume limited if no data

  const limitInfo = user.permissions.limits[limit];
  if (!limitInfo.available) return true;

  // If max is 0, it means unlimited
  if (limitInfo.max === 0) return false;

  return limitInfo.current >= limitInfo.max;
}

/**
 * Get remaining usage for a limit
 */
export function getRemainingUsage(
  user: AuthUser | null,
  limit: LimitKey
): number {
  if (!user?.permissions?.limits) return 0;

  const limitInfo = user.permissions.limits[limit];
  if (!limitInfo.available || limitInfo.max === 0) return Infinity;

  return Math.max(0, limitInfo.max - limitInfo.current);
}

/**
 * Check if user can perform an action (feature + limit check)
 */
export function canPerformAction(
  user: AuthUser | null,
  feature: FeatureKey,
  limit?: LimitKey
): boolean {
  if (!isFeatureAvailable(user, feature)) return false;
  if (limit && hasReachedLimit(user, limit)) return false;
  return true;
}

// Convenience functions for specific features
export const entitledToTransactionImportFeature = (
  user: AuthUser | null
): boolean => isFeatureAvailable(user, "transactionImport");

export const entitledToBankSync = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "bankSync");

export const entitledToVatSubmission = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "vatSubmission");

export const entitledToVatReminders = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "vatReminders");

export const entitledToPrioritySupport = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "prioritySupport");

export const entitledToExportSteuerberater = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "exportSteuerberater");

export const entitledToExportVatCsv = (user: AuthUser | null): boolean =>
  isFeatureAvailable(user, "exportVatCsv");

// Convenience functions for limits
export const canCreateInvoice = (user: AuthUser | null): boolean =>
  !hasReachedLimit(user, "invoice");

export const canCreateTransaction = (user: AuthUser | null): boolean =>
  !hasReachedLimit(user, "transaction");

export const canCreateClient = (user: AuthUser | null): boolean =>
  !hasReachedLimit(user, "client");

// Get usage information for limits
export const getInvoiceUsage = (user: AuthUser | null) => ({
  current: user?.permissions?.limits?.invoice?.current ?? 0,
  max: user?.permissions?.limits?.invoice?.max ?? 0,
  remaining: getRemainingUsage(user, "invoice"),
  available: user?.permissions?.limits?.invoice?.available ?? false,
});

export const getTransactionUsage = (user: AuthUser | null) => ({
  current: user?.permissions?.limits?.transaction?.current ?? 0,
  max: user?.permissions?.limits?.transaction?.max ?? 0,
  remaining: getRemainingUsage(user, "transaction"),
  available: user?.permissions?.limits?.transaction?.available ?? false,
});

export const getClientUsage = (user: AuthUser | null) => ({
  current: user?.permissions?.limits?.client?.current ?? 0,
  max: user?.permissions?.limits?.client?.max ?? 0,
  remaining: getRemainingUsage(user, "client"),
  available: user?.permissions?.limits?.client?.available ?? false,
});
