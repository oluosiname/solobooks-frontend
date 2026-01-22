// Pricing types based on /api/v1/pricing endpoint response

export interface LocalizedString {
  en: string;
  de: string;
}

export interface FeatureLimit {
  value: number;
  period: "month" | "lifetime";
  unit: string;
}

export interface PlanFeature {
  key: string;
  name: LocalizedString;
  limited: boolean;
  limit?: FeatureLimit;
  description?: LocalizedString;
}

export interface PlanLimitation {
  key: string;
  description: LocalizedString;
  value?: number;
  period?: "month" | "lifetime";
}

export interface PlanPrice {
  en: string;
  de: string;
  amount: number;
  currency: string;
  billing_period: string;
}

export interface PricingPlan {
  key: string;
  name: LocalizedString;
  price: PlanPrice;
  target_audience: LocalizedString;
  features: PlanFeature[];
  limitations: PlanLimitation[];
  use_case: LocalizedString;
  upgrade_path?: LocalizedString;
  requirements?: LocalizedString;
  trial_access: boolean;
  requires_payment: boolean;
  is_default?: boolean;
  stripe_price_id: string;
  amount_cents: number;
  currency: string;
  name_localized: string;
  price_localized: string;
}

export interface TrialInfo {
  duration_days: number;
  plan_access: string;
  description: LocalizedString;
  trial_end_behavior: {
    with_payment_plus_pro: LocalizedString;
    without_payment_plus_pro: LocalizedString;
    starter_or_none: LocalizedString;
  };
}

export interface PlanSwitching {
  allowed_upgrades: string[];
  not_allowed: string[];
  during_trial: LocalizedString;
}

export interface PricingMetadata {
  version: string;
  last_updated: string;
  currency: string;
  supported_languages: string[];
  default_plan: string;
  free_tier: string;
}

export interface PricingData {
  plans: {
    starter: PricingPlan;
    plus: PricingPlan;
    pro: PricingPlan;
  };
  trial: TrialInfo;
  plan_switching: PlanSwitching;
  feature_categories: Record<string, string[]>;
  metadata: PricingMetadata;
}

export interface PricingResponse {
  data: PricingData;
}
