"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, type AuthResponse, type ApiError } from "@/lib/auth-api";
import { camelize } from "@/services/api-transformer";

export interface AuthUser {
  id: string;
  email: string;
  confirmed: boolean;
  confirmationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  locale: string;
  onTrial: boolean;
  trialEndsAt?: string;
  plan: string;
  permissions: {
    limits: {
      invoice: LimitInfo;
      transaction: LimitInfo;
      client: LimitInfo;
    };
    features: Record<string, FeatureInfo>;
  };
}

export interface LimitInfo {
  current: number;
  max: number;
  available: boolean;
}

export interface FeatureInfo {
  available: boolean;
  requiredPlan: string;
  upgradeMessage: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    plan: string,
    firstName?: string,
    lastName?: string,
    language?: string,
  ) => Promise<void>;
  loginWithGoogle: (
    credential: string,
    plan?: string,
    language?: string,
  ) => Promise<void>;
  registerWithGoogle: (
    credential: string,
    plan?: string,
    language?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; deletedAt?: string }>;
  confirmEmail: (token: string) => Promise<void>;
  resendConfirmation: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "solobooks_auth_token";
const REFRESH_TOKEN_KEY = "solobooks_refresh_token";
const USER_KEY = "solobooks_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Shared cleanup function for logout and account deletion
  const clearAuthSession = (redirectTo?: string) => {
    // Clear refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }

    // Clear local state
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setTokenExpiry(null);

    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setIsLoading(false);

    // Redirect if specified
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  // Centralized function to fetch and transform user data
  const fetchUserData = async (token: string): Promise<AuthUser> => {
    const userResponse = await authApi.me(token);
    return camelize<AuthUser>(userResponse.data);
  };

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = (expiresInSeconds: number) => {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Schedule refresh 10 minutes before expiry
    const refreshInMs = Math.max((expiresInSeconds - 600) * 1000, 0); // Ensure non-negative

    const timer = setTimeout(async () => {
      try {
        if (refreshToken) {
          const refreshResponse = await authApi.refresh(refreshToken);
          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token;
          const newExpiresIn = refreshResponse.data.expires_in;

          // Update state with new tokens
          setToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          setTokenExpiry(new Date(Date.now() + newExpiresIn * 1000));
          localStorage.setItem(TOKEN_KEY, newAccessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

          // Schedule next refresh
          scheduleTokenRefresh(newExpiresIn);
        }
      } catch {
        // Token refresh failed silently - will retry on next interval
      }
    }, refreshInMs);

    setRefreshTimer(timer);
  };

  // Load tokens and fetch fresh user data from API on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (storedToken && storedRefreshToken) {
        // Try to use the stored token first
        try {
          const transformedUser = await fetchUserData(storedToken);
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(transformedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(transformedUser));

          // Set locale cookie for i18n
          if (transformedUser.locale) {
            document.cookie = `locale=${transformedUser.locale}; path=/; max-age=31536000; SameSite=Lax`;
          }

          // Schedule refresh for existing tokens (assume 1 hour if we don't know)
          scheduleTokenRefresh(3600);
        } catch {
          // Token likely expired, try to refresh automatically
          try {
            const refreshResponse = await authApi.refresh(storedRefreshToken);
            await handleAuthResponse(refreshResponse);
          } catch {
            // Only clear tokens if refresh also fails
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle window focus to refresh tokens if needed
  useEffect(() => {
    const handleFocus = () => {
      // Check if token is close to expiry (within 10 minutes) or already expired
      if (tokenExpiry && refreshToken) {
        const timeUntilExpiry = tokenExpiry.getTime() - Date.now();
        if (timeUntilExpiry < 600000) {
          // Less than 10 minutes - refresh token on focus
          authApi
            .refresh(refreshToken)
            .then(handleAuthResponse)
            .catch(() => {
              // Silent failure - will redirect to login if token fully expires
            });
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [tokenExpiry, refreshToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for account deleted event from 410 interceptor
  useEffect(() => {
    const handleAccountDeleted = (_event: Event) => {
 
      clearAuthSession("/account-deleted");
    };

    window.addEventListener("accountDeleted", handleAccountDeleted);

    return () => {
      window.removeEventListener("accountDeleted", handleAccountDeleted);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearError = () => setError(null);

  const handleAuthResponse = async (response: AuthResponse) => {
    const accessToken = response.data.access_token;
    const refreshTokenValue = response.data.refresh_token;
    const expiresIn = response.data.expires_in;

    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    setTokenExpiry(new Date(Date.now() + expiresIn * 1000));
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenValue);

    // Schedule proactive token refresh
    scheduleTokenRefresh(expiresIn);

    // Fetch user details with the access token
    try {
      const transformedUser = await fetchUserData(accessToken);
      setUser(transformedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
      // Set locale cookie for i18n
      if (transformedUser.locale) {
        document.cookie = `locale=${transformedUser.locale}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Continue without user data - token is still valid
      setUser(null);
    }

    setError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login({ email, password });
      await handleAuthResponse(response);

      // Redirect to home after successful login
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || "Failed to login. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    plan: string,
    firstName?: string,
    lastName?: string,
    language?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register({
        email,
        password,
        password_confirmation: password,
        first_name: firstName,
        last_name: lastName,
        language,
        plan,
      });

      await handleAuthResponse(response);

      // Redirect to home
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.error?.message || "Failed to register. Please try again.",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    credential: string,
    plan?: string,
    language?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.googleAuth(credential, plan, language);
      await handleAuthResponse(response);

      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.error?.message ||
          "Failed to sign in with Google. Please try again.",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async (
    credential: string,
    plan: string = "pro",
    language?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Backend handles both login and registration
      const response = await authApi.googleAuth(credential, plan, language);
      await handleAuthResponse(response);

      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.error?.message ||
          "Failed to sign up with Google. Please try again.",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      if (token) {
        await authApi.logout(token);
      }
    } catch {
      // Continue with local logout even if API call fails
    } finally {
      clearAuthSession("/login");
    }
  };

  const deleteAccount = async (): Promise<{
    success: boolean;
    deletedAt?: string;
  }> => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      setIsLoading(true);
      const response = await authApi.deleteAccount(token);

      // On 202 success, clear session and redirect to confirmation page
      // Use window.location.href to force full page reload and ensure
      // RouteGuard sees user as unauthenticated (localStorage is cleared synchronously)
      clearAuthSession();
      
      if (typeof window !== "undefined") {
        window.location.href = "/account-deleted";
      }

      return {
        success: true,
        deletedAt: response.data.deleted_at,
      };
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const confirmEmail = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.confirmEmail(token);
      await handleAuthResponse(response);

      // User's confirmed status will be updated via fetchUserData in handleAuthResponse
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || "Failed to confirm email. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!user?.email) {
      throw new Error("No user email available");
    }

    try {
      await authApi.resendConfirmation(user.email);
      // Success handled by caller (show toast)
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.error?.message || "Failed to resend confirmation email.");
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    deleteAccount,
    confirmEmail,
    resendConfirmation,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
