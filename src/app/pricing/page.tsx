"use client";

import { AppShell } from "@/components/layout";
import { PricingContent } from "@/components/pricing/PricingContent";
import type { PricingData } from "@/types/pricing";

export default function PricingPage() {
  // TODO: Replace with API call when ready
  // const { data: pricingData, isLoading } = useQuery({
  //   queryKey: ["pricing"],
  //   queryFn: api.getPricing,
  // });

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PricingContent showTrialInfo={true} />
      </div>
    </AppShell>
  );
}
