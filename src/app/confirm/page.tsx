"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, Mail, Calculator, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/toast";

type ConfirmStatus = "loading" | "success" | "error";

// Module-level map to track tokens and their results (survives component remounts)
const processedTokens = new Map<string, { status: ConfirmStatus; error?: string }>();

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail, resendConfirmation, user } = useAuth();
  const t = useTranslations();

  const token = searchParams.get("confirmation_token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("auth.confirmation.missingToken"));
      return;
    }

    // Check if we've already processed this token
    const cached = processedTokens.get(token);
    if (cached) {
      setStatus(cached.status);
      if (cached.error) setErrorMessage(cached.error);
      if (cached.status === "success") {
        setTimeout(() => router.push("/"), 2000);
      }
      return;
    }

    // Mark as processing to prevent duplicate requests
    processedTokens.set(token, { status: "loading" });

    confirmEmail(token)
      .then(() => {
        processedTokens.set(token, { status: "success" });
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      })
      .catch((error: unknown) => {
        const apiError = error as { error?: { message?: string } };
        const errorMsg = apiError?.error?.message || t("auth.confirmation.error");
        processedTokens.set(token, { status: "error", error: errorMsg });
        setStatus("error");
        setErrorMessage(errorMsg);
      });
  }, [token, confirmEmail, router, t]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendConfirmation();
      showToast.success(t("auth.confirmation.resendSuccess"));
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : t("errors.generic"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
            <Calculator className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {/* Loading State */}
          {status === "loading" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
              <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
                {t("auth.confirmation.confirming")}
              </h1>
              <p className="mt-4 text-center text-slate-600">
                {t("common.loading")}
              </p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
                {t("auth.confirmation.success")}
              </h1>
              <p className="mt-4 text-center text-slate-600">
                {t("auth.confirmation.successMessage")}
              </p>
              <p className="mt-2 text-center text-sm text-slate-500">
                {t("auth.confirmation.redirecting")}
              </p>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
                {t("auth.confirmation.error")}
              </h1>
              <p className="mt-4 text-center text-slate-600">
                {errorMessage || t("auth.confirmation.expired")}
              </p>

              {/* Resend Button */}
              {user?.email && (
                <div className="mt-6">
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("auth.confirmation.resending")}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        {t("auth.confirmation.resend")}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
