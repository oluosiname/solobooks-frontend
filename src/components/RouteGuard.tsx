"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/account-deleted", "/confirm"];

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still checking authentication
    if (isLoading) {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
      return;
    }

    // If authenticated and trying to access auth routes (login/register), redirect to home
    // Note: /confirm is allowed for authenticated users (they may need to resend)
    if (isAuthenticated && isAuthRoute) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show nothing while checking authentication for protected routes
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  // For public routes, always show content
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, only show if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
