"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Input, Label } from "@/components/atoms";
import { authApi, ApiError } from "@/lib/auth-api";
import { showToast } from "@/lib/toast";

export default function ResetPasswordPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL on mount
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password.length < 8) {
      setError(t("auth.resetPassword.passwordTooShort"));
      return;
    }

    if (password !== passwordConfirmation) {
      setError(t("auth.resetPassword.passwordMismatch"));
      return;
    }

    if (!token) {
      setError(t("auth.resetPassword.missingToken"));
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setResetSuccess(true);
      showToast.success(t("auth.resetPassword.success"));

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      const errorCode = apiError.error?.code;

      if (errorCode === "INVALID_TOKEN" || errorCode === "invalid_token") {
        setError(t("auth.resetPassword.invalidToken"));
      } else if (errorCode === "EXPIRED_TOKEN" || errorCode === "expired_token") {
        setError(t("auth.resetPassword.expiredToken"));
      } else {
        setError(apiError.error?.message || t("auth.resetPassword.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Missing token state
  if (!token && !resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Solobooks"
              width={160}
              height={40}
              priority
              className="h-16 w-auto"
            />
          </div>

          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {t("auth.resetPassword.invalidLink")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {t("auth.resetPassword.invalidLinkMessage")}
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("auth.resetPassword.requestNewLink")}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Solobooks"
              width={160}
              height={40}
              priority
              className="h-16 w-auto"
            />
          </div>

          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {t("auth.resetPassword.success")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {t("auth.resetPassword.successMessage")}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                {t("auth.resetPassword.redirecting")}
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("auth.resetPassword.goToLogin")}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/logo/logo-icon.svg"
            alt="Solobooks"
            width={160}
            height={40}
            priority
            className="h-16 w-auto"
          />
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("auth.resetPassword.title")}
          </h1>
          <p className="mt-2 text-slate-600">
            {t("auth.resetPassword.subtitle")}
          </p>
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

            {/* New Password */}
            <div>
              <Label htmlFor="password">{t("auth.resetPassword.newPassword")}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.resetPassword.newPassword")}
                  className="pr-10"
                  required
                  minLength={8}
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

            {/* Confirm Password */}
            <div>
              <Label htmlFor="passwordConfirmation">
                {t("auth.resetPassword.confirmPassword")}
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="passwordConfirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder={t("auth.resetPassword.confirmPassword")}
                  className="pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? t("auth.resetPassword.resetting")
                : t("auth.resetPassword.resetButton")}
            </Button>
          </form>
        </Card>

        {/* Back to login link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
