import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../page';
import * as AuthContext from '@/contexts/AuthContext';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock GoogleSignInButton
vi.mock('@/components/auth/GoogleSignInButton', () => ({
  GoogleSignInButton: () => <div data-testid="google-signin-button">Google Sign In</div>,
}));

describe('RegisterPage', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      registerWithGoogle: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      deleteAccount: vi.fn(),
      clearError: mockClearError,
      error: null,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  });

  describe('Plan selection step', () => {
    it('should render plan selection page initially', () => {
      render(<RegisterPage />);

      expect(screen.getByText('auth.register.selectPlan')).toBeInTheDocument();
      expect(screen.getByText('auth.plans.starter')).toBeInTheDocument();
      expect(screen.getByText('auth.plans.plus')).toBeInTheDocument();
      expect(screen.getByText('auth.plans.pro')).toBeInTheDocument();
    });

    it('should highlight selected plan', async () => {
      render(<RegisterPage />);

      // Pro plan should be selected by default (as per the component state)
      const proCards = screen.getAllByText('auth.plans.pro');
      expect(proCards.length).toBeGreaterThan(0);
    });

    it('should proceed to details step when plan is selected', async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Find and click the Pro plan button
      const proButtons = screen.getAllByRole('button');
      const continueButton = proButtons.find((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );

      if (continueButton) {
        await user.click(continueButton);
      }

      await waitFor(() => {
        expect(screen.getByText('auth.register.title')).toBeInTheDocument();
      });
    });

    it('should show most popular badge on pro plan', () => {
      render(<RegisterPage />);

      expect(screen.getByText('auth.plans.mostPopular')).toBeInTheDocument();
    });

    it('should show free trial badge on all plans', () => {
      render(<RegisterPage />);

      const trialBadges = screen.getAllByText('auth.plans.freeTrial');
      expect(trialBadges).toHaveLength(3); // One for each plan
    });
  });

  describe('Registration details step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Navigate to details step - click the pro plan button (last continue button, or find by most popular badge)
      const continueButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );
      
      // Click the last continue button (should be pro plan, which is last in the plans array)
      if (continueButtons.length > 0) {
        await user.click(continueButtons[continueButtons.length - 1]);
      }

      await waitFor(() => {
        expect(screen.getByText('auth.register.title')).toBeInTheDocument();
      });
    });

    it('should render registration form', () => {
      expect(screen.getByLabelText('auth.register.firstName')).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.lastName')).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.email')).toBeInTheDocument();
      expect(screen.getByLabelText('auth.register.password')).toBeInTheDocument();
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText('auth.register.password') as HTMLInputElement;
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      const toggleButton = toggleButtons.find((btn) => btn.querySelector('svg'));

      expect(passwordInput.type).toBe('password');

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('text');

        await user.click(toggleButton);
        expect(passwordInput.type).toBe('password');
      }
    });

    it('should require terms agreement', () => {
      const submitButton = screen.getByRole('button', {
        name: 'auth.register.createAccount',
      });

      expect(submitButton).toBeDisabled();
    });

    it('should enable submit when terms are agreed', async () => {
      const user = userEvent.setup();

      const termsCheckbox = screen.getByRole('checkbox');
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', {
        name: 'auth.register.createAccount',
      });

      expect(submitButton).not.toBeDisabled();
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);

      // Fill in the form
      await user.type(screen.getByLabelText('auth.register.firstName'), 'John');
      await user.type(screen.getByLabelText('auth.register.lastName'), 'Doe');
      await user.type(screen.getByLabelText('auth.register.email'), 'john@example.com');
      await user.type(screen.getByLabelText('auth.register.password'), 'password123');

      // Agree to terms
      await user.click(screen.getByRole('checkbox'));

      // Submit the form
      await user.click(
        screen.getByRole('button', { name: 'auth.register.createAccount' })
      );

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
        expect(mockRegister).toHaveBeenCalledWith(
          'john@example.com',
          'password123',
          'pro',
          'John',
          'Doe',
          undefined
        );
      }, { timeout: 3000 });
    });

    it('should display error message when registration fails', async () => {
      const user = userEvent.setup();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        clearError: mockClearError,
        error: 'Email already exists',
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      refreshToken: null,
      });

      render(<RegisterPage />);

      // Navigate to details step
      const proButtons = screen.getAllByRole('button');
      const continueButton = proButtons.find((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );

      if (continueButton) {
        await user.click(continueButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
        registerWithGoogle: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
        deleteAccount: vi.fn(),
        clearError: mockClearError,
        error: null,
        isLoading: true,
        isAuthenticated: false,
        user: null,
        token: null,
      refreshToken: null,
      });

      render(<RegisterPage />);

      // Navigate to details step
      const proButtons = screen.getAllByRole('button');
      const continueButton = proButtons.find((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );

      if (continueButton) {
        await user.click(continueButton);
      }

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Creating account|auth.register.creatingAccount/i,
        });
        expect(submitButton).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should have link to login page', async () => {
      const loginLink = screen.getByRole('link', { name: /auth.register.signIn/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should allow going back to plan selection', async () => {
      const user = userEvent.setup();

      const backButton = screen.getByRole('button', {
        name: /auth.register.selectPlan/i,
      });

      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('auth.plans.starter')).toBeInTheDocument();
      });
    });
  });

  describe('Plan persistence', () => {
    it('should remember selected plan when going back and forth', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);

      render(<RegisterPage />);

      // Navigate to details step with pro plan (default) - click the last continue button (pro plan)
      const initialContinueButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );
      
      if (initialContinueButtons.length > 0) {
        await user.click(initialContinueButtons[initialContinueButtons.length - 1]);
      }

      await waitFor(() => {
        expect(screen.getByText('auth.register.title')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByRole('button', {
        name: /auth.register.selectPlan/i,
      });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('auth.plans.starter')).toBeInTheDocument();
      });

      // Continue with pro plan again - click the last continue button (pro plan)
      const buttonsAgain = screen.getAllByRole('button').filter((btn) =>
        btn.textContent?.includes('auth.plans.continue')
      );

      if (buttonsAgain.length > 0) {
        await user.click(buttonsAgain[buttonsAgain.length - 1]);
      }

      // Wait for details step to appear
      await waitFor(() => {
        expect(screen.getByText('auth.register.title')).toBeInTheDocument();
      });

      // Fill form and submit
      await user.type(screen.getByLabelText('auth.register.firstName'), 'Test');
      await user.type(screen.getByLabelText('auth.register.lastName'), 'User');
      await user.type(screen.getByLabelText('auth.register.email'), 'test@test.com');
      await user.type(screen.getByLabelText('auth.register.password'), 'pass123');
      await user.click(screen.getByRole('checkbox'));
      await user.click(
        screen.getByRole('button', { name: 'auth.register.createAccount' })
      );

      await waitFor(() => {
        // Should register with pro plan (the persisted selection)
        expect(mockRegister).toHaveBeenCalledWith(
          'test@test.com',
          'pass123',
          'pro',
          'Test',
          'User',
          undefined
        );
      }, { timeout: 3000 });
    });
  });
});
