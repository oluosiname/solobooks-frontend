"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, type AuthResponse, type ApiError, type MeResponse } from "@/lib/auth-api";
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
  const router = useRouter();

  // Centralized function to fetch and transform user data
  const fetchUserData = async (token: string): Promise<AuthUser> => {
    const userResponse = await authApi.me(token);
    return camelize<AuthUser>(userResponse.data);
  };

  // Load tokens and fetch fresh user data from API on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (storedToken) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);

        try {
          // Always fetch fresh user data from API on page reload
          const transformedUser = await fetchUserData(storedToken);
          setUser(transformedUser);
          // Update localStorage with fresh data
          localStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          // If API call fails, try to use cached data as fallback
          const storedUser = localStorage.getItem(USER_KEY);
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch (parseError) {
              // Invalid stored data, clear it
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
            }
          } else {
            // No cached data and API failed, clear tokens
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
          }
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearError = () => setError(null);

  const handleAuthResponse = async (response: AuthResponse) => {
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    setToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // Fetch user details with the access token
    try {
      const transformedUser = await fetchUserData(accessToken);
      setUser(transformedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
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

      // RouteGuard will handle redirecting authenticated users away from public routes
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
      // Clear local state and storage
      setUser(null);
      setToken(null);
      setRefreshToken(null);
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
