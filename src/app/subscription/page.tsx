"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CreditCard, Check, Info, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Card } from "@/components/atoms";
import { AlertBanner } from "@/components/organisms";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const getPlanFeatures = (t: any) => [
  {
    id: "free",
    nameKey: "subscription.plans.free.name",
    priceKey: "subscription.plans.free.price",
    descriptionKey: "subscription.plans.free.description",
    priceDetail: "",
    features: [
      t("subscription.features.manualIncomeExpenses"),
      t("subscription.features.invoicing"),
      t("subscription.features.pdfDownloads"),
    ],
  },
  {
    id: "pro",
    nameKey: "subscription.plans.pro.name",
    priceKey: "subscription.plans.pro.price",
    descriptionKey: "subscription.plans.pro.description",
    priceDetail: ` ${t("subscription.billingCycle")}`,
    features: [
      t("subscription.features.bankSync"),
      t("subscription.features.exportForSteuerberater"),
      t("subscription.features.vatCsv"),
      t("subscription.features.everythingInFree"),
    ],
    popular: true,
  },
  {
    id: "business",
    nameKey: "subscription.plans.business.name",
    priceKey: "subscription.plans.business.price",
    descriptionKey: "subscription.plans.business.description",
    priceDetail: ` ${t("subscription.billingCycle")}`,
    features: [
      t("subscription.features.everythingInPro"),
      t("subscription.features.vatReminders"),
      t("subscription.features.prioritySupport"),
      t("subscription.features.customReports"),
    ],
  },
];

export default function SubscriptionPage() {
  const t = useTranslations();

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: api.fetchSubscription,
  });

  const { data: paymentMethod } = useQuery({
    queryKey: ["paymentMethod"],
    queryFn: api.fetchPaymentMethod,
  });

  const currentPlan = subscription?.plan || "free";
  const plans = getPlanFeatures(t);

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
                      {t("subscription.expires")} {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-slate-700">{t("subscription.noPaymentMethod")}</p>
                  <p className="text-sm text-slate-500">
                    {t("subscription.addPaymentMethodDescription")}
                  </p>
                </div>
              )}
            </div>
            <Button variant="secondary">
              <CreditCard className="h-4 w-4" />
              {paymentMethod ? t("subscription.updatePaymentMethod") : t("subscription.addPaymentMethod")}
            </Button>
          </div>
        </Card>

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative p-6 transition-all",
                  plan.popular && "ring-2 ring-indigo-500",
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
                  {t(plan.nameKey)}
                </h3>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {t(plan.priceKey)}
                  </span>
                  {plan.priceDetail && (
                    <span className="text-slate-500">{plan.priceDetail}</span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  className="mt-6 w-full"
                  disabled={isCurrent}
                >
                  {isCurrent
                    ? t("subscription.currentPlan")
                    : t("subscription.changePlan")}
                </Button>
              </Card>
            );
          })}
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
