"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, type AuthResponse, type ApiError } from "@/lib/auth-api";
import { camelize } from "@/services/api-transformer";

interface AuthUser {
  id: string;
  email: string;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
  locale: string;
  onTrial: boolean;
  trialEndsAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, plan: string) => Promise<void>;
  logout: () => Promise<void>;
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
      } catch (error) {
        console.error("Failed to refresh token:", error);
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
        } catch (error) {
          console.error(
            "Access token expired, attempting automatic refresh..."
          );
          // Token likely expired, try to refresh automatically
          try {
            const refreshResponse = await authApi.refresh(storedRefreshToken);
            await handleAuthResponse(refreshResponse);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
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
  }, []);

  // Handle window focus to refresh tokens if needed
  useEffect(() => {
    const handleFocus = () => {
      // Check if token is close to expiry (within 10 minutes) or already expired
      if (tokenExpiry && refreshToken) {
        const timeUntilExpiry = tokenExpiry.getTime() - Date.now();
        if (timeUntilExpiry < 600000) {
          // Less than 10 minutes
          console.log("Token close to expiry, refreshing on focus...");
          authApi
            .refresh(refreshToken)
            .then(handleAuthResponse)
            .catch((error) => {
              console.error("Failed to refresh token on focus:", error);
            });
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [tokenExpiry, refreshToken]);

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
    } catch (error) {
      console.error("Failed to fetch user details:", error);
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

  const register = async (email: string, password: string, plan: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register({
        email,
        password,
        password_confirmation: password,
        plan,
      });

      await handleAuthResponse(response);

      // Redirect to home
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.error?.message || "Failed to register. Please try again."
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
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear refresh timer
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        setRefreshTimer(null);
      }

      // Clear local state and storage
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setTokenExpiry(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setIsLoading(false);

      // Redirect to login
      router.push("/login");
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
    logout,
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
