"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  FileText,
  Eye,
  TestTube,
  Send,
  FileCode,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card, Badge } from "@/components/atoms";
import { Tabs } from "@/components/molecules";
import { VatReportPreviewModal } from "@/components/vat-report-preview-modal";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { VatReportPreview } from "@/types";

export default function TaxesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "submitted", label: "Submitted" },
  ];

  const {
    data: vatReportsData,
    isLoading,
    error: vatReportsError,
  } = useQuery({
    queryKey: ["vat-reports"],
    queryFn: api.fetchVatReports,
    retry: false,
  });

  const vatReports = vatReportsData
    ? activeTab === "submitted"
      ? vatReportsData.submitted
      : vatReportsData.upcoming
    : [];

  const queryClient = useQueryClient();

  const submitVatReportMutation = useMutation({
    mutationFn: (reportId: number) => api.submitVatReport(reportId.toString()),
    onSuccess: (data) => {
      showToast.success(data.message);
      // Open PDF if provided
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
      // Switch to submitted tab
      setActiveTab("submitted");
      // Refresh the VAT reports data
      queryClient.invalidateQueries({ queryKey: ["vat-reports"] });
    },
    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: { data?: { error?: { message?: string } } };
            message?: string;
          }
        )?.response?.data?.error?.message ||
        (error as Error)?.message ||
        "Failed to submit VAT report";
      showToast.error(message);
    },
  });

  const testSubmitVatReportMutation = useMutation({
    mutationFn: (reportId: number) =>
      api.testSubmitVatReport(reportId.toString()),
    onSuccess: (data) => {
      showToast.success(data.message);
      // Handle PDF data for test submission
      if (data.pdfData) {
        // pdfData is base64 encoded PDF content, create data URL
        const pdfDataUrl = `data:application/pdf;base64,${data.pdfData}`;
        window.open(pdfDataUrl, "_blank");
      }
    },
    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: { data?: { error?: { message?: string } } };
            message?: string;
          }
        )?.response?.data?.error?.message ||
        (error as Error)?.message ||
        "Failed to test submit VAT report";
      showToast.error(message);
    },
  });

  const previewVatReportMutation = useMutation({
    mutationFn: (reportId: number) => api.previewVatReport(reportId.toString()),
    onSuccess: (_data: VatReportPreview) => {
      setPreviewModalOpen(true);
    },
    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: { data?: { error?: { message?: string } } };
            message?: string;
          }
        )?.response?.data?.error?.message ||
        (error as Error)?.message ||
        "Failed to load VAT report preview";
      showToast.error(message);
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "draft";
      case "submitted":
        return "info";
      case "accepted":
        return "success";
      case "rejected":
        return "danger";
      case "error":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <AppShell title={t("taxes.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Tax Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage and submit your tax reports
          </p>
        </div>

        {/* VAT Section */}
        <Card>
          {/* VAT Header */}
          <div className="flex items-center gap-4 border-b border-slate-200 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("taxes.vatReports")}
              </h3>
              <p className="text-sm text-slate-500">
                Advance VAT declarations and submissions
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 py-3">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* VAT Reports List */}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">{t("common.loading")}</p>
              </div>
            ) : vatReportsError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-orange-600">
                    VAT reports not available
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    This feature will be implemented in a future update
                  </p>
                </div>
              </div>
            ) : vatReports?.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">No VAT reports found</p>
              </div>
            ) : (
              vatReports?.map((report, index) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {report.periodLabel}
                      </h4>
                      <Badge variant={getStatusVariant(report.status)}>
                        {t(`taxes.status.${report.status}`)}
                      </Badge>
                      {report.overdue && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                      {report.dueSoon && (
                        <Badge variant="warning">Due Soon</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(report.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(report.endDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Due:{" "}
                      {new Date(report.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    {report.errorMessage && (
                      <p className="mt-1 text-sm text-red-600">
                        Error: {report.errorMessage}
                      </p>
                    )}
                    <div className="mt-2 flex gap-4 text-sm text-slate-600">
                      <span>Year: {report.year}</span>
                      <span>Elster Period: {report.elsterPeriod}</span>
                      {report.xmlAttached && (
                        <span className="text-green-600">XML Attached</span>
                      )}
                      {report.pdfAttached && (
                        <span className="text-green-600">PDF Attached</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {activeTab !== "submitted" && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            previewVatReportMutation.mutate(report.id)
                          }
                          disabled={previewVatReportMutation.isPending}
                        >
                          {previewVatReportMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Preview
                            </>
                          )}
                        </Button>
                      )}

                      {report.canSubmit && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              testSubmitVatReportMutation.mutate(report.id)
                            }
                            disabled={testSubmitVatReportMutation.isPending}
                          >
                            {testSubmitVatReportMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <TestTube className="h-4 w-4" />
                                Test
                              </>
                            )}
                          </Button>

                          <Button
                            variant="primary"
                            onClick={() =>
                              submitVatReportMutation.mutate(report.id)
                            }
                            disabled={submitVatReportMutation.isPending}
                          >
                            {submitVatReportMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                {t("taxes.submitToElster")}
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {(report.status === "rejected" ||
                        report.status === "submitted" ||
                        report.status === "accepted") && (
                        <>
                          {report.pdfUrl && (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                window.open(report.pdfUrl!, "_blank")
                              }
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          )}
                          {activeTab !== "submitted" && (
                            <Button variant="secondary">
                              <FileCode className="h-4 w-4" />
                              XML
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      <VatReportPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        previewData={previewVatReportMutation.data || null}
        isLoading={previewVatReportMutation.isPending}
      />
    </AppShell>
  );
}
