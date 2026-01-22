"use client";

import { useTranslations, useLocale } from "next-intl";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/atoms";
import { Button } from "@/components/atoms";
import type { PricingData, PricingPlan } from "@/types/pricing";

// Static pricing data - will be replaced with API call later
const staticPricingData: PricingData = {
  plans: {
    starter: {
      key: "starter",
      name: {
        en: "Starter",
        de: "Starter",
      },
      price: {
        en: "FREE",
        de: "KOSTENLOS",
        amount: 0,
        currency: "EUR",
        billing_period: "month",
      },
      target_audience: {
        en: "New freelancers who want to try the platform or have minimal needs",
        de: "Neue Freelancer, die die Plattform ausprobieren möchten oder minimale Anforderungen haben",
      },
      features: [
        {
          key: "manual_income_expenses",
          name: {
            en: "Manual income & expenses tracking",
            de: "Manuelle Einnahmen & Ausgaben",
          },
          limited: true,
          limit: {
            value: 10,
            period: "month",
            unit: "transactions",
          },
        },
        {
          key: "invoicing",
          name: {
            en: "Invoicing capabilities",
            de: "Rechnungserstellung",
          },
          limited: true,
          limit: {
            value: 5,
            period: "month",
            unit: "invoices",
          },
        },
        {
          key: "pdf_downloads",
          name: {
            en: "PDF downloads",
            de: "PDF-Downloads",
          },
          limited: false,
        },
        {
          key: "client_management",
          name: {
            en: "Client management",
            de: "Kundenverwaltung",
          },
          limited: true,
          limit: {
            value: 3,
            period: "lifetime",
            unit: "clients",
          },
        },
        {
          key: "basic_financial_tracking",
          name: {
            en: "Basic financial tracking",
            de: "Grundlegende Finanzverfolgung",
          },
          limited: false,
        },
      ],
      limitations: [
        {
          key: "invoice_limit",
          description: {
            en: "Maximum 5 invoices per month",
            de: "Maximal 5 Rechnungen pro Monat",
          },
          value: 5,
          period: "month",
        },
        {
          key: "transaction_limit",
          description: {
            en: "Maximum 10 income/expense transactions per month",
            de: "Maximal 10 Einnahmen-/Ausgabentransaktionen pro Monat",
          },
          value: 10,
          period: "month",
        },
        {
          key: "client_limit",
          description: {
            en: "Maximum 3 clients",
            de: "Maximal 3 Kunden",
          },
          value: 3,
          period: "lifetime",
        },
        {
          key: "no_bank_sync",
          description: {
            en: "No bank sync",
            de: "Keine Banksynchronisation",
          },
        },
        {
          key: "no_automated_exports",
          description: {
            en: "No automated exports",
            de: "Keine automatisierten Exporte",
          },
        },
        {
          key: "no_vat_submission",
          description: {
            en: "No VAT submission",
            de: "Keine USt-Einreichung",
          },
        },
        {
          key: "no_priority_support",
          description: {
            en: "No priority support",
            de: "Kein Prioritäts-Support",
          },
        },
      ],
      use_case: {
        en: "Perfect for freelancers testing the platform or with very minimal invoicing needs. Users can upgrade anytime to remove limitations.",
        de: "Perfekt für Freelancer, die die Plattform testen oder sehr minimale Rechnungsanforderungen haben. Benutzer können jederzeit upgraden, um Einschränkungen zu entfernen.",
      },
      upgrade_path: {
        en: "Users see upgrade prompts when they hit limits or try to access premium features.",
        de: "Benutzer sehen Upgrade-Aufforderungen, wenn sie Limits erreichen oder versuchen, auf Premium-Funktionen zuzugreifen.",
      },
      trial_access: true,
      requires_payment: false,
      stripe_price_id: "price_1SngyxB2V4eEl2hLGsNHuQLN",
      amount_cents: 0,
      currency: "euro",
      name_localized: "Starter",
      price_localized: "FREE",
    },
    plus: {
      key: "plus",
      name: {
        en: "Plus",
        de: "Plus",
      },
      price: {
        en: "€4.99 / month",
        de: "4,99 € pro Monat",
        amount: 4.99,
        currency: "EUR",
        billing_period: "month",
      },
      target_audience: {
        en: "Established freelancers who want to automate their financial tracking",
        de: "Etablierte Freelancer, die ihre Finanzverfolgung automatisieren möchten",
      },
      features: [
        {
          key: "all_starter_features",
          name: {
            en: "Everything in Starter (unlimited)",
            de: "Alles aus Starter (unbegrenzt)",
          },
          limited: false,
        },
        {
          key: "unlimited_invoices",
          name: {
            en: "Unlimited invoices",
            de: "Unbegrenzte Rechnungen",
          },
          limited: false,
        },
        {
          key: "unlimited_income_expenses",
          name: {
            en: "Unlimited income & expenses",
            de: "Unbegrenzte Einnahmen & Ausgaben",
          },
          limited: false,
        },
        {
          key: "unlimited_clients",
          name: {
            en: "Unlimited clients",
            de: "Unbegrenzte Kunden",
          },
          limited: false,
        },
        {
          key: "bank_sync",
          name: {
            en: "Bank sync (automatic transaction import via GoCardless)",
            de: "Banksynchronisation (automatischer Transaktionsimport über GoCardless)",
          },
          limited: false,
          description: {
            en: "Connecting bank accounts for automatic transaction sync",
            de: "Bankkonten für automatische Transaktionssynchronisation verbinden",
          },
        },
        {
          key: "tax_advisor_export",
          name: {
            en: "Export for Steuerberater (tax advisor export)",
            de: "Export für Steuerberater",
          },
          limited: false,
          description: {
            en: "Exporting data in formats suitable for tax advisors",
            de: "Exportieren von Daten in Formaten, die für Steuerberater geeignet sind",
          },
        },
        {
          key: "vat_csv_export",
          name: {
            en: "VAT CSV export",
            de: "USt CSV Export",
          },
          limited: false,
          description: {
            en: "Generating VAT-specific CSV files",
            de: "Generierung von USt-spezifischen CSV-Dateien",
          },
        },
        {
          key: "transaction_import",
          name: {
            en: "Transaction import (CSV/XLSX)",
            de: "Transaktionsimport (CSV/XLSX)",
          },
          limited: false,
        },
      ],
      limitations: [],
      use_case: {
        en: "Ideal for freelancers who want to save time by automatically importing bank transactions and need professional tax reporting capabilities.",
        de: "Ideal für Freelancer, die Zeit sparen möchten, indem sie Banktransaktionen automatisch importieren und professionelle Steuerberichterstattungsfunktionen benötigen.",
      },
      requirements: {
        en: "Billing information must be set up before trial ends to maintain access. Payment method required for activation.",
        de: "Zahlungsinformationen müssen vor Ablauf der Testphase eingerichtet werden, um den Zugang aufrechtzuerhalten. Zahlungsmethode für die Aktivierung erforderlich.",
      },
      trial_access: true,
      requires_payment: true,
      stripe_price_id: "price_1Sk4sCB2V4eEl2hL9BtHhZHZ",
      amount_cents: 499,
      currency: "euro",
      name_localized: "Plus",
      price_localized: "€4.99 / month",
    },
    pro: {
      key: "pro",
      name: {
        en: "Pro",
        de: "Pro",
      },
      price: {
        en: "€7.99 / month",
        de: "7,99 € pro Monat",
        amount: 7.99,
        currency: "EUR",
        billing_period: "month",
      },
      target_audience: {
        en: "Professional freelancers and solo entrepreneurs who need advanced features and priority support",
        de: "Professionelle Freelancer und Solo-Unternehmer, die erweiterte Funktionen und Prioritäts-Support benötigen",
      },
      features: [
        {
          key: "all_plus_features",
          name: {
            en: "Everything in Plus",
            de: "Alles aus Plus",
          },
          limited: false,
        },
        {
          key: "vat_reminders",
          name: {
            en: "VAT reminders (automated reminders for VAT filing deadlines)",
            de: "USt-Erinnerungen (automatisierte Erinnerungen für USt-Einreichungsfristen)",
          },
          limited: false,
          description: {
            en: "Automated reminders for VAT filing deadlines",
            de: "Automatisierte Erinnerungen für USt-Einreichungsfristen",
          },
        },
        {
          key: "priority_support",
          name: {
            en: "Priority support (faster response times)",
            de: "Prioritäts-Support (schnellere Antwortzeiten)",
          },
          limited: false,
          description: {
            en: "Faster response times from the support team",
            de: "Schnellere Antwortzeiten vom Support-Team",
          },
        },
        {
          key: "vat_submission",
          name: {
            en: "VAT submission (direct Elster integration for German VAT filing)",
            de: "USt-Einreichung (direkte Elster-Integration für deutsche USt-Einreichung)",
          },
          limited: false,
          description: {
            en: "Direct Elster integration for German VAT filing",
            de: "Direkte Elster-Integration für deutsche USt-Einreichung",
          },
        },
        {
          key: "advanced_reporting",
          name: {
            en: "Advanced reporting",
            de: "Erweiterte Berichterstattung",
          },
          limited: false,
        },
        {
          key: "bank_sync_auto_categorization",
          name: {
            en: "Bank sync with automatic categorization",
            de: "Banksynchronisation mit automatischer Kategorisierung",
          },
          limited: false,
        },
      ],
      limitations: [],
      use_case: {
        en: "Best for users who need proactive VAT management, want faster support response times, and need direct tax submission capabilities.",
        de: "Am besten für Benutzer, die proaktives USt-Management benötigen, schnellere Support-Antwortzeiten wünschen und direkte Steuereinreichungsfunktionen benötigen.",
      },
      requirements: {
        en: "Billing information must be set up before trial ends to maintain access. Payment method required for activation.",
        de: "Zahlungsinformationen müssen vor Ablauf der Testphase eingerichtet werden, um den Zugang aufrechtzuerhalten. Zahlungsmethode für die Aktivierung erforderlich.",
      },
      trial_access: true,
      requires_payment: true,
      is_default: true,
      stripe_price_id: "price_1SU68gB2V4eEl2hLkGZa3Y7z",
      amount_cents: 799,
      currency: "euro",
      name_localized: "Pro",
      price_localized: "€7.99 / month",
    },
  },
  trial: {
    duration_days: 14,
    plan_access: "pro",
    description: {
      en: "All new users automatically receive a 14-day Pro trial when they register. During the trial, users have full access to Pro features regardless of their plan selection. No payment is required during the trial period.",
      de: "Alle neuen Benutzer erhalten automatisch eine 14-tägige Pro-Testversion bei der Registrierung. Während der Testphase haben Benutzer vollen Zugriff auf Pro-Funktionen, unabhängig von ihrer Planauswahl. Während der Testphase ist keine Zahlung erforderlich.",
    },
    trial_end_behavior: {
      with_payment_plus_pro: {
        en: "Subscription automatically activates with selected plan. Billing begins after the 14-day trial period.",
        de: "Abonnement wird automatisch mit dem ausgewählten Plan aktiviert. Die Abrechnung beginnt nach der 14-tägigen Testphase.",
      },
      without_payment_plus_pro: {
        en: "User is downgraded to free Starter tier. Access to Pro features is removed. Starter tier limitations apply.",
        de: "Benutzer wird auf die kostenlose Starter-Stufe herabgestuft. Der Zugriff auf Pro-Funktionen wird entfernt. Starter-Stufen-Einschränkungen gelten.",
      },
      starter_or_none: {
        en: "User automatically continues on free Starter tier. No payment required.",
        de: "Benutzer setzt automatisch auf der kostenlosen Starter-Stufe fort. Keine Zahlung erforderlich.",
      },
    },
  },
  plan_switching: {
    allowed_upgrades: ["starter → plus", "starter → pro", "plus → pro"],
    not_allowed: ["plus → starter", "pro → plus", "pro → starter"],
    during_trial: {
      en: "Users can switch between any plans during trial period. Changes update the plan that will activate after trial. Trial access remains Pro features regardless of change.",
      de: "Benutzer können während der Testphase zwischen beliebigen Plänen wechseln. Änderungen aktualisieren den Plan, der nach der Testphase aktiviert wird. Der Testzugriff bleibt unabhängig von der Änderung bei Pro-Funktionen.",
    },
  },
  feature_categories: {
    core: [
      "manual_income_expenses",
      "invoicing",
      "pdf_downloads",
      "client_management",
      "basic_financial_tracking",
    ],
    automation: [
      "bank_sync",
      "bank_sync_auto_categorization",
      "transaction_import",
    ],
    export: ["tax_advisor_export", "vat_csv_export"],
    vat_management: ["vat_reminders", "vat_submission"],
    support: ["priority_support"],
    reporting: ["advanced_reporting"],
  },
  metadata: {
    version: "1.0.0",
    last_updated: "2025-01-27",
    currency: "EUR",
    supported_languages: ["en", "de"],
    default_plan: "pro",
    free_tier: "starter",
  },
};

interface PricingContentProps {
  pricingData?: PricingData;
  onSelectPlan?: (planKey: string) => void;
  showTrialInfo?: boolean;
}

export function PricingContent({
  pricingData = staticPricingData,
  onSelectPlan,
  showTrialInfo = true,
}: PricingContentProps) {
  const t = useTranslations("pricing");
  const locale = useLocale() as "en" | "de";

  const getLocalizedString = (obj: { en: string; de: string }) => {
    return obj[locale] || obj.en;
  };

  const plans = [
    pricingData.plans.starter,
    pricingData.plans.plus,
    pricingData.plans.pro,
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Trial Info Banner */}
      {showTrialInfo && (
        <div className="mb-8 rounded-lg bg-indigo-50 border border-indigo-200 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-sm font-semibold text-white">14</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                {t("trial.title")}
              </h3>
              <p className="text-sm text-indigo-800">
                {getLocalizedString(pricingData.trial.description)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <PricingPlanCard
            key={plan.key}
            plan={plan}
            locale={locale}
            getLocalizedString={getLocalizedString}
            onSelectPlan={onSelectPlan}
            isDefault={plan.is_default}
          />
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          {t("featureComparison.title")}
        </h2>
        <div className="overflow-x-auto">
          <FeatureComparisonTable
            plans={plans}
            locale={locale}
            getLocalizedString={getLocalizedString}
          />
        </div>
      </div>
    </div>
  );
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  locale: "en" | "de";
  getLocalizedString: (obj: { en: string; de: string }) => string;
  onSelectPlan?: (planKey: string) => void;
  isDefault?: boolean;
}

function PricingPlanCard({
  plan,
  locale,
  getLocalizedString,
  onSelectPlan,
  isDefault,
}: PricingPlanCardProps) {
  const t = useTranslations("pricing");

  return (
    <Card
      className={`relative ${
        isDefault
          ? "ring-2 ring-indigo-600 shadow-lg scale-105"
          : "hover:shadow-md transition-shadow"
      }`}
    >
      {isDefault && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            {t("popular")}
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {getLocalizedString(plan.name)}
        </h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-slate-900">
            {getLocalizedString(plan.price)}
          </span>
        </div>
        <p className="text-sm text-slate-600 min-h-[3rem]">
          {getLocalizedString(plan.target_audience)}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            {t("features")}
          </h4>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature.key} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">
                  {getLocalizedString(feature.name)}
                  {feature.limited && feature.limit && (
                    <span className="text-slate-500 ml-1">
                      ({feature.limit.value}/{feature.limit.period})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        {plan.limitations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              {t("limitations")}
            </h4>
            <ul className="space-y-2">
              {plan.limitations.map((limitation) => (
                <li key={limitation.key} className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">
                    {getLocalizedString(limitation.description)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {onSelectPlan && (
          <Button
            variant={isDefault ? "primary" : "secondary"}
            size="lg"
            className="w-full"
            onClick={() => onSelectPlan(plan.key)}
          >
            {t("selectPlan", { plan: getLocalizedString(plan.name) })}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface FeatureComparisonTableProps {
  plans: PricingPlan[];
  locale: "en" | "de";
  getLocalizedString: (obj: { en: string; de: string }) => string;
}

function FeatureComparisonTable({
  plans,
  locale,
  getLocalizedString,
}: FeatureComparisonTableProps) {
  const t = useTranslations("pricing");

  // Get all unique features across all plans
  const allFeatures = new Set<string>();
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      allFeatures.add(feature.key);
    });
  });

  const featureList = Array.from(allFeatures);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              {t("featureComparison.feature")}
            </th>
            {plans.map((plan) => (
              <th
                key={plan.key}
                className="px-6 py-4 text-center text-sm font-semibold text-slate-900"
              >
                {getLocalizedString(plan.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureList.map((featureKey) => {
            const featureInPlans = plans.map((plan) => {
              const feature = plan.features.find((f) => f.key === featureKey);
              return feature ? { plan, feature } : null;
            });

            return (
              <tr
                key={featureKey}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-sm text-slate-700">
                  {featureInPlans.find((f) => f)?.feature
                    ? getLocalizedString(
                        featureInPlans.find((f) => f)!.feature.name
                      )
                    : featureKey}
                </td>
                {plans.map((plan) => {
                  const hasFeature = plan.features.some(
                    (f) => f.key === featureKey
                  );
                  return (
                    <td key={plan.key} className="px-6 py-4 text-center">
                      {hasFeature ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
