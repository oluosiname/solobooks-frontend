"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CreditCard, Plus, Edit } from "lucide-react";
import { Button, Card } from "@/components/atoms";
import { api } from "@/services/api";
import { showToast } from "@/lib/toast";
import { PaymentMethodForm } from "./PaymentMethodForm";

export function PaymentSettings() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: paymentMethod } = useQuery({
    queryKey: ["paymentMethod"],
    queryFn: api.fetchPaymentMethod,
  });

  const handleSuccess = () => {
    setShowPaymentForm(false);
    queryClient.invalidateQueries({ queryKey: ["paymentMethod"] });
    showToast.success("Payment method saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {t("settings.tabs.payment")}
        </h2>
        <p className="text-sm text-slate-500">
          Manage your payment method for subscriptions and billing
        </p>
      </div>

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
            {paymentMethod ? (
              <>
                <Edit className="h-4 w-4" />
                {t("subscription.updatePaymentMethod")}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t("subscription.addPaymentMethod")}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Payment Modal */}
      {showPaymentForm && (
        <PaymentMethodForm
          onSuccess={handleSuccess}
          onCancel={() => setShowPaymentForm(false)}
          isUpdate={!!paymentMethod}
        />
      )}
    </div>
  );
}