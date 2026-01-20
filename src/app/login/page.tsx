"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Calculator } from "lucide-react";
import Link from "next/link";
import { Button, Card, Input, Label } from "@/components/atoms";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import { Locale, locales } from "@/i18n/config";

export default function LoginPage() {
  const t = useTranslations();
  const { login, loginWithGoogle, error, clearError, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle language from URL parameter
  useEffect(() => {
    const langParam = searchParams.get("language") || searchParams.get("lang");
    if (langParam && locales.includes(langParam as Locale)) {
      // Check if cookie is already set to avoid infinite reload
      const currentLocale = document.cookie
        .split("; ")
        .find((row) => row.startsWith("locale="))
        ?.split("=")[1];

      if (currentLocale !== langParam) {
        // Set locale cookie for immediate language switching
        document.cookie = `locale=${langParam}; path=/; max-age=31536000; SameSite=Lax`;
        // Force page reload to apply new language
        window.location.reload();
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Redirect is handled by the auth context
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    clearError();
    try {
      const planParam = searchParams.get("plan");
      const validPlans = ["starter", "plus", "pro"];
      const plan = planParam && validPlans.includes(planParam) ? planParam : undefined;

      const langParam = searchParams.get("language") || searchParams.get("lang");
      const language = langParam && locales.includes(langParam as Locale) ? langParam : undefined;

      await loginWithGoogle(credential, plan, language);
    } catch {
      // Error handled by auth context
    }
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
              ? t("auth.login.signingIn")
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
            <GoogleSignInButton
              onSuccess={handleGoogleLogin}
              text="signin"
              disabled={isLoading}
            />
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
