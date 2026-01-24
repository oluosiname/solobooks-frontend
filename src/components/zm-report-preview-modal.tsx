"use client";

import { X } from "lucide-react";
import { Button } from "@/components/atoms";
import { Card } from "@/components/atoms";
import type { ZmdoReportPreview } from "@/types";
import { useTranslations } from "next-intl";

interface MetricTileProps {
  label: string;
  value: number;
  hint?: string; // e.g. "count" / "amount"
  format?: "currency" | "number";
}

function MetricTile({
  label,
  value,
  hint,
  format = "currency",
}: MetricTileProps) {
  const formatted =
    format === "currency"
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(value)
      : new Intl.NumberFormat("de-DE").format(value);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {formatted}
      </div>
    </div>
  );
}

interface ZmdoReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: ZmdoReportPreview | null;
  isLoading: boolean;
}

export function ZmdoReportPreviewModal({
  open,
  onOpenChange,
  previewData,
  isLoading,
}: ZmdoReportPreviewModalProps) {
  const t = useTranslations("taxes.zmdo");

  if (!open) return null;

  if (isLoading || !previewData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white max-h-[90vh]">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { report, transactionData, totalAmount } = previewData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t("previewTitle")}
              </h2>
              <p className="text-sm text-gray-600">
                {report.periodLabel}
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              aria-label="Close preview"
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6 p-6">
            <Card>
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("overallSummary")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t("overallSummaryHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricTile
                    label="Anzahl der Transaktionen"
                    value={transactionData.totalTransactions}
                    hint="Anzahl"
                    format="number"
                  />
                  <MetricTile
                    label="Gesamtbetrag"
                    value={totalAmount ?? transactionData.totalAmount}
                    hint="Betrag"
                    format="currency"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("amountSplit")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t("amountSplitHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricTile
                    label="Betrag Deutschland"
                    value={transactionData.germanyAmount}
                    hint="Betrag"
                    format="currency"
                  />
                  <MetricTile
                    label="Betrag EU"
                    value={transactionData.euAmount}
                    hint="Betrag"
                    format="currency"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("vatBreakdown")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t("vatBreakdownHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricTile
                    label="Mit USt-IdNr. (Anzahl)"
                    value={transactionData.withVatNumberCount}
                    hint="Anzahl"
                    format="number"
                  />
                  <MetricTile
                    label="Mit USt-IdNr. (Betrag)"
                    value={transactionData.withVatNumberAmount}
                    hint="Betrag"
                    format="currency"
                  />
                  <MetricTile
                    label="Ohne USt-IdNr. (Anzahl)"
                    value={transactionData.withoutVatNumberCount}
                    hint="Anzahl"
                    format="number"
                  />
                  <MetricTile
                    label="Ohne USt-IdNr. (Betrag)"
                    value={transactionData.withoutVatNumberAmount}
                    hint="Betrag"
                    format="currency"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
