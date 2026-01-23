"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout";
import { Button, Card } from "@/components/atoms";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import type { ApiError } from "@/types";

export default function BankConnectionCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasProcessedCallback = useRef(false);

  const completeConnectionMutation = useMutation({
    mutationFn: () => api.completeBankConnection(),
    onSuccess: () => {
      setStatus("success");
      showToast.success(t("bankConnections.callback.successToast"));

      // Redirect to bank connections page after a short delay
      setTimeout(() => {
        router.push("/bank-connections");
      }, 3000);
    },
    onError: (error: ApiError) => {
      setStatus("error");
      setErrorMessage(
        error?.error?.message || t("bankConnections.callback.errorDescription")
      );
      showToast.error(t("bankConnections.callback.errorToast"));
    },
  });

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessedCallback.current) {
      return;
    }
    hasProcessedCallback.current = true;

    const handleCallback = async () => {
      // Get parameters from URL
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Check for errors first
      if (error) {
        setStatus("error");
        setErrorMessage(errorDescription || error);
        showToast.error(
          t("bankConnections.callback.failedToast", {
            error: errorDescription || error,
          })
        );
        return;
      }

      completeConnectionMutation.mutate();
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    router.push("/bank-connections/connect");
  };

  const handleGoBack = () => {
    router.push("/bank-connections");
  };

  return (
    <AppShell title={t("bankConnections.callback.title")}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("bankConnections.callback.completingConnection")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("bankConnections.callback.completingDescription")}
              </p>
              <div className="flex justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("bankConnections.callback.successTitle")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("bankConnections.callback.successDescription")}
              </p>
              <Button onClick={handleGoBack} className="w-full">
                {t("bankConnections.callback.goToConnections")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("bankConnections.callback.errorTitle")}
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage || t("bankConnections.callback.errorDescription")}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  variant="primary"
                  className="w-full"
                >
                  {t("bankConnections.callback.tryAgain")}
                </Button>
                <Button
                  onClick={handleGoBack}
                  variant="ghost"
                  className="w-full"
                >
                  {t("bankConnections.callback.goBack")}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
