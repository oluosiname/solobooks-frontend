"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Calculator, Check, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button, Card, Input, Label } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    id: "starter",
    price: "€0",
    features: [
      "Up to 5 invoices per month",
      "Basic reporting",
      "Email support",
    ],
  },
  {
    id: "plus",
    price: "€4.99",
    features: [
      "Up to 20 invoices per month",
      "Bank sync",
      "Advanced reporting",
      "Priority support",
    ],
  },
  {
    id: "pro",
    price: "€7.99",
    features: [
      "Unlimited invoices",
      "Bank sync",
      "Advanced reporting",
      "VAT automation",
      "Priority support",
      "Elster integration",
    ],
    popular: true,
  },
];

export default function RegisterPage() {
  const t = useTranslations();
  const { register, error, clearError, isLoading } = useAuth();
  const [step, setStep] = useState<"plan" | "details">("plan");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register(formData.email, formData.password, selectedPlan, formData.firstName, formData.lastName);
      // Redirect is handled by the auth context
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleGoogleSignUp = () => {
    // Handle Google OAuth sign up
    console.log("Google sign up");
  };

  if (step === "plan") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("auth.register.selectPlan")}
            </h1>
            <p className="mt-2 text-slate-600">
              {t("auth.register.planSubtitle")}
            </p>
          </div>

          {/* Plans */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative p-8 transition-all hover:shadow-lg flex flex-col",
                  selectedPlan === plan.id && "ring-2 ring-indigo-500",
                  plan.popular && "border-indigo-200"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                      <Sparkles className="h-3 w-3" />
                      {t("auth.plans.mostPopular")}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {t(`auth.plans.${plan.id}`)}
                  </h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-slate-600">
                      {" "}
                      {t("auth.plans.perMonth")}
                    </span>
                  </div>
                </div>

                {/* Free Trial Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("auth.plans.freeTrial")}
                  </span>
                </div>

                <ul className="space-y-3 flex-grow mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full mt-auto"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {t("auth.plans.continue", { plan: t(`auth.plans.${plan.id}`) })}
                </Button>
              </Card>
            ))}
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            {t("auth.register.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t("auth.register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
            <Calculator className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("auth.register.title")}
          </h1>
          <p className="mt-2 text-slate-600">{t("auth.register.subtitle")}</p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.register.signUpWithGoogle")}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  {t("auth.register.or")}
                </span>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t("auth.register.firstName")}</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t("auth.register.lastName")}</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">{t("auth.register.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                className="mt-1.5"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">{t("auth.register.password")}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={t("auth.register.passwordPlaceholder")}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                id="agree-terms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                required
              />
              <label htmlFor="agree-terms" className="ml-2 text-sm text-slate-600">
                {t("auth.register.agreeToTerms")}{" "}
                <Link
                  href="/terms"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {t("auth.register.termsOfService")}
                </Link>{" "}
                {t("auth.register.and")}{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {t("auth.register.privacyPolicy")}
                </Link>
              </label>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!formData.agreeToTerms || isLoading}
            >
              {isLoading ? t("auth.register.creatingAccount") || "Creating account..." : t("auth.register.createAccount")}
            </Button>
          </form>
        </Card>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t("auth.register.signIn")}
          </Link>
        </p>

        {/* GDPR Notice */}
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <span className="text-blue-600">🇪🇺</span>
          {t("auth.register.gdprCompliant")}
        </p>

        {/* Back to Plan Selection */}
        <button
          onClick={() => setStep("plan")}
          className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← {t("auth.register.selectPlan")}
        </button>
      </div>
    </div>
  );
}
