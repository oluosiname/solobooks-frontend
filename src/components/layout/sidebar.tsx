"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FileText,
  Users,
  ArrowLeftRight,
  Building2,
  BarChart3,
  Calculator,
  CreditCard,
  Settings,
  LogOut,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const mainNavItems: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/invoices", labelKey: "invoices", icon: FileText },
  { href: "/clients", labelKey: "clients", icon: Users },
  { href: "/transactions", labelKey: "transactions", icon: ArrowLeftRight },
  {
    href: "/bank-connections",
    labelKey: "navBankConnections",
    icon: Building2,
  },
  { href: "/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/taxes", labelKey: "taxes", icon: Calculator },
];

const bottomNavItems: NavItem[] = [
  { href: "/subscription", labelKey: "subscription", icon: CreditCard },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

function calculateTrialDaysLeft(trialEndsAt: string | undefined): number | null {
  if (!trialEndsAt) return null;
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { user } = useAuth();

  const trialDaysLeft = user?.onTrial ? calculateTrialDaysLeft(user.trialEndsAt) : null;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            Solobooks
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Trial Banner */}
        {user?.onTrial && trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="border-t border-slate-200 px-3 py-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5" />
                {t("trialTimeSensitive")}
              </div>
              <p className="text-sm text-slate-700 mb-3">
                {trialDaysLeft === 1
                  ? t("trialLastDay")
                  : t("trialDaysLeft", { days: trialDaysLeft })}
              </p>
              <Link
                href="/subscription"
                onClick={handleLinkClick}
                className="block w-full rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                {t("upgradePlan")}
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-slate-200 px-3 py-4">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <LogOut className="h-5 w-5" />
            {t("logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
