"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Search, Check, Shield, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input, Card } from "@/components/atoms";
import { api } from "@/services/api";
import { Bank } from "@/types";
import { showToast } from "@/lib/toast";

export default function AddBankConnectionPage() {
  const router = useRouter();
  const t = useTranslations();
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: banks, isLoading } = useQuery({
    queryKey: ["banks"],
    queryFn: api.fetchBanks,
  });

  const filteredBanks = banks?.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(selectedBank?.id === bank.id ? null : bank);
  };

  const handleContinue = async () => {
    if (!selectedBank) return;

    setIsConnecting(true);

    try {
      // Initiate bank connection
      const response = await api.initiateBankConnection(selectedBank.id);

      const authWindow = window.open(
        response.redirect_url,
        "_blank",
        "width=600,height=800"
      );

      if (!authWindow) {
        console.error(
          "Failed to open authentication window - popup blocker may be active"
        );
        showToast.error("Popup blocked. Please allow popups and try again.");
        return;
      }

      // Navigate back to bank connections page - callback will be handled by /bank_connections/callback
      router.push("/bank_connections");

      showToast.success(
        "Bank authentication window opened. Complete authentication in the new window."
      );
    } catch (error) {
      console.error("Failed to initiate bank connection:", error);
      showToast.error("Failed to connect to bank. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    router.push("/bank_connections");
  };

  return (
    <AppShell title="Connect Bank Account">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bank Connections
          </Button>
          <h2 className="font-semibold text-gray-900">
            Connect Your Bank Account
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Securely connect your bank to automatically retrieve your
            transactions and categorize your finances efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps */}
            <Card>
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Choose your bank from the list and grant permission to
                      connect.
                    </h3>
                    <p className="text-sm text-gray-600">
                      You'll be redirected to your bank's secure login page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      We will securely retrieve your recent transactions for
                      analysis.
                    </h3>
                    <p className="text-sm text-gray-600">
                      This typically includes the last 90 days of transaction
                      history.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      You can review and categorize transactions as needed.
                    </h3>
                    <p className="text-sm text-gray-600">
                      All transactions will appear in your Transactions page for
                      review.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bank Selection */}
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Select Your Bank
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for your bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Bank List */}
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>Loading banks...</p>
                    </div>
                  ) : filteredBanks?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No banks found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredBanks?.slice(0, 10).map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleBankSelect(bank)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                            selectedBank?.id === bank.id
                              ? "bg-blue-50 hover:bg-blue-50"
                              : ""
                          }`}
                        >
                          {bank.logo ? (
                            <img
                              src={bank.logo}
                              alt={`${bank.name} logo`}
                              className="w-10 h-10 rounded-lg object-contain bg-white"
                              onError={(e) => {
                                // Fallback to generic bank icon if logo fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🏦</div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                              🏦
                            </div>
                          )}
                          <span className="flex-1 text-left font-medium text-gray-900">
                            {bank.name}
                          </span>
                          {selectedBank?.id === bank.id && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </button>
                      ))}
                      {filteredBanks && filteredBanks.length > 10 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          +{filteredBanks.length - 10} more banks available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedBank || isConnecting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Continue to Bank Login</>
                    )}
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  By proceeding, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . We do not store your banking credentials.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column - Security Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="p-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bank-Level Security
                </h3>
                <p className="text-sm text-gray-700">
                  Your connection is protected with 256-bit encryption, the same
                  security used by banks worldwide.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">What We Access</h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Transaction History
                      </p>
                      <p className="text-xs text-gray-600">
                        Recent transactions for categorization
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Account Details
                      </p>
                      <p className="text-xs text-gray-600">
                        Account name and number
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-50">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">We Never:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">×</span>
                    Store your banking credentials
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">×</span>
                    Initiate transactions on your behalf
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">×</span>
                    Share your data with third parties
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">×</span>
                    Modify your account settings
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
