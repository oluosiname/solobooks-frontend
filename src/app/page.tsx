"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Clock, Users, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/ui";
import { AlertBanners, RecentTransactions } from "@/components/dashboard";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-expense-data"],
    queryFn: api.getRevenueExpenseData,
  });

  // Calculate YTD expenses from revenue data
  const ytdExpenses = revenueData
    ? revenueData.reduce((total, month) => total + month.expenses, 0)
    : 0;

  const { data: transactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => api.getRecentTransactions(15),
  });

  const { data: uncheckedTransactions } = useQuery({
    queryKey: ["unchecked-transactions"],
    queryFn: api.getUncheckedTransactions,
  });

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Alert Banners */}
        <AlertBanners uncheckedCount={uncheckedTransactions?.length || 0} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Income (YTD)"
            value={stats ? formatCurrency(stats.totalRevenue) : "€0"}
            change={stats?.revenueChange}
            changeLabel="from last month"
            icon={DollarSign}
            className="stagger-1"
          />
          <StatCard
            title="Expenses (YTD)"
            value={formatCurrency(ytdExpenses)}
            changeLabel="from last month"
            icon={TrendingUp}
            className="stagger-2"
          />
          <StatCard
            title="Outstanding"
            value={stats ? formatCurrency(stats.outstanding) : "€0"}
            changeLabel={
              stats ? `${stats.overdueInvoices} overdue invoices` : ""
            }
            icon={Clock}
            className="stagger-3"
          />
          <StatCard
            title="Active Clients"
            value={stats?.activeClients?.toString() || "0"}
            change={stats?.newClientsThisMonth}
            changeLabel="new this month"
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
