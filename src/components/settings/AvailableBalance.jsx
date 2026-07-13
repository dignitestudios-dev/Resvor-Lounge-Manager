"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletMe } from "@/lib/hooks/queries/useQueries";
import { useWalletTopup } from "@/lib/hooks/mutations/OnBoardingMutations";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { RxCross2 } from "react-icons/rx";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/Stripe";

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
          console.log("🚀 ~ handleAmountSubmit ~ response:", response);
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

/* ─── AvailableBalance Component ────────────────────────── */
const AvailableBalance = () => {
  const [showTopUp, setShowTopUp] = useState(false);
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

      <button
        onClick={() => setShowTopUp(true)}
        className="mt-5 inline-flex items-center gap-2 bg-white text-[#0B0E52] px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Top Up
      </button>

      {/* Top-Up Modal */}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </div>
  );
};

export default AvailableBalance;
