import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../auth-api';

// Mock fetch
global.fetch = vi.fn();

describe('AuthAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        data: { token: 'test-token-123' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should throw error on failed login', async () => {
      const mockError = {
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(
        authApi.login({
          email: 'wrong@example.com',
          password: 'wrongpass',
        })
      ).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authApi.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        error: {
          code: 'NETWORK_ERROR',
          message: expect.stringContaining('Failed to connect'),
        },
      });
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        data: { token: 'new-user-token' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.register({
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        plan: 'pro',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            user: {
              email: 'newuser@example.com',
              password: 'password123',
              password_confirmation: 'password123',
              plan: 'pro',
            },
          }),
        })
      );
    });

    it('should use default plan if not provided', async () => {
      const mockResponse = {
        data: { token: 'new-user-token' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await authApi.register({
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      });

      const callBody = JSON.parse(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mock.calls[0][1].body
      );
      expect(callBody.user.plan).toBe('pro');
    });

    it('should throw error on validation failure', async () => {
      const mockError = {
        error: {
          code: 'validation_error',
          message: 'Validation failed',
          details: {
            password_confirmation: ['does not match password'],
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(
        authApi.register({
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'different',
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('me', () => {
    it('should fetch current user details with valid token', async () => {
      const mockResponse = {
        data: {
          id: 'user-123',
          email: 'test@example.com',
          confirmed: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.me('test-token');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should throw error with invalid token', async () => {
      const mockError = {
        error: {
          code: 'unauthorized',
          message: 'Invalid or expired token',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(authApi.me('invalid-token')).rejects.toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await authApi.logout('test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/logout',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
