"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Download, TrendingUp, TrendingDown, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Input,
} from "@/components/atoms";
import { api, processPnlForRevenueChart, downloadPnlPdf } from "@/services/api";
import { formatCurrency, formatDateTime, getFileExtensionFromContentType, cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { buttonStyles } from "@/lib/styles";

export default function ReportsPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const plChartRef = useRef<HTMLDivElement>(null);
  const [plDimensions, setPlDimensions] = useState({ width: 0, height: 350 });

  useEffect(() => {
    setIsMounted(true);

    const updateDimensions = () => {
      if (plChartRef.current) {
        setPlDimensions({
          width: plChartRef.current.offsetWidth,
          height: 350,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.fetchDashboardStats,
  });

  const { data: pnlData, error: pnlError } = useQuery({
    queryKey: ["pnl-data", startDate, endDate],
    queryFn: () => api.fetchPnlData(startDate, endDate),
    retry: false,
  });

  // Process PNL data for different chart types
  const revenueData = pnlData ? processPnlForRevenueChart(pnlData) : null;

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) return;

    setIsDownloadingPdf(true);
    try {
      await downloadPnlPdf(startDate, endDate);
    } catch {
      showToast.error(t('reports.downloadError'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Fetch latest DATEV export
  const { data: latestDatevExport } = useQuery({
    queryKey: ["latestDataExport", "datev"],
    queryFn: () => api.getLatestDataExport("datev"),
  });

  // Create DATEV export mutation
  const createDatevExportMutation = useMutation({
    mutationFn: () => api.createDataExport("datev"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latestDataExport", "datev"] });
      showToast.success(t("reports.accountingExports.datev.requestSuccess"));
    },
    onError: (error: unknown) => {
      showToast.apiError(error, t("reports.accountingExports.datev.requestError"));
    },
  });

  // Download DATEV export mutation
  const downloadDatevMutation = useMutation({
    mutationFn: async (exportId: string) => {
      return api.downloadDataExport(exportId);
    },
    onSuccess: ({ blob, contentType }) => {
      // Determine file extension from content type
      const extension = getFileExtensionFromContentType(contentType);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `datev-export-${latestDatevExport?.uuid || "data"}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast.success(t("reports.accountingExports.datev.downloadSuccess"));
    },
    onError: (error: unknown) => {
      showToast.apiError(error, t("reports.accountingExports.datev.downloadError"));
    },
  });

  const handleDownloadDatev = () => {
    if (latestDatevExport?.uuid) {
      downloadDatevMutation.mutate(latestDatevExport.uuid);
    }
  };

  // Calculate summary stats from revenue data (only if available)
  const summaryStats = revenueData && !pnlError
    ? {
        totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
        totalExpenses: revenueData.reduce((sum, d) => sum + d.expenses, 0),
        netProfit: revenueData.reduce(
          (sum, d) => sum + (d.revenue - d.expenses),
          0
        ),
        profitMargin:
          revenueData.length > 0
            ? (
                (revenueData.reduce(
                  (sum, d) => sum + (d.revenue - d.expenses),
                  0
                ) /
                  revenueData.reduce((sum, d) => sum + d.revenue, 0)) *
                100
              ).toFixed(1)
            : 0,
      }
    : null;

  const statsArray = [
    {
      title: t("reports.revenue"),
      value: summaryStats?.totalRevenue || 0,
      change: dashboardStats?.incomeChangePercent || 0,
    },
    {
      title: t("reports.expenses"),
      value: summaryStats?.totalExpenses || 0,
      change: 5.2,
      isExpense: true,
    },
    {
      title: t("reports.profit"),
      value: summaryStats?.netProfit || 0,
      change: dashboardStats?.profitMargin || 0,
    },
    {
      title: t("reports.profitMargin"),
      value: summaryStats?.profitMargin || 0,
      change: 0,
      isPercentage: true,
    },
  ];


  return (
    <AppShell title={t("reports.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !pnlData}
          >
            <Download className="h-4 w-4" />
            {isDownloadingPdf ? t("reports.downloading") || "Downloading..." : t("reports.downloadPdf")}
          </Button>
        </div>

        {/* Error Messages */}
        {pnlError && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="p-4">
              <h4 className="text-sm font-medium text-orange-800">
                {t("reports.dataNotAvailable")}
              </h4>
              <p className="mt-1 text-sm text-orange-700">
                {t("reports.dataNotAvailableDescription")}
              </p>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        {!pnlError && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsArray.map((stat, index) => (
              <Card
                key={stat.title}
                className="p-6"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h4 className="text-sm font-medium text-slate-500">
                  {stat.title}
                </h4>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {stat.isPercentage
                    ? `${stat.value}%`
                    : formatCurrency(Number(stat.value))}
                </p>
                <div
                  className={cn(
                    "mt-2 flex items-center gap-1 text-sm",
                    stat.isExpense
                      ? stat.change > 0
                        ? "text-red-600"
                        : "text-emerald-600"
                      : stat.change >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  )}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change}% vs last year
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* P&L Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("reports.profitLoss")}
            </h3>
          </CardHeader>
          <CardContent>
            <div ref={plChartRef} style={{ width: "100%", height: 350 }}>
              {isMounted && revenueData && !pnlError && plDimensions.width > 0 && (
                <BarChart
                  width={plDimensions.width}
                  height={plDimensions.height}
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [
                      `€${Number(value).toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    formatter={(value) => (
                      <span className="text-sm text-slate-600">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="expenses"
                    name={t("reports.expenses")}
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="revenue"
                    name={t("reports.revenue")}
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              )}
              {(!revenueData || pnlError) && (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <div className="text-center">
                    <p className="text-sm">{t("reports.dataNotAvailable")}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Accounting Exports Section */}
        <Card>
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-200 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("reports.accountingExports.title")}
              </h3>
              <p className="text-sm text-slate-500">
                {t("reports.accountingExports.description")}
              </p>
            </div>
          </div>

          {/* DATEV Export */}
          <div className="p-6">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t("reports.accountingExports.datev.title")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("reports.accountingExports.datev.description")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t("reports.accountingExports.datev.includes")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {latestDatevExport?.status === "completed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {latestDatevExport.completedAt
                        ? `${t("reports.accountingExports.datev.completed")} ${formatDateTime(latestDatevExport.completedAt)}`
                        : latestDatevExport.createdAt
                        ? `${t("reports.accountingExports.datev.created")} ${formatDateTime(latestDatevExport.createdAt)}`
                        : ""}
                    </span>
                    <button
                      onClick={handleDownloadDatev}
                      disabled={downloadDatevMutation.isPending}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("reports.accountingExports.datev.downloadTitle")}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  className={buttonStyles("secondary")}
                  onClick={() => createDatevExportMutation.mutate()}
                  disabled={createDatevExportMutation.isPending}
                >
                  {createDatevExportMutation.isPending
                    ? t("reports.accountingExports.datev.requesting")
                    : t("reports.accountingExports.datev.button")}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
