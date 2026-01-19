"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState } from "react";

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

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential received from Google");
      return;
    }

    try {
      setIsLoading(true);
      await onSuccess(credentialResponse.credential);
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error("Google OAuth error");
  };

  if (disabled || isLoading) {
    return (
      <div className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 opacity-50 cursor-not-allowed">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <span className="text-sm font-medium text-slate-700">Loading...</span>
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