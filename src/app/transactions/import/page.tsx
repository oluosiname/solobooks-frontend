"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  Check,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { TransactionImportUpgradeBanner } from "@/components/entitlements";
import { entitledToTransactionImportFeature } from "@/lib/entitlements";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { styles } from "@/lib/styles";

export default function ImportTransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations();

  const handleUpgrade = () => {
    router.push("/subscription");
  };

  return (
    <AppShell title={t("transactions.import.title")}>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/transactions")}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("transactions.import.backToTransactions")}
        </button>
      </div>

      <TransactionImportUpgradeBanner />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <div className={cn(styles.card)}>
          <div className={styles.cardContent}>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transactions.import.uploadFile")}
            </h3>
            <div className="mt-6">
              <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-16 hover:border-slate-400">
                <Upload className="h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm text-slate-600">
                  {t("transactions.import.uploadDescription")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("transactions.import.supportedFormats")}
                </p>

                {/* Locked overlay */}
                {!entitledToTransactionImportFeature(user) && (
                  <div className="absolute inset-0 rounded-lg bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="max-w-xs text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Lock className="h-5 w-5 text-gray-700" />
                      </div>
                      <p className="font-medium text-gray-900">
                        {t("transactions.import.upgradeOverlay.title")}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {t("transactions.import.upgradeOverlay.description")}
                      </p>
                      <Button
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={handleUpgrade}
                      >
                        {t("transactions.import.upgradeOverlay.button")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {entitledToTransactionImportFeature(user) && (
                <Button
                  className="mt-6 w-full justify-center"
                  variant="primary"
                >
                  <Check className="h-4 w-4" />
                  {t("transactions.import.importButton")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Download Templates Section */}
        <div className={cn(styles.card)}>
          <div className={styles.cardContent}>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transactions.import.downloadTemplates")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("transactions.import.templatesDescription")}
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {t("transactions.import.csvTemplate")}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t("transactions.import.csvDescription")}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Download className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {t("transactions.import.excelTemplate")}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t("transactions.import.excelDescription")}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-2 hover:bg-slate-100">
                  <Download className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className={cn(styles.card, "mt-6")}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("transactions.import.howItWorks")}
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {t("transactions.import.step1Title")}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {t("transactions.import.step1Description")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {t("transactions.import.step2Title")}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {t("transactions.import.step2Description")}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {t("transactions.import.step3Title")}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {t("transactions.import.step3Description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Format */}
      <div className={cn(styles.card, "mt-6")}>
        <div className={styles.cardContent}>
          <h3 className="text-lg font-semibold text-slate-900">
            {t("transactions.import.fileFormat")}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {t("transactions.import.fileFormatDescription")}
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t("transactions.import.columns.column")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t("transactions.import.columns.format")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t("transactions.import.columns.description")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    date
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    YYYY-MM-DD
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t("transactions.import.columnDescriptions.date")}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    description
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    Text
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t("transactions.import.columnDescriptions.description")}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    amount
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    -0.00
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t("transactions.import.columnDescriptions.amount")}
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    vat_rate
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    0, 7, 19
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t("transactions.import.columnDescriptions.vatRate")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
