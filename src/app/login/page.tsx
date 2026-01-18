"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Calculator } from "lucide-react";
import Link from "next/link";
import { Button, Card, Input, Label } from "@/components/atoms";
import { useAuth } from "@/contexts/AuthContext";
import { Locale, locales } from "@/i18n/config";

export default function LoginPage() {
  const t = useTranslations();
  const { login, error, clearError, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle language from URL parameter
  useEffect(() => {
    const langParam = searchParams.get("lang");
    if (langParam && locales.includes(langParam as Locale)) {
      // Set locale cookie for immediate language switching
      document.cookie = `locale=${langParam}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Redirect is handled by the auth context
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log("Google login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
            <Calculator className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("auth.login.title")}
          </h1>
          <p className="mt-2 text-slate-600">{t("auth.login.subtitle")}</p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.login.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.login.password")}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-slate-600"
              >
                {t("auth.login.rememberMe")}
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? t("auth.login.signingIn") || "Signing in..."
                : t("auth.login.signIn")}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  {t("auth.login.or")}
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.login.continueWithGoogle")}
            </button>
          </form>
        </Card>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t("auth.login.signUp")}
          </Link>
        </p>

        {/* Privacy Notice */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {t("auth.login.protectedBy")}{" "}
          <Link
            href="/privacy"
            className="text-indigo-600 hover:text-indigo-500"
          >
            {t("auth.login.privacyPolicy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
