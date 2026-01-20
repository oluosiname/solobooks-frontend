"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  text?: "signin" | "signup";
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  text = "signin",
  disabled = false,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("common");

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage("No credential received from Google", {
          level: 'error',
          tags: { errorType: 'google_oauth_missing_credential' },
        });
      } else {
        // eslint-disable-next-line no-console
        console.error("No credential received from Google");
      }
      return;
    }

    try {
      setIsLoading(true);
      await onSuccess(credentialResponse.credential);
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error, {
          tags: { errorType: 'google_signin_error' },
        });
      } else {
        // eslint-disable-next-line no-console
        console.error("Google sign-in error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage("Google OAuth error", {
        level: 'error',
        tags: { errorType: 'google_oauth_error' },
      });
    } else {
      // eslint-disable-next-line no-console
      console.error("Google OAuth error");
    }
  };

  if (disabled || isLoading) {
    return (
      <div className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 opacity-50 cursor-not-allowed">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <span className="text-sm font-medium text-slate-700">{t("loading")}</span>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      text={text === "signup" ? "signup_with" : "continue_with"}
      width="100%"
      size="large"
      logo_alignment="left"
    />
  );
}