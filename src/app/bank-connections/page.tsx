"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card } from "@/components/atoms";
import { AlertBanner } from "@/components/organisms";
import { api } from "@/services/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";

export default function BankConnectionsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const {
    data: bankConnections,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bank-connections"],
    queryFn: api.fetchBankConnections,
  });

  const handleSync = async (bankId: number) => {
    setSyncingId(bankId);
    try {
      await api.syncBankConnection(bankId);
      await refetch();
      showToast.success(t("bankConnections.syncSuccess"));
    } catch (error: unknown) {
      console.error("Failed to sync bank connection:", error);
      showToast.error(t("bankConnections.syncError"));
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleSync = async (bankId: number) => {
    setTogglingId(bankId);
    try {
      await api.toggleBankConnection(bankId);
      await refetch();
      showToast.success(t("bankConnections.toggleSuccess"));
    } catch (error: unknown) {
      console.error("Failed to toggle bank connection:", error);
      showToast.error(t("bankConnections.toggleError"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddConnection = () => {
    router.push("/bank-connections/connect");
  };

  return (
    <AppShell title={t("bankConnections.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t("bankConnections.title")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("bankConnections.subtitle")}
            </p>
          </div>
          <Button variant="primary" onClick={handleAddConnection}>
            <Plus className="h-4 w-4" />
            {t("bankConnections.addConnection")}
          </Button>
        </div>

        {/* Info Banner */}
        <AlertBanner
          variant="info"
          message={t("bankConnections.autoSyncBanner")}
        />

        {/* Bank Connections List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">{t("common.loading")}</p>
          </div>
        ) : bankConnections?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <span className="text-3xl">🏦</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("bankConnections.noConnections")}
            </h3>
            <p className="mt-2 text-slate-500">
              {t("bankConnections.noConnectionsDescription")}
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={handleAddConnection}
            >
              <Plus className="h-4 w-4" />
              {t("bankConnections.addConnection")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bankConnections?.map((bank, index) => (
              <Card
                key={bank.id}
                className="p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Bank Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                      🏦
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {bank.bankName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {bank.accountNumber}
                      </p>
                    </div>
                  </div>

                  {/* Pending Transactions */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {bank.pendingTransactionsCount}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t("bankConnections.pendingTransactions")}
                    </p>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-slate-400" />
                    <span>
                      {t("bankConnections.lastSync", {
                        time: formatRelativeTime(bank.lastSynced),
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">
                      {t("bankConnections.connected")}
                    </span>
                  </div>
                </div>

                {/* Sync Toggle */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {bank.syncEnabled ? (
                      <ToggleRight className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-600">
                      {bank.syncEnabled
                        ? t("bankConnections.syncEnabled")
                        : t("bankConnections.syncDisabled")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSync(bank.id)}
                    isLoading={togglingId === bank.id}
                    className="text-xs"
                  >
                    {bank.syncEnabled
                      ? t("bankConnections.pauseSync")
                      : t("bankConnections.resumeSync")}
                  </Button>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleSync(bank.id)}
                    isLoading={syncingId === bank.id}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        syncingId === bank.id && "animate-spin"
                      )}
                    />
                    {t("bankConnections.syncNow")}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* About Section */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900">
            {t("bankConnections.about.title")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• {t("bankConnections.about.security")}</li>
            <li>• {t("bankConnections.about.syncFrequency")}</li>
            <li>• {t("bankConnections.about.pauseSync")}</li>
            <li>• {t("bankConnections.about.reviewTransactions")}</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
