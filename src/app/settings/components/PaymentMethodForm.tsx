"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Clock } from "lucide-react";
import { Button, Card } from "@/components/atoms";
import { paymentMethodApi } from "@/lib/payment-method-api";
import { showToast } from "@/lib/toast";

// Initialize Stripe (only if key is available)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isUpdate?: boolean;
}

function PaymentForm({
  onSuccess,
  onCancel,
  isUpdate,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentMethodApi.confirmPaymentMethod({
        payment_method_id: paymentMethodId,
      }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: unknown) => {
      showToast.apiError(error, "Failed to save payment method");
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      showToast.error(error.message || "Payment method setup failed");
      setIsProcessing(false);
      return;
    }

    if (setupIntent?.status === "succeeded") {
      confirmMutation.mutate(setupIntent.payment_method as string);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {isUpdate ? "Update Card" : "Add Payment Method"}
              </h3>
              <p className="text-sm text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Show spinner until Stripe is ready */}
          {!stripe || !elements ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            /* Stripe Payment Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card"],
                }}
              />

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!stripe || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Save Card"
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                We will never charge you without your approval
              </p>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
  isUpdate = false,
}: PaymentMethodFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await paymentMethodApi.createSetupIntent();
        setClientSecret(response.data.client_secret);
      } catch {
        showToast.error("Failed to initialize payment form");
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    createSetupIntent();
  }, [onCancel]);

  // Check if Stripe is properly configured
  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Configuration Error
            </h3>
            <p className="text-gray-500 mb-4">
              Stripe is not properly configured. Please contact support or check
              your environment configuration.
            </p>
            <Button onClick={onCancel} variant="secondary">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        isUpdate={isUpdate}
      />
    </Elements>
  );
}
