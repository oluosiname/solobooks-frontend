/**
 * Authentication API Client
 *
 * Handles all authentication-related API calls to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  full_name?: string;
  language?: string;
  plan?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface MeResponse {
  data: {
    id: string;
    email: string;
    confirmed: boolean;
    confirmation_sent_at?: string;
    created_at: string;
    updated_at: string;
    locale: string;
    on_trial: boolean;
    trial_ends_at?: string;
    plan: string;
    permissions: {
      limits: {
        invoice: { current: number; max: number; available: boolean };
        transaction: { current: number; max: number; available: boolean };
        client: { current: number; max: number; available: boolean };
      };
      features: Record<
        string,
        {
          available: boolean;
          required_plan: string;
          upgrade_message: string;
        }
      >;
    };
  };
}

export interface ConfirmEmailRequest {
  confirmation_token: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

class AuthApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw data as ApiError;
      }

      return data;
    } catch (error) {
      // Re-throw API errors
      if ((error as ApiError)?.error) {
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
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        user: {
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          full_name: data.full_name,
          language: data.language,
          plan: data.plan || "pro",
        },
      }),
    });
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
  }

  /**
   * Logout user
   * DELETE /api/v1/auth/logout
   */
  async logout(token: string): Promise<void> {
    return this.request<void>("/api/v1/auth/logout", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Delete user account
   * DELETE /api/v1/account
   *
   * Response codes:
   * - 202: Deletion initiated successfully
   * - 401: Unauthorized
   * - 410: Account already deleted
   * - 422: Deletion failed
   */
  async deleteAccount(
    token: string,
  ): Promise<{ data: { message: string; deleted_at: string } }> {
    return this.request<{ data: { message: string; deleted_at: string } }>(
      "/api/v1/account",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  /**
   * Get current user details
   * GET /api/v1/auth/me
   */
  async me(token: string): Promise<MeResponse> {
    return this.request<MeResponse>("/api/v1/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  }

  /**
   * Request password reset
   * POST /api/v1/auth/password/reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/v1/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
  }

  /**
   * Reset password with token
   * PUT /api/v1/auth/password
   */
  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/v1/auth/password", {
      method: "PUT",
      body: JSON.stringify({
        user: {
          reset_password_token: token,
          password,
        },
      }),
    });
  }

  /**
   * Google OAuth Sign-In
   * POST /api/v1/auth/google
   * Request: { "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...", "plan": "pro", "language": "en" }
   */
  async googleAuth(
    idToken: string,
    plan?: string,
    language?: string,
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({
        id_token: idToken,
        ...(plan && { plan }),
        ...(language && { language }),
      }),
    });
  }

  /**
   * Confirm email address with token
   * POST /api/v1/auth/confirmation
   */
  async confirmEmail(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/confirmation", {
      method: "POST",
      body: JSON.stringify({ confirmation_token: token }),
    });
  }

  /**
   * Resend confirmation email
   * POST /api/v1/auth/confirmation
   */
  async resendConfirmation(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/v1/auth/confirmation", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
}

export const authApi = new AuthApiClient();
