"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Check, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Input, Label } from "@/components/atoms";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { locales, type Locale } from "@/i18n/config";

const plans = [
  {
    id: "starter",
    price: "€0",
    featureKeys: [
      "auth.plans.features.starter.invoices",
      "auth.plans.features.starter.reporting",
      "auth.plans.features.starter.support",
    ],
  },
  {
    id: "plus",
    price: "€4.99",
    featureKeys: [
      "auth.plans.features.plus.invoices",
      "auth.plans.features.plus.bankSync",
      "auth.plans.features.plus.reporting",
      "auth.plans.features.plus.support",
    ],
  },
  {
    id: "pro",
    price: "€7.99",
    featureKeys: [
      "auth.plans.features.pro.invoices",
      "auth.plans.features.pro.bankSync",
      "auth.plans.features.pro.reporting",
      "auth.plans.features.pro.vat",
      "auth.plans.features.pro.support",
      "auth.plans.features.pro.elster",
    ],
    popular: true,
  },
];

export default function RegisterPage() {
  const t = useTranslations();
  const { register, registerWithGoogle, error, clearError, isLoading } = useAuth();
  const searchParams = useSearchParams();

  // Initialize selectedPlan from URL parameter
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const planParam = searchParams.get("plan");
    const validPlans = ["starter", "plus", "pro"];
    return planParam && validPlans.includes(planParam) ? planParam : "pro";
  });

  // Initialize step - skip to details if a valid plan is provided in URL
  const [step, setStep] = useState<"plan" | "details">(() => {
    const planParam = searchParams.get("plan");
    const validPlans = ["starter", "plus", "pro"];
    return planParam && validPlans.includes(planParam) ? "details" : "plan";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  // Handle language from URL parameter
  useEffect(() => {
    const langParam = searchParams.get("language") || searchParams.get("lang");
    if (langParam && locales.includes(langParam as Locale)) {
      // Check if cookie is already set to avoid infinite reload
      const currentLocale = document.cookie
        .split("; ")
        .find((row) => row.startsWith("locale="))
        ?.split("=")[1];

      if (currentLocale !== langParam) {
        // Set locale cookie for immediate language switching
        document.cookie = `locale=${langParam}; path=/; max-age=31536000; SameSite=Lax`;
        // Force page reload to apply new language
        window.location.reload();
      }
    }
  }, [searchParams]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const langParam = searchParams.get("language") || searchParams.get("lang");
    const language = langParam && locales.includes(langParam as Locale) ? langParam : undefined;

    try {
      await register(formData.email, formData.password, selectedPlan, formData.firstName, formData.lastName, language);
      // Redirect is handled by the auth context
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleGoogleSignUp = async (credential: string) => {
    clearError();
    try {
      const langParam = searchParams.get("language") || searchParams.get("lang");
      const language = langParam && locales.includes(langParam as Locale) ? langParam : undefined;

      await registerWithGoogle(credential, selectedPlan, language);
    } catch {
      // Error handled by auth context
    }
  };

  if (step === "plan") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-5xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo/logo.svg"
              alt="Solobooks"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
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

                <ul className="space-y-3 grow mb-6">
                  {plan.featureKeys.map((featureKey, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-600">{t(featureKey)}</span>
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
          <Image
            src="/images/logo/logo.svg"
            alt="Solobooks"
            width={160}
            height={40}
            priority
            className="h-10 w-auto"
          />
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
            <GoogleSignInButton
              onSuccess={handleGoogleSignUp}
              text="signup"
              disabled={isLoading}
            />

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
