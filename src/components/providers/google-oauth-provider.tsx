"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import * as Sentry from "@sentry/nextjs";

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

export function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set", {
        level: 'error',
        tags: { errorType: 'missing_env_var' },
      });
    } else {
      // eslint-disable-next-line no-console
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    }
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}