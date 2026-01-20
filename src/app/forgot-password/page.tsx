"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Input, Label } from "@/components/atoms";
import { authApi, ApiError } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestPasswordReset(email);
      setEmailSent(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || t("auth.forgotPassword.error"));
    } finally {
      setIsLoading(false);
    }
  };

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

        {emailSent ? (
          // Success State
          <>
            <Card className="p-8">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {t("auth.forgotPassword.checkEmail")}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t("auth.forgotPassword.checkEmailMessage")}{" "}
                  <strong>{email}</strong>
                </p>
              </div>
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
          </>
        ) : (
          // Form State
          <>
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-slate-900">
                {t("auth.forgotPassword.title")}
              </h1>
              <p className="mt-2 text-slate-600">
                {t("auth.forgotPassword.subtitle")}
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

                {/* Email */}
                <div>
                  <Label htmlFor="email">{t("auth.forgotPassword.email")}</Label>
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("auth.forgotPassword.sending")
                    : t("auth.forgotPassword.sendLink")}
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
          </>
        )}
      </div>
    </div>
  );
}
