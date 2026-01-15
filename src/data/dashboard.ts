import type {
  DashboardStats,
  RevenueExpenseData,
  CategoryData,
  ProfitLossData,
} from "@/types";

export const dashboardStats: DashboardStats = {
  totalIncomeMtd: 328000,
  incomeChangePercent: 12.5,
  expensesMtd: 89450,
  expenseChangePercent: -2.3,
  outstandingAmount: 89450,
  overdueInvoicesCount: 8,
  activeClientsCount: 47,
  newClientsThisMonth: 3,
  clientGrowthPercent: 6.8,
  profitMargin: 32.8,
};

export const revenueExpenseData: RevenueExpenseData[] = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 30000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 34000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
];

export const categoryData: CategoryData[] = [
  { category: "Consulting", amount: 147600, color: "#6366f1" },
  { category: "Development", amount: 98400, color: "#22c55e" },
  { category: "Design", amount: 82000, color: "#f59e0b" },
];

export const profitLossData: ProfitLossData[] = [
  { month: "Jan", profit: 13000 },
  { month: "Feb", profit: 17000 },
  { month: "Mar", profit: 18000 },
  { month: "Apr", profit: 23000 },
  { month: "May", profit: 21000 },
  { month: "Jun", profit: 27000 },
];
