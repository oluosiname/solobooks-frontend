"use client";

import { X } from "lucide-react";
import { Button } from "@/components/atoms";
import { Card } from "@/components/atoms";
import type { VatReportPreview } from "@/types";

interface MetricTileProps {
  label: string;
  kz: string;
  value: number;
}

function MetricTile({ label, kz, value }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="mt-1 text-xs text-gray-500">KZ {kz}</div>
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(value)}
      </div>
    </div>
  );
}

interface VatReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: VatReportPreview | null;
  isLoading: boolean;
}

export function VatReportPreviewModal({
  open,
  onOpenChange,
  previewData,
  isLoading,
}: VatReportPreviewModalProps) {
  if (!open) return null;

  if (isLoading || !previewData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { report, financialData } = previewData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                Financial Summary Preview
              </h2>
              <p className="text-sm text-gray-600">{report.periodLabel}</p>
            </div>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              aria-label="Close preview"
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-6">
            <Card>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Domestic Transactions
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Domestic taxable amounts and VAT.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricTile
                    label="Net Amount"
                    kz="81"
                    value={financialData.domesticNet}
                  />
                  <MetricTile
                    label="VAT Amount"
                    kz="66"
                    value={financialData.domesticVat}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    EU B2B Transactions
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Reverse-charge and EU expense totals relevant for VAT
                    reporting.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricTile
                    label="B2B Net Amount"
                    kz="21"
                    value={financialData.euB2bNet}
                  />
                  <MetricTile
                    label="EU Expense Net"
                    kz="46"
                    value={financialData.euExpenseNet}
                  />
                  <MetricTile
                    label="EU Expense VAT"
                    kz="67"
                    value={financialData.euExpenseVat}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Non-EU Transactions
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Net totals for non-EU transactions.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricTile
                    label="Net Amount"
                    kz="45"
                    value={financialData.nonEuNet}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
