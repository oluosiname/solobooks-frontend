"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/atoms";
import { PricingContent } from "./PricingContent";
import type { PricingData } from "@/types/pricing";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricingData?: PricingData;
  onSelectPlan?: (planKey: string) => void;
}

export function PricingModal({
  open,
  onOpenChange,
  pricingData,
  onSelectPlan,
}: PricingModalProps) {
  const t = useTranslations("pricing");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2
            id="pricing-modal-title"
            className="text-2xl font-semibold text-slate-900"
          >
            {t("title")}
          </h2>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            aria-label="Close pricing modal"
            className="text-slate-600 hover:text-slate-900 p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <PricingContent
            pricingData={pricingData}
            onSelectPlan={(planKey) => {
              onSelectPlan?.(planKey);
              onOpenChange(false);
            }}
            showTrialInfo={true}
          />
        </div>
      </div>
    </div>
  );
}
