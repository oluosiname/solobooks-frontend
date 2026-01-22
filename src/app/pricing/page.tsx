"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout";
import { PricingContent } from "@/components/pricing/PricingContent";

export default function PricingPage() {
  const t = useTranslations();
  
  // TODO: Replace with API call when ready
  // const { data: pricingData, isLoading } = useQuery({
  //   queryKey: ["pricing"],
  //   queryFn: api.getPricing,
  // });

  return (
    <AppShell title={t("pricing.title")}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PricingContent showTrialInfo={true} />
      </div>
    </AppShell>
  );
}
