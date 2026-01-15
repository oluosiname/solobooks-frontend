import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authApiModule from '@/lib/auth-api';

// Mock the auth API
vi.mock('@/lib/auth-api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should provide auth context when used within AuthProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isAuthenticated');
    });
  });

  describe('Authentication state', () => {
    it('should start with unauthenticated state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });

    it('should load token from localStorage on mount', async () => {
      const mockToken = 'stored-token';
      const mockRefreshToken = 'stored-refresh-token';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      localStorage.setItem('solobooks_auth_token', mockToken);
      localStorage.setItem('solobooks_refresh_token', mockRefreshToken);
      localStorage.setItem('solobooks_user', JSON.stringify(mockUser));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.token).toBe(mockToken);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('login', () => {
    it('should successfully login and fetch user data', async () => {
      const mockToken = 'new-token';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        confirmed: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (authApiModule.authApi.login as any).mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          refresh_token: 'refresh-token-123',
          expires_in: 900,
          token_type: 'Bearer'
        },
      });

      (authApiModule.authApi.me as any).mockResolvedValueOnce({
        data: mockUser,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(authApiModule.authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(authApiModule.authApi.me).toHaveBeenCalledWith(mockToken);

      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should set error on login failure', async () => {
      const mockError = {
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      };

      (authApiModule.authApi.login as any).mockRejectedValueOnce(mockError);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpass');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid email or password');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register and fetch user data', async () => {
      const mockToken = 'new-user-token';
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
        confirmed: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (authApiModule.authApi.register as any).mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          refresh_token: 'refresh-token-456',
          expires_in: 900,
          token_type: 'Bearer'
        },
      });

      (authApiModule.authApi.me as any).mockResolvedValueOnce({
        data: mockUser,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(
          'newuser@example.com',
          'password123',
          'pro'
        );
      });

      expect(authApiModule.authApi.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        plan: 'pro',
      });

      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should set error on registration failure', async () => {
      const mockError = {
        error: {
          code: 'validation_error',
          message: 'Email already exists',
        },
      };

      (authApiModule.authApi.register as any).mockRejectedValueOnce(mockError);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.register('existing@example.com', 'pass', 'pro');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear auth state and redirect to login', async () => {
      const mockToken = 'test-token';
      localStorage.setItem('solobooks_auth_token', mockToken);
      localStorage.setItem(
        'solobooks_user',
        JSON.stringify({ id: '123', email: 'test@example.com' })
      );

      (authApiModule.authApi.logout as any).mockResolvedValueOnce({});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(authApiModule.authApi.logout).toHaveBeenCalledWith(mockToken);
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('solobooks_auth_token')).toBeNull();
      expect(localStorage.getItem('solobooks_refresh_token')).toBeNull();
      expect(localStorage.getItem('solobooks_user')).toBeNull();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should clear local state even if API call fails', async () => {
      localStorage.setItem('solobooks_auth_token', 'test-token');
      localStorage.setItem('solobooks_refresh_token', 'test-refresh-token');

      (authApiModule.authApi.logout as any).mockRejectedValueOnce(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('solobooks_auth_token')).toBeNull();
      expect(localStorage.getItem('solobooks_refresh_token')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Manually set an error
      (authApiModule.authApi.login as any).mockRejectedValueOnce({
        error: { message: 'Test error' },
      });

      await act(async () => {
        try {
          await result.current.login('test@test.com', 'pass');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
