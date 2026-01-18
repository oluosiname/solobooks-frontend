"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CreditCard, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card } from "@/components/atoms";
import { AlertBanner } from "@/components/organisms";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { PaymentMethodForm } from "@/app/settings/components/PaymentMethodForm";
import { showToast } from "@/lib/toast";
import type { Plan, Subscription, PaymentMethod } from "@/types";

// UI Plan type for the component
interface UIPlan {
  id: string;
  name: string;
  price: string;
  priceDetail: string;
  features: string[];
  popular: boolean;
}

// Translation function type from next-intl
type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

// Map API plan data to UI format
const mapPlanToUI = (
  plan: Plan,
  t: TranslationFunction,
  isPopular: boolean,
  isFirst: boolean
): UIPlan => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  priceDetail:
    plan.price.includes("/ month") || isFirst
      ? ""
      : ` ${t("subscription.billingCycle")}`,
  features: plan.features,
  popular: isPopular,
});

export default function SubscriptionPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: api.fetchSubscription,
  });

  const { data: paymentMethod } = useQuery<PaymentMethod | null>({
    queryKey: ["paymentMethod"],
    queryFn: api.fetchPaymentMethod,
  });

  const { data: plansData } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: api.fetchPlans,
  });

  const currentPlan = subscription?.plan || "free";

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    queryClient.invalidateQueries({ queryKey: ["paymentMethod"] });
    showToast.success("Payment method saved successfully");
  };

  const handleChangePlan = async (newPlanId: string) => {
    try {
      if (!paymentMethod) {
        // Flow 2: No payment method - show payment form first
        setShowPaymentForm(true);
        showToast.success(t("subscription.addPaymentMethodToSubscribe"));
        return;
      }

      // Flow 1: Has payment method - change plan directly
      await api.updateSubscription({ plan: newPlanId });

      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      showToast.success(t("subscription.planChangedSuccessfully"));
    } catch (error: unknown) {
      console.error("Failed to change plan:", error);

      // Handle specific plan change restrictions
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("downgrade") || errorMessage.includes("not allowed")) {
        showToast.error(t("subscription.planChangeNotAllowed"));
      } else {
        showToast.error(t("subscription.planChangeFailed"));
      }
    }
  };

  // Map API plans to UI format, marking the most expensive as popular
  const plans: UIPlan[] = plansData
    ? plansData.map((plan, index) => {
        const isPopular =
          plansData.length > 1 && index === plansData.length - 1; // Mark last plan as popular
        const isFirst = index === 0; // Mark first plan as starter
        return mapPlanToUI(plan, t, isPopular, isFirst);
      })
    : [];

  return (
    <AppShell title={t("subscription.title")}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {t("subscription.title")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("subscription.currentPlan")}:{" "}
            <span className="font-medium capitalize">{currentPlan}</span>
          </p>
        </div>

        {/* Payment Method */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("subscription.paymentMethod")}
              </h3>
              {paymentMethod ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("subscription.expires")} {paymentMethod.expMonth}/
                      {paymentMethod.expYear}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-slate-700">
                    {t("subscription.noPaymentMethod")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("subscription.addPaymentMethodDescription")}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowPaymentForm(true)}
            >
              <CreditCard className="h-4 w-4" />
              {paymentMethod
                ? t("subscription.updatePaymentMethod")
                : t("subscription.addPaymentMethod")}
            </Button>
          </div>
        </Card>

        {/* Payment Modal */}
        {showPaymentForm && (
          <PaymentMethodForm
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
            isUpdate={!!paymentMethod}
          />
        )}

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.length > 0 ? (
            plans.map((plan, index) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative p-6 transition-all",
                    isCurrent && "bg-indigo-50/50"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                        <Sparkles className="h-3 w-3" />
                        {t("subscription.popular")}
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="mb-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
                      <Check className="h-4 w-4" />
                      {t("subscription.currentPlan")}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-slate-900">
                    {plan.name}
                  </h3>

                  <div className="mt-4">
                    <span className="text-3xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    {plan.priceDetail && (
                      <span className="text-slate-500">{plan.priceDetail}</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-sm text-slate-600">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? "secondary" : "primary"}
                    className="mt-6 w-full"
                    disabled={isCurrent}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {isCurrent
                      ? t("subscription.currentPlan")
                      : t("subscription.changePlan")}
                  </Button>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-600">
                  {t("common.loading") || "Loading plans..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <AlertBanner
          variant="info"
          title={t("subscription.flexibleBillingTitle")}
          message={t("subscription.flexibleBillingMessage")}
        />
      </div>
    </AppShell>
  );
}
