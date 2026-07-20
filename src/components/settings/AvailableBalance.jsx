"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletMe, useGetConnectStatus } from "@/lib/hooks/queries/useQueries";
import { useWalletTopup } from "@/lib/hooks/mutations/OnBoardingMutations";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { RxCross2 } from "react-icons/rx";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/Stripe";
import axiosInstance from "@/axios";

// Helper for cents to dollars
const centsToDollars = (cents) => (cents / 100).toFixed(2);

/* ─── Stripe Card Form ─────────────────────────────── */
const cardElementOptions = {
  style: {
    base: {
      color: "#212935",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#737373",
      },
    },
    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  },
};

const StripeCardForm = ({ onSubmitCard, isValidatingCard }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!cardName.trim()) {
      ErrorToast("Please enter cardholder name.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    onSubmitCard(stripe, cardElement, cardName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-5 w-full pt-2 px-16">
        <div className="pt-2 space-y-2 text-center">
          <h2 className="text-[36px] font-semibold capitalize">
            Card Details
          </h2>
          <p className="text-[#565656] text-[16px]">
            Please enter your card details to process payment.
          </p>
        </div>

        {/* Card Holder Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[500] text-[#737373]">
            Cardholder Name
          </label>
          <input
            type="text"
            placeholder="Enter cardholder name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-[12px] bg-transparent ring-1 ring-[#BEBEBE] focus:ring-2 focus:ring-gray-200 focus:outline-none placeholder:text-[#737373] placeholder:font-light"
            disabled={isValidatingCard}
            required
          />
        </div>

        {/* Card Information */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[500] text-[#737373]">
            Card Information
          </label>
          <div className="w-full px-4 py-3.5 rounded-[12px] bg-transparent ring-1 ring-[#BEBEBE] focus-within:ring-2 focus-within:ring-gray-200">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isValidatingCard || !stripe}
            className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%] disabled:opacity-60 flex justify-center items-center gap-2"
          >
            {isValidatingCard ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

/* ─── TopUp Modal ──────────────────────────────────── */
const TopUpModalContent = ({ onClose }) => {
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const { mutate: topup, isPending } = useWalletTopup();

  // steps: "card" | "amount"
  const [step, setStep] = useState("card");

  // amount fields
  const [amountDollars, setAmountDollars] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [isValidatingCard, setIsValidatingCard] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isLoading = isPending || isProcessingPayment;

  // Step 1: Handle Stripe Payment Method Creation
  const handleCardSubmit = async (stripeInstance, cardElement, cardName) => {
    setIsValidatingCard(true);
    try {
      const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      });

      if (error) {
        ErrorToast(error.message);
        setIsValidatingCard(false);
        return;
      }

      setPaymentMethodId(paymentMethod.id);
      setStep("amount");
    } catch (err) {
      console.error(err);
      ErrorToast("Failed to process card. Please try again.");
    } finally {
      setIsValidatingCard(false);
    }
  };

  // Step 2: Handle API topup submission
  const handleAmountSubmit = (e) => {
    e.preventDefault();
    const dollars = parseFloat(amountDollars);
    if (!dollars || dollars <= 0) {
      ErrorToast("Please enter a valid amount.");
      return;
    }

    // Convert dollars → cents for the API
    const amountInCents = Math.round(dollars * 100);

    if (amountInCents < 500) {
      ErrorToast("Minimum top-up is $5.00.");
      return;
    }

    topup(
      { amount: amountInCents, paymentMethodId },
      {
        onSuccess: async (response) => {
          const { clientSecret, status } = response?.data || {};

          if (clientSecret && status !== "succeeded") {
            setIsProcessingPayment(true);
            try {
              if (!stripe) {
                ErrorToast("Stripe has not loaded yet. Please try again.");
                setIsProcessingPayment(false);
                return;
              }

              const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

              if (error) {
                ErrorToast(error.message || "Payment authentication failed.");
              } else if (paymentIntent && paymentIntent.status === "succeeded") {
                SuccessToast("Wallet topped up successfully!");
                queryClient.invalidateQueries({ queryKey: ["wallet-me"] });
                queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
                onClose();
              } else {
                ErrorToast(`Payment verification status: ${paymentIntent?.status}`);
              }
            } catch (err) {
              console.error("3DS Confirmation Error:", err);
              ErrorToast("An error occurred during payment confirmation.");
            } finally {
              setIsProcessingPayment(false);
            }
          } else {
            SuccessToast("Wallet topped up successfully!");
            queryClient.invalidateQueries({ queryKey: ["wallet-me"] });
            queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
            onClose();
          }
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message ||
            "Top-up failed. Please try again.";
          ErrorToast(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-[540px] pb-6 overflow-y-auto">
        <div className="flex justify-between items-center px-12 pt-4 border-b-2 border-b-gray-300">
          <h2 className="text-[28px] font-bold mb-4">Top Up Wallet</h2>
          <div onClick={onClose} className="cursor-pointer">
            <RxCross2 className="text-[28px] text-[#181818]" />
          </div>
        </div>

        {step === "card" && (
          <StripeCardForm
            onSubmitCard={handleCardSubmit}
            isValidatingCard={isValidatingCard}
          />
        )}

        {step === "amount" && (
          <form onSubmit={handleAmountSubmit}>
            <div className="flex flex-col gap-5 w-full pt-4 px-16">
              <div className="pt-2 space-y-2 text-center">
                <h2 className="text-[36px] font-semibold capitalize">
                  Top-Up Amount
                </h2>
                <p className="text-[#565656] text-[16px]">
                  Enter the amount you would like to top up.
                </p>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-[500] text-[#737373]">
                  Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="5.00"
                    placeholder="5.00"
                    value={amountDollars}
                    onChange={(e) => setAmountDollars(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-[12px] bg-transparent ring-1 ring-[#BEBEBE] focus:ring-2 focus:ring-gray-200 focus:outline-none placeholder:text-[#737373] placeholder:font-light"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-[11px] text-[#737373] font-light">
                  Minimum top-up amount is $5.00
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep("card")}
                  className="w-1/2 px-4 py-3 rounded-[12px] text-[13px] font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-1/2 disabled:opacity-60 flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const TopUpModal = ({ onClose }) => {
  return (
    <Elements stripe={getStripe()}>
      <TopUpModalContent onClose={onClose} />
    </Elements>
  );
};

/* ─── Withdrawal Modal ─────────────────────────────── */
const WithdrawalModalContent = ({ onClose }) => {
  const stripe = useStripe();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);

  // Bank Tokenization form state
  const [routingNumberVal, setRoutingNumberVal] = useState("");
  const [accountNumberVal, setAccountNumberVal] = useState("");
  const [holderNameVal, setHolderNameVal] = useState("");
  const [holderTypeVal, setHolderTypeVal] = useState("company");
  const [isTokenizing, setIsTokenizing] = useState(false);

  // Fetch connect status
  const {
    data: statusResponse,
    isLoading: isLoadingStatus,
    refetch,
  } = useGetConnectStatus();

  const statusData = statusResponse?.data || statusResponse || {};
  const status = statusData?.status || "not_created";
  const chargesEnabled = !!statusData?.chargesEnabled;
  const payoutsEnabled = !!statusData?.payoutsEnabled;
  const requirementsDue = statusData?.requirementsDue || [];
  const requirementsPastDue = statusData?.requirementsPastDue || [];
  const hasRequirements = requirementsDue.length > 0 || requirementsPastDue.length > 0;

  // Handle "Set up Payouts with Stripe" CTA (for not_created)
  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    try {
      const refreshUrl = `${window.location.origin}/dashboard/settings?connect=refresh`;
      const returnUrl = `${window.location.origin}/dashboard/settings?connect=return`;

      const response = await axiosInstance.post("/connect/account", {
        country: "US",
        // refreshUrl,
        // returnUrl,
      });

      const url = response?.data?.data?.url || response?.data?.url || response?.url;
      if (url) {
        window.location.href = url;
      } else {
        SuccessToast("Stripe connect account created successfully.");
        queryClient.invalidateQueries({ queryKey: ["connect-status"] });
        refetch();
      }
    } catch (err) {
      console.error(err);
      ErrorToast(
        err?.response?.data?.message || "Failed to create Stripe Connect account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "Finish Stripe Onboarding" / Re-onboarding CTA (for onboarding, restricted, etc.)
  const handleOnboardingLink = async () => {
    setIsSubmitting(true);
    try {
      const refreshUrl = `${window.location.origin}/dashboard/settings?connect=refresh`;
      const returnUrl = `${window.location.origin}/dashboard/settings?connect=return`;

      const response = await axiosInstance.post("/connect/account/onboarding-link", {
        refreshUrl,
        returnUrl,
      });

      const url = response?.data?.data?.url || response?.data?.url || response?.url;
      if (url) {
        window.location.href = url;
      } else {
        ErrorToast("Unable to generate onboarding link.");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(
        err?.response?.data?.message || "Failed to generate onboarding link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Attach bank account via Stripe.js client-side tokenization
  const handleTokenizeBank = (e) => {
    e.preventDefault();
    if (!stripe) {
      ErrorToast("Stripe.js has not initialized yet.");
      return;
    }
    if (!routingNumberVal || !accountNumberVal || !holderNameVal) {
      ErrorToast("Please fill in all bank account details.");
      return;
    }

    setIsTokenizing(true);
    stripe
      .createToken("bank_account", {
        country: "US",
        currency: "usd",
        routing_number: routingNumberVal,
        account_number: accountNumberVal,
        account_holder_name: holderNameVal,
        account_holder_type: holderTypeVal,
      })
      .then(async function (result) {
        if (result.error) {
          ErrorToast(result.error.message || "Failed to tokenize bank account.");
          setIsTokenizing(false);
        } else {
          try {
            const refreshUrl = `${window.location.origin}/dashboard/settings?connect=refresh`;
            const returnUrl = `${window.location.origin}/dashboard/settings?connect=return`;

            await axiosInstance.post("/connect/account", {
              country: "US",
              bankToken: result.token.id,
              refreshUrl,
              returnUrl,
            });

            SuccessToast("Bank account attached successfully!");
            setShowBankForm(false);
            queryClient.invalidateQueries({ queryKey: ["connect-status"] });
            refetch();
          } catch (err) {
            console.error(err);
            ErrorToast(
              err?.response?.data?.message || "Failed to attach bank account."
            );
          } finally {
            setIsTokenizing(false);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        ErrorToast("An error occurred during bank account tokenization.");
        setIsTokenizing(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-[540px] max-w-full pb-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center px-8 pt-5 pb-4 border-b border-gray-200">
          <h2 className="text-[24px] font-bold text-gray-900">Withdrawal & Payouts</h2>
          <div onClick={onClose} className="cursor-pointer p-1 text-gray-500 hover:text-gray-900 transition">
            <RxCross2 className="text-[24px]" />
          </div>
        </div>

        <div className="p-8">
          {isLoadingStatus ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-medium">Checking Stripe Connect status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ACTIVE STATUS */}
              {(status === "active" || (chargesEnabled && payoutsEnabled)) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active
                        </span>
                        <span className="text-sm font-semibold text-emerald-950">
                          Stripe Connect Linked Successfully
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Your account is fully verified and ready for payouts and withdrawals.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NOT CREATED STATUS */}
              {status === "not_created" && !(chargesEnabled && payoutsEnabled) && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-blue-950">
                      Stripe Connect Account Required
                    </p>
                    <p className="text-xs text-blue-700">
                      You need to set up a Stripe Connect account to enable withdrawals and receive payouts.
                    </p>
                  </div>

                  {!showBankForm ? (
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={handleCreateAccount}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-sm font-bold py-3.5 px-4 rounded-xl hover:opacity-95 transition disabled:opacity-60 flex justify-center items-center gap-2 shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Connecting to Stripe...
                          </>
                        ) : (
                          "Set up Payouts with Stripe"
                        )}
                      </button>

                      {/* <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-gray-400">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowBankForm(true)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
                      >
                        Add Bank Account Details Manually
                      </button> */}
                    </div>
                  ) : null}
                </div>
              )}

              {/* ONBOARDING STATUS */}
              {status === "onboarding" && !(chargesEnabled && payoutsEnabled) && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-amber-950">
                      Finish Stripe Onboarding
                    </p>
                    <p className="text-xs text-amber-700">
                      Your Stripe Connect onboarding is incomplete. Please finish onboarding to enable payouts.
                    </p>
                  </div>

                  <button
                    onClick={handleOnboardingLink}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-sm font-bold py-3.5 px-4 rounded-xl hover:opacity-95 transition disabled:opacity-60 flex justify-center items-center gap-2 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Redirecting to Stripe...
                      </>
                    ) : (
                      "Finish Stripe Onboarding"
                    )}
                  </button>
                </div>
              )}

              {/* RESTRICTED STATUS */}
              {status === "restricted" && !(chargesEnabled && payoutsEnabled) && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                      <svg className="w-5 h-5 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Payouts Restricted
                    </div>
                    <p className="text-xs text-amber-800 mt-1">
                      {hasRequirements || !payoutsEnabled
                        ? "Payouts restricted. Please submit required documentation."
                        : "Payouts restricted. Please update your Stripe Connect account."}
                    </p>
                  </div>

                  <button
                    onClick={handleOnboardingLink}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-sm font-bold py-3.5 px-4 rounded-xl hover:opacity-95 transition disabled:opacity-60 flex justify-center items-center gap-2 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Redirecting to Stripe...
                      </>
                    ) : (
                      "Submit Required Documentation"
                    )}
                  </button>
                </div>
              )}

              {/* REJECTED STATUS */}
              {status === "rejected" && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-red-950">
                      Account Rejected or Disconnected
                    </p>
                    <p className="text-xs text-red-700">
                      Your account has been rejected or disconnected. Please contact support.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Account Form */}
              {showBankForm && (
                <form onSubmit={handleTokenizeBank} className="border-t border-gray-200 pt-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Tokenize Bank Account (Stripe.js)
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe / Business Name"
                      value={holderNameVal}
                      onChange={(e) => setHolderNameVal(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-900 focus:outline-none text-black"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        placeholder="110000000"
                        value={routingNumberVal}
                        onChange={(e) => setRoutingNumberVal(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-900 focus:outline-none text-black"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="000123456789"
                        value={accountNumberVal}
                        onChange={(e) => setAccountNumberVal(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-900 focus:outline-none text-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Account Holder Type
                    </label>
                    <select
                      value={holderTypeVal}
                      onChange={(e) => setHolderTypeVal(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white text-black"
                    >
                      <option value="company">Company</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBankForm(false)}
                      className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-lg transition"
                      disabled={isTokenizing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isTokenizing}
                      className="w-1/2 bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-xs font-bold py-2.5 rounded-lg transition disabled:opacity-60 flex justify-center items-center gap-2"
                    >
                      {isTokenizing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Tokenizing...
                        </>
                      ) : (
                        "Submit Bank Account"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WithdrawalModal = ({ onClose }) => {
  return (
    <Elements stripe={getStripe()}>
      <WithdrawalModalContent onClose={onClose} />
    </Elements>
  );
};

/* ─── AvailableBalance Component ────────────────────────── */
const AvailableBalance = () => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const { data: walletResponse, isLoading: isLoadingWallet } = useWalletMe();
  const wallet = walletResponse?.data;

  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0E52] to-[#1a1f7a] px-8 py-6 text-white shadow-lg">
      {/* decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">
        Available Balance
      </p>
      {isLoadingWallet ? (
        <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse mt-1" />
      ) : (
        <h2 className="text-[38px] font-bold leading-none">
          ${centsToDollars(wallet?.availableBalance ?? 0)}
          <span className="text-lg font-normal text-white/50 ml-2 uppercase">
            {wallet?.currency || "usd"}
          </span>
        </h2>
      )}
      <p className="text-white/40 text-xs mt-3">
        Withheld: ${centsToDollars(wallet?.withheldBalance ?? 0)}
      </p>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={() => setShowTopUp(true)}
          className="inline-flex items-center gap-2 bg-white text-[#0B0E52] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Top Up
        </button>

        <button
          onClick={() => setShowWithdrawal(true)}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Withdrawal
        </button>
      </div>

      {/* Top-Up Modal */}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}

      {/* Withdrawal Modal */}
      {showWithdrawal && <WithdrawalModal onClose={() => setShowWithdrawal(false)} />}
    </div>
  );
};

export default AvailableBalance;
