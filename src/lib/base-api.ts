/**
 * Base API Client
 *
 * Provides common functionality for all API clients including:
 * - Authentication token handling
 * - Request/response interceptors
 * - Error handling
 * - Base configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type AppError = ApiError | Error | { message: string } | unknown;

export class BaseApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication token from localStorage
   */
  protected getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("solobooks_auth_token");
    }
    return null;
  }

  /**
   * Get refresh token from localStorage
   */
  protected getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("solobooks_refresh_token");
    }
    return null;
  }

  /**
   * Refresh the access token using the refresh token
   */
  protected async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();
      const newAccessToken = data.data.access_token;
      const newRefreshToken = data.data.refresh_token;

      // Update stored tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("solobooks_auth_token", newAccessToken);
        localStorage.setItem("solobooks_refresh_token", newRefreshToken);
      }

      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, trigger logout by clearing tokens and reloading
      if (typeof window !== "undefined") {
        localStorage.removeItem("solobooks_auth_token");
        localStorage.removeItem("solobooks_refresh_token");
        localStorage.removeItem("solobooks_user");
        window.location.href = "/login";
      }
      return null;
    }
  }

  /**
   * Make an authenticated HTTP request
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content response
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // If we get a 401 and have a refresh token, try to refresh
        if (response.status === 401 && this.getRefreshToken()) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry the request with the new token
            const retryConfig: RequestInit = {
              ...options,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
                ...options.headers,
              },
            };

            const retryResponse = await fetch(url, retryConfig);

            if (retryResponse.status === 204) {
              return undefined as T;
            }

            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
              throw retryData as ApiError;
            }

            return retryData;
          }
        }

        throw data as ApiError;
      }

      return data;
    } catch (error) {
      // Re-throw API errors
      if ((error as AppError)?.error) {
        throw error;
      }

      // Handle network errors
      throw {
        error: {
          code: "NETWORK_ERROR",
          message:
            "Failed to connect to the server. Please check your connection.",
        },
      } as ApiError;
    }
  }

  /**
   * Make a GET request
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    let url = endpoint;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, { method: "GET" });
  }

  /**
   * Make a POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
