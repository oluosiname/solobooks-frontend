import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';
import * as AuthContext from '@/contexts/AuthContext';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: mockClearError,
      error: null,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  });

  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('auth.login.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.login.password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.login.signIn' })).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText('auth.login.password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    // Password should be hidden initially
    expect(passwordInput.type).toBe('password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    // Fill in the form
    await user.type(screen.getByLabelText('auth.login.email'), 'test@example.com');
    await user.type(screen.getByLabelText('auth.login.password'), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'auth.login.signIn' }));

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message when login fails', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: mockClearError,
      error: 'Invalid email or password',
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });

    render(<LoginPage />);

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('should disable submit button while loading', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: mockClearError,
      error: null,
      isLoading: true,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /auth.login.signingIn/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show loading text while submitting', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: mockClearError,
      error: null,
      isLoading: true,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });

    render(<LoginPage />);

    // Check for the button text which includes the loading state
    const submitButton = screen.getByRole('button', { name: /auth.login.signingIn|Signing in/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should have link to register page', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /auth.login.signUp/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have link to forgot password page', () => {
    render(<LoginPage />);

    const forgotPasswordLink = screen.getByRole('link', { name: /auth.login.forgotPassword/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'auth.login.signIn' });

    // Try to submit without filling fields
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText('auth.login.email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('auth.login.password') as HTMLInputElement;

    expect(emailInput.validity.valid).toBe(false);
    expect(passwordInput.validity.valid).toBe(false);
  });

  it('should clear error on form submission', async () => {
    const user = userEvent.setup();

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: mockClearError,
      error: 'Some error',
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });

    render(<LoginPage />);

    // Error should be displayed
    expect(screen.getByText('Some error')).toBeInTheDocument();

    // Fill in required fields
    await user.type(screen.getByLabelText('auth.login.email'), 'test@example.com');
    await user.type(screen.getByLabelText('auth.login.password'), 'password');

    // Submit form to trigger clearError
    await user.click(screen.getByRole('button', { name: 'auth.login.signIn' }));

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
    });
  });
});
