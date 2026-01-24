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
  Globe,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card, Badge } from "@/components/atoms";
import { Tabs } from "@/components/molecules";
import { VatReportPreviewModal } from "@/components/vat-report-preview-modal";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import type { VatReportPreview, ZmdoReportPreview } from "@/types";
import { ZmdoReportPreviewModal } from "@/components/zm-report-preview-modal";

export default function TaxesPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  
  // VAT Reports state
  const [vatActiveTab, setVatActiveTab] = useState("upcoming");
  const [vatPreviewModalOpen, setVatPreviewModalOpen] = useState(false);

  
  // ZMDO Reports state
  const [zmdoActiveTab, setZmdoActiveTab] = useState("draft");
  const [zmdoPreviewModalOpen, setZmdoPreviewModalOpen] = useState(false);

  const vatTabs = [
    { id: "upcoming", label: t("taxes.tabs.upcoming") },
    { id: "submitted", label: t("taxes.tabs.submitted") },
  ];

  const zmdoTabs = [
    { id: "draft", label: t("taxes.tabs.draft") },
    { id: "submitted", label: t("taxes.tabs.submitted") },
  ];

  // VAT Reports Query
  const {
    data: vatReportsData,
    isLoading: vatLoading,
    error: vatReportsError,
  } = useQuery({
    queryKey: ["vat-reports"],
    queryFn: api.fetchVatReports,
    retry: false,
  });

  const vatReports = vatReportsData
    ? vatActiveTab === "submitted"
      ? vatReportsData.submitted
      : vatReportsData.upcoming
    : [];

  // ZMDO Reports Query
  const {
    data: zmdoReportsData,
    isLoading: zmdoLoading,
    error: zmdoReportsError,
  } = useQuery({
    queryKey: ["zmdo-reports"],
    queryFn: api.fetchZmdoReports,
    retry: false,
  });

  const zmdoReports = zmdoReportsData
    ? zmdoActiveTab === "submitted"
      ? zmdoReportsData.submitted
      : zmdoReportsData.draft
    : [];

  // VAT Report Mutations
  const submitVatReportMutation = useMutation({
    mutationFn: (reportId: string) => api.submitVatReport(reportId),
    onSuccess: (data) => {
      showToast.success(data.message);
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
      setVatActiveTab("submitted");
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
        t("taxes.errors.submitFailed");
      showToast.error(message);
    },
  });

  const testSubmitVatReportMutation = useMutation({
    mutationFn: (reportId: string) => api.testSubmitVatReport(reportId),
    onSuccess: (data) => {
      showToast.success(data.message);
      if (data.pdfData) {
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
        t("taxes.errors.testSubmitFailed");
      showToast.error(message);
    },
  });

  const previewVatReportMutation = useMutation({
    mutationFn: (reportId: string) => api.previewVatReport(reportId),
    onSuccess: (_data: VatReportPreview) => {
      setVatPreviewModalOpen(true);
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
        t("taxes.errors.previewFailed");
      showToast.error(message);
    },
  });

  // ZMDO Report Mutations
  const submitZmdoReportMutation = useMutation({
    mutationFn: (reportId: string) => api.submitZmdoReport(reportId),
    onSuccess: (data) => {
      showToast.success(data.message);
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
      setZmdoActiveTab("submitted");
      queryClient.invalidateQueries({ queryKey: ["zmdo-reports"] });
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
        t("taxes.errors.submitFailed");
      showToast.error(message);
    },
  });

  const testSubmitZmdoReportMutation = useMutation({
    mutationFn: (reportId: string) => api.testSubmitZmdoReport(reportId),
    onSuccess: (data) => {
      showToast.success(data.message);
      if (data.pdfData) {
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
        t("taxes.errors.testSubmitFailed");
      showToast.error(message);
    },
  });

  const previewZmdoReportMutation = useMutation({
    mutationFn: (reportId: string) => api.previewZmdoReport(reportId),
    onSuccess: (_data: ZmdoReportPreview) => {
      setZmdoPreviewModalOpen(true);
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
        t("taxes.errors.previewFailed");
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

  // Helper to calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper to check if report is overdue based on dates
  const isOverdue = (dueDate: string) => {
    return getDaysUntilDue(dueDate) < 0;
  };

  // Helper to check if report is due soon (within 7 days)
  const isDueSoon = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    return days >= 0 && days <= 7;
  };

  return (
    <AppShell title={t("taxes.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {t("taxes.management.title")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("taxes.management.description")}
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
                {t("taxes.vatReportsDescription")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 py-3">
            <Tabs tabs={vatTabs} activeTab={vatActiveTab} onChange={setVatActiveTab} />
          </div>

          {/* VAT Reports List */}
          <div className="divide-y divide-slate-100">
            {vatLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">{t("common.loading")}</p>
              </div>
            ) : vatReportsError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-orange-600">
                    {t("taxes.vatReportsNotAvailable")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("taxes.vatReportsFutureUpdate")}
                  </p>
                </div>
              </div>
            ) : vatReports?.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">{t("taxes.vatReportsNoReports")}</p>
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
                        <Badge variant="danger">{t("taxes.badge.overdue")}</Badge>
                      )}
                      {report.dueSoon && (
                        <Badge variant="warning">{t("taxes.badge.dueSoon")}</Badge>
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
                      {t("taxes.due")}:{" "}
                      {new Date(report.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    {report.errorMessage && (
                      <p className="mt-1 text-sm text-red-600">
                        {t("taxes.error")}: {report.errorMessage}
                      </p>
                    )}
                    <div className="mt-2 flex gap-4 text-sm text-slate-600">
                      <span>{t("taxes.year")}: {report.year}</span>
                      <span>{t("taxes.elsterPeriod")}: {report.elsterPeriod}</span>
                      {report.xmlAttached && (
                        <span className="text-green-600">{t("taxes.xmlAttached")}</span>
                      )}
                      {report.pdfAttached && (
                        <span className="text-green-600">{t("taxes.pdfAttached")}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {vatActiveTab !== "submitted" && (
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
                              {t("common.loading")}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              {t("taxes.actions.details")}
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
                                {t("taxes.actions.testing")}
                              </>
                            ) : (
                              <>
                                <TestTube className="h-4 w-4" />
                                {t("taxes.actions.testReport")}
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
                                {t("taxes.actions.submitting")}
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                {t("taxes.submitToFinanzamt")}
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
                          {vatActiveTab !== "submitted" && (
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

        {/* ZMDO Section (EC Sales List / Zusammenfassende Meldung) */}
        <Card>
          {/* ZMDO Header */}
          <div className="flex items-center gap-4 border-b border-slate-200 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
              <Globe className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("taxes.zmdo.title")}
              </h3>
              <p className="text-sm text-slate-500">
                {t("taxes.zmdo.description")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 py-3">
            <Tabs tabs={zmdoTabs} activeTab={zmdoActiveTab} onChange={setZmdoActiveTab} />
          </div>

          {/* ZMDO Reports List */}
          <div className="divide-y divide-slate-100">
            {zmdoLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">{t("common.loading")}</p>
              </div>
            ) : zmdoReportsError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-orange-600">
                    {t("taxes.zmdo.notAvailable")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("taxes.zmdo.futureUpdate")}
                  </p>
                </div>
              </div>
            ) : zmdoReports?.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">{t("taxes.zmdo.noReports")}</p>
              </div>
            ) : (
              zmdoReports?.map((report, index) => {
                const daysUntilDue = getDaysUntilDue(report.endDate);
                const reportOverdue = isOverdue(report.endDate);
                const reportDueSoon = isDueSoon(report.endDate);

                return (
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
                        {zmdoActiveTab === "draft" && reportOverdue && (
                          <Badge variant="danger">{t("taxes.badge.overdue")}</Badge>
                        )}
                        {zmdoActiveTab === "draft" && reportDueSoon && !reportOverdue && (
                          <Badge variant="warning">
                            {t("taxes.badge.dueInDays", { days: daysUntilDue })}
                          </Badge>
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
                      {report.errorMessage && (
                        <p className="mt-1 text-sm text-red-600">
                          {t("taxes.error")}: {report.errorMessage}
                        </p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm text-slate-600">
                        <span>{t("taxes.year")}: {report.year}</span>
                        <span>{t("taxes.quarter")}: Q{report.quarter}</span>
                        {report.pdfAttached && (
                          <span className="text-green-600">{t("taxes.pdfAttached")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {zmdoActiveTab !== "submitted" && (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              previewZmdoReportMutation.mutate(report.id)
                            }
                            disabled={previewZmdoReportMutation.isPending}
                          >
                            {previewZmdoReportMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                                {t("common.loading")}
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                {t("taxes.actions.details")}
                              </>
                            )}
                          </Button>
                        )}

                        {report.canSubmit && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                testSubmitZmdoReportMutation.mutate(report.id)
                              }
                              disabled={testSubmitZmdoReportMutation.isPending}
                            >
                              {testSubmitZmdoReportMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                                  {t("taxes.actions.testing")}
                                </>
                              ) : (
                                <>
                                  <TestTube className="h-4 w-4" />
                                  {t("taxes.actions.testReport")}
                                </>
                              )}
                            </Button>

                            <Button
                              variant="primary"
                              onClick={() =>
                                submitZmdoReportMutation.mutate(report.id)
                              }
                              disabled={submitZmdoReportMutation.isPending}
                            >
                              {submitZmdoReportMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  {t("taxes.actions.submitting")}
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  {t("taxes.submitToFinanzamt")}
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* VAT Preview Modal */}
      <VatReportPreviewModal
        open={vatPreviewModalOpen}
        onOpenChange={setVatPreviewModalOpen}
        previewData={previewVatReportMutation.data || null}
        isLoading={previewVatReportMutation.isPending}
      />
      {/* ZMDO Preview Modal */}
      <ZmdoReportPreviewModal
        open={zmdoPreviewModalOpen}
        onOpenChange={setZmdoPreviewModalOpen}
        previewData={previewZmdoReportMutation.data || null}
        isLoading={previewZmdoReportMutation.isPending}
      />
    </AppShell>
  );
}
