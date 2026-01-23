import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "—"; // Return em dash for null/undefined dates
  }

  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatRelativeTime(
  dateString: string | null | undefined
): string {
  if (!dateString) {
    return "Never";
  }

  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Never";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "just now";
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    return formatDate(dateString);
  }
}

export function isLastSyncWithin24Hours(
  dateString: string | null | undefined
): boolean {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours < 24;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    submitted: "bg-blue-100 text-blue-700",
    accepted: "bg-emerald-100 text-emerald-700",
    error: "bg-red-100 text-red-700",
    active: "bg-emerald-100 text-emerald-700",
    trial: "bg-amber-100 text-amber-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function groupTransactionsByMonth<T>(
  transactions: T[],
  getDate: (transaction: T) => string
): Record<string, T[]> {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(getDate(transaction));
    const key = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
    return groups;
  }, {} as Record<string, T[]>);
}

export function getDateRangeForPeriod(year: string, period: string): { startDate: string; endDate: string } {
  const yearNum = parseInt(year);

  switch (period) {
    case 'annually':
      return {
        startDate: `${yearNum}-01-01`,
        endDate: `${yearNum}-12-31`
      };

    case 'quarterly':
      // For quarterly, we'll default to showing the full year
      // You could extend this to accept a quarter parameter if needed
      return {
        startDate: `${yearNum}-01-01`,
        endDate: `${yearNum}-12-31`
      };

    case 'monthly':
      // For monthly, we'll default to showing the full year
      // You could extend this to accept a month parameter if needed
      return {
        startDate: `${yearNum}-01-01`,
        endDate: `${yearNum}-12-31`
      };

    default:
      // Default to annually
      return {
        startDate: `${yearNum}-01-01`,
        endDate: `${yearNum}-12-31`
      };
  }
}

export function generatePeriodLabel(year: string, period: string): string {
  const yearNum = parseInt(year);

  switch (period) {
    case 'annually':
      return `${yearNum} Annual`;
    case 'quarterly':
      return `${yearNum} Quarterly`;
    case 'monthly':
      return `${yearNum} Monthly`;
    default:
      return `${yearNum}`;
  }
}
