"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { showToast } from "@/lib/toast";
import { styles } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function EmailUnconfirmedBanner() {
  const { user, resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const t = useTranslations();

  // Only show for logged-in users with unconfirmed emails, after 6 minutes since last send
  if (!user || user.confirmed) {
    return null;
  }

  const sentAt = user.confirmationSentAt;
  const sixMinutesMs = 6 * 60 * 1000;
  if (!sentAt || Date.now() - new Date(sentAt).getTime() < sixMinutesMs) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendConfirmation();
      showToast.success(t("auth.emailUnconfirmed.resendSuccess"));
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : t("errors.generic")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn(styles.alert, "bg-blue-50 border-blue-200")}>
      <Mail className="h-5 w-5 text-blue-600" />
      <div className="flex-1">
        <p className="font-medium text-blue-900">
          {t("auth.emailUnconfirmed.title")}
        </p>
        <p className="text-sm text-blue-700">
          {t("auth.emailUnconfirmed.message", { email: user.email })}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {t("auth.emailUnconfirmed.checkSpam")}
        </p>
      </div>
      <button
        onClick={handleResend}
        disabled={isResending}
        className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("auth.confirmation.resending")}
          </span>
        ) : (
          t("auth.emailUnconfirmed.resend")
        )}
      </button>
    </div>
  );
}
