import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouteGuard } from '../RouteGuard';
import * as AuthContext from '@/contexts/AuthContext';

const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading spinner while authentication is being checked', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/dashboard');

      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();

      // Should not show content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Protected routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/dashboard');

      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });

      // Should not show protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show content for authenticated users on protected routes', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          confirmed: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          locale: 'en',
          onTrial: false,
          trialEndsAt: undefined,
          plan: 'free',
          permissions: {
            limits: {
              invoice: { current: 0, max: 0, available: true },
              transaction: { current: 0, max: 0, available: true },
              client: { current: 0, max: 0, available: true },
            },
            features: {},
          },
        },
        token: 'valid-token',
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/dashboard');

      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle home route as protected', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/');

      render(
        <RouteGuard>
          <div>Home Content</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Public routes', () => {
    it('should show login page for unauthenticated users', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/login');

      render(
        <RouteGuard>
          <div>Login Page</div>
        </RouteGuard>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show register page for unauthenticated users', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/register');

      render(
        <RouteGuard>
          <div>Register Page</div>
        </RouteGuard>
      );

      expect(screen.getByText('Register Page')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect authenticated users away from login', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          confirmed: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          locale: 'en',
          onTrial: false,
          trialEndsAt: undefined,
          plan: 'free',
          permissions: {
            limits: {
              invoice: { current: 0, max: 0, available: true },
              transaction: { current: 0, max: 0, available: true },
              client: { current: 0, max: 0, available: true },
            },
            features: {},
          },
        },
        token: 'valid-token',
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/login');

      render(
        <RouteGuard>
          <div>Login Page</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should redirect authenticated users away from register', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          confirmed: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          locale: 'en',
          onTrial: false,
          trialEndsAt: undefined,
          plan: 'free',
          permissions: {
            limits: {
              invoice: { current: 0, max: 0, available: true },
              transaction: { current: 0, max: 0, available: true },
              client: { current: 0, max: 0, available: true },
            },
            features: {},
          },
        },
        token: 'valid-token',
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      mockPathname.mockReturnValue('/register');

      render(
        <RouteGuard>
          <div>Register Page</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Route transitions', () => {
    it('should handle route changes correctly', async () => {
      const { rerender } = render(
        <RouteGuard>
          <div>Content</div>
        </RouteGuard>
      );

      // Start on login page (unauthenticated)
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });
      mockPathname.mockReturnValue('/login');

      rerender(
        <RouteGuard>
          <div>Content</div>
        </RouteGuard>
      );

      // Should show content on login page
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Now authenticate and try to access login
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          confirmed: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          locale: 'en',
          onTrial: false,
          trialEndsAt: undefined,
          plan: 'free',
          permissions: {
            limits: {
              invoice: { current: 0, max: 0, available: true },
              transaction: { current: 0, max: 0, available: true },
              client: { current: 0, max: 0, available: true },
            },
            features: {},
          },
        },
        token: 'valid-token',
        refreshToken: null,
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
        clearError: vi.fn(),
      });

      rerender(
        <RouteGuard>
          <div>Content</div>
        </RouteGuard>
      );

      // Should redirect to home
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });
});
