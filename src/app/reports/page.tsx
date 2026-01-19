"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { AppShell } from "@/components/layout";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Input,
} from "@/components/atoms";
import { api, processPnlForRevenueChart, processPnlForCategoryChart, processPnlForProfitChart, downloadPnlPdf } from "@/services/api";
import { formatCurrency, cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";

export default function ReportsPage() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const plChartRef = useRef<HTMLDivElement>(null);
  const profitChartRef = useRef<HTMLDivElement>(null);
  const [plDimensions, setPlDimensions] = useState({ width: 0, height: 350 });
  const [profitDimensions, setProfitDimensions] = useState({
    width: 0,
    height: 250,
  });

  useEffect(() => {
    setIsMounted(true);

    const updateDimensions = () => {
      if (plChartRef.current) {
        setPlDimensions({
          width: plChartRef.current.offsetWidth,
          height: 350,
        });
      }
      if (profitChartRef.current) {
        setProfitDimensions({
          width: profitChartRef.current.offsetWidth,
          height: 250,
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
  const categoryData = pnlData ? processPnlForCategoryChart(pnlData) : null;
  const profitLossData = pnlData ? processPnlForProfitChart(pnlData) : null;

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

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profit Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("reports.profitTrend")}
              </h3>
            </CardHeader>
            <CardContent>
              <div ref={profitChartRef} style={{ width: "100%", height: 250 }}>
                {isMounted && profitLossData && !pnlError && profitDimensions.width > 0 && (
                  <AreaChart
                    width={profitDimensions.width}
                    height={profitDimensions.height}
                    data={profitLossData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="profitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                      tickFormatter={(value) =>
                        `€${(value / 1000).toFixed(0)}k`
                      }
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
                        t("reports.profit"),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                )}
                {(!profitLossData || pnlError) && (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    <div className="text-center">
                      <p className="text-sm">{t("reports.dataNotAvailable")}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("reports.expensesByCategory")}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData && !pnlError ? categoryData.map((category) => {
                  const maxAmount = Math.max(
                    ...(categoryData?.map((c) => c.amount) || [0])
                  );
                  const percentage = (category.amount / maxAmount) * 100;
                  return (
                    <div key={category.category}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          {category.category}
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex h-32 items-center justify-center text-slate-500">
                    <div className="text-center">
                      <p className="text-sm">{t("reports.dataNotAvailable")}</p>
                    </div>
                  </div>
                )}
                {pnlError && !categoryData && (
                  <div className="flex h-32 items-center justify-center text-slate-500">
                    <div className="text-center">
                      <p className="text-sm">{t("reports.dataNotAvailable")}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
