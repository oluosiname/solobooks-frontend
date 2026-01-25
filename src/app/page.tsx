"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { DollarSign, Clock, Users, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/ui";
import { AlertBanners, RecentTransactions } from "@/components/dashboard";
import { DashboardPromptCards } from "@/components/organisms/DashboardPromptCards";
import { api } from "@/services/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.fetchDashboardStats,
  });



  const { data: transactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => api.fetchTransactions().then(result => result.data.slice(0, 15)),
  });

  const { data: uncheckedTransactions } = useQuery({
    queryKey: ["unchecked-transactions"],
    queryFn: api.fetchUncheckedTransactions,
  });

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Alert Banners */}
        <AlertBanners uncheckedCount={uncheckedTransactions?.length || 0} />

        {/* Prompt Cards */}
        <DashboardPromptCards />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("dashboard.totalIncome")}
            value={stats ? formatCurrency(stats.totalIncomeMtd) : "€0"}
            change={stats?.incomeChangePercent}
            changeLabel={t("dashboard.fromLastMonth")}
            icon={DollarSign}
            className="stagger-1"
          />
          <StatCard
            title={t("dashboard.expenses")}
            value={stats ? formatCurrency(stats.expensesMtd) : "€0"}
            change={stats?.expenseChangePercent}
            changeLabel={t("dashboard.fromLastMonth")}
            icon={TrendingUp}
            className="stagger-2"
          />
          <StatCard
            title={t("dashboard.outstandingAmount")}
            value={stats ? formatCurrency(stats.outstandingAmount) : "€0"}
            changeLabel={
              stats
                ? t("dashboard.overdueInvoices", {
                    count: stats.overdueInvoicesCount,
                  })
                : ""
            }
            icon={Clock}
            className="stagger-3"
          />
          <StatCard
            title={t("dashboard.activeClients")}
            value={stats?.activeClientsCount?.toString() || "0"}
            change={stats?.newClientsThisMonth}
            changeLabel={t("dashboard.newThisMonth", {
              count: stats?.newClientsThisMonth || 0,
            })}
            icon={Users}
            className="stagger-4"
          />
        </div>

        {/* Recent Transactions */}
        {transactions && <RecentTransactions transactions={transactions} />}
      </div>
    </AppShell>
  );
}
