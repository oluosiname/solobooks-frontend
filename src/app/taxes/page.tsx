"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FileText, Eye, TestTube, Send, FileCode } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card, Badge } from "@/components/atoms";
import { Tabs } from "@/components/molecules";
import { api } from "@/services/api";
import { formatCurrency, cn } from "@/lib/utils";

export default function TaxesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "submitted", label: "Submitted" },
  ];

  const { data: vatReports, isLoading } = useQuery({
    queryKey: ["vat-reports", activeTab],
    queryFn: async () => {
      const reports = await api.fetchVatReports();
      if (activeTab === "submitted") {
        return reports.filter(
          (r) => r.status === "submitted" || r.status === "accepted"
        );
      }
      return reports.filter(
        (r) => r.status === "draft" || r.status === "rejected"
      );
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
                        {report.period}
                      </h4>
                      <Badge variant={getStatusVariant(report.status)}>
                        {t(`taxes.status.${report.status}`)}
                      </Badge>
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
                    <div className="mt-2 flex gap-4 text-sm text-slate-600">
                      <span>
                        Net Revenue: {formatCurrency(report.netRevenue)}
                      </span>
                      <span>VAT Due: {formatCurrency(report.vatDue)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Button variant="secondary">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>

                      {report.status === "draft" && (
                        <>
                          <Button variant="secondary">
                            <TestTube className="h-4 w-4" />
                            Test
                          </Button>
                          <Button variant="primary">
                            <Send className="h-4 w-4" />
                            {t("taxes.submitToElster")}
                          </Button>
                        </>
                      )}

                      {(report.status === "rejected" ||
                        report.status === "submitted" ||
                        report.status === "accepted") && (
                        <Button variant="secondary">
                          <FileCode className="h-4 w-4" />
                          XML
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
