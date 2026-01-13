'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { StatCard } from '@/components/ui';
import { AlertBanners, RevenueChart, CategoryChart, RecentTransactions } from '@/components/dashboard';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-expense-data'],
    queryFn: api.getRevenueExpenseData,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['category-data'],
    queryFn: api.getCategoryData,
  });

  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => api.getRecentTransactions(5),
  });

  const { data: uncheckedTransactions } = useQuery({
    queryKey: ['unchecked-transactions'],
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
            title="Total Revenue"
            value={stats ? formatCurrency(stats.totalRevenue) : '€0'}
            change={stats?.revenueChange}
            changeLabel="from last month"
            icon={DollarSign}
            className="stagger-1"
          />
          <StatCard
            title="Outstanding"
            value={stats ? formatCurrency(stats.outstanding) : '€0'}
            changeLabel={stats ? `${stats.overdueInvoices} overdue invoices` : ''}
            icon={Clock}
            className="stagger-2"
          />
          <StatCard
            title="Active Clients"
            value={stats?.activeClients?.toString() || '0'}
            change={stats?.newClientsThisMonth}
            changeLabel="new this month"
            icon={Users}
            className="stagger-3"
          />
          <StatCard
            title="Profit Margin"
            value={stats ? `${stats.profitMargin}%` : '0%'}
            change={stats?.profitMarginChange}
            changeLabel="from last month"
            icon={TrendingUp}
            className="stagger-4"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {revenueData && <RevenueChart data={revenueData} />}
          </div>
          <div>
            {categoryData && <CategoryChart data={categoryData} />}
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions && <RecentTransactions transactions={transactions} />}
      </div>
    </AppShell>
  );
}
