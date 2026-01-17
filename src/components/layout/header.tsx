"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, HelpCircle, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
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
    } catch (error) {
      console.error("Failed to update language:", error);
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

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
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 py-1.5 pl-3 pr-2 transition-colors hover:bg-slate-50">
          <div className="text-right">
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-medium text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
