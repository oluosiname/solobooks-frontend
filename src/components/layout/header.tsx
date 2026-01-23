"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Globe, Menu } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useTranslations } from "next-intl";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ title, onMenuClick, showMenuButton = false }: HeaderProps) {
  const t = useTranslations();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { user: authUser } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.fetchProfile,
  });

  const handleLanguageChange = async (locale: string) => {
    try {
      await api.updateSettings({ language: locale });
      // Set locale cookie for immediate i18n detection
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      showToast.success(t("settings.languageChanged"));
      // Refresh the page to apply the new language
      window.location.reload();
    } catch {
      showToast.error(t("settings.languageChangeFailed"));
    }
    setIsLanguageMenuOpen(false);
  };

  // Get display name (business name or full name or email)
  const displayName =
    profile?.businessName || profile?.fullName || authUser?.email || "User";
  const currentLocale = authUser?.locale || "en";

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Help */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Globe className="h-5 w-5" />
          </button>

          {isLanguageMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  currentLocale === "en"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700"
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange("de")}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  currentLocale === "de"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700"
                }`}
              >
                Deutsch
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 py-1.5 pl-2 sm:pl-3 pr-2 transition-colors hover:bg-slate-50">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">
              {currentLocale.toUpperCase()}
              {authUser?.onTrial && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Trial
                </span>
              )}
            </p>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-medium text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
