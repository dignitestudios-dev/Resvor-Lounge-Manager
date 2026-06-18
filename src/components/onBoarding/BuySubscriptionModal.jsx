/* eslint-disable react/prop-types */
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { usePurchaseSubscription } from "./../../lib/hooks/mutations/SubscriptionMutation";
import { getStripe } from "@/lib/Stripe";

// Visual style passed into the Stripe Elements iframes. Tailwind classes
// can't reach inside them, so font/placeholder color is set here instead.
const cardElementStyle = {
  base: {
    fontSize: "14px",
    color: "#181818",
    letterSpacing: "0.025em",
    "::placeholder": {
      color: "#737373",
      fontSize: "12px",
      fontWeight: 300,
    },
  },
  invalid: {
    color: "#e3342f",
  },
};

const cardElementWrapperClass =
  "px-4 py-2.5 text-sm rounded-[12px] bg-transparent ring-1 ring-[#BEBEBE] focus-within:ring-2 focus-within:ring-gray-200";

const BuySubscriptionModalContent = ({ onClick, setCompleted, plan }) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: purchasePlan } = usePurchaseSubscription();

  const [cardholderName, setCardholderName] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // NOTE: there's no "isVip" field in the sample plans payload you shared
  // (just key/label/displayPrice/etc). Adjust this check to whatever field
  // your backend actually uses to mark a plan as VIP.
  const isVip = plan?.isVip || plan?.key === "vip";

  const handleAddCard = () => {
    if (!cardholderName.trim()) {
      setErrorMessage("Please enter the cardholder name.");
      return;
    }
    setErrorMessage("");
    setShowBill(true);
  };

  const handlePayNow = async () => {
    if (!stripe || !elements || !plan?._id) return;

    setProcessing(true);
    setErrorMessage("");

    try {
      // 1. Tell the backend which plan we're buying. It should create/prepare
      // the Stripe subscription and return a client secret to confirm with.
      const purchaseRes = await purchasePlan(plan._id);
      console.log("🚀 ~ handlePayNow ~ purchaseRes:", purchaseRes);
      const { clientSecret, paymentMethodId } = purchaseRes?.data || {};

      if (!clientSecret) {
        throw new Error("Missing client secret in server response.");
      }

      // If the backend already has a saved payment method id, reuse it.
      // Otherwise build a fresh PaymentMethod from the card fields below.
      const paymentMethodPayload = paymentMethodId
        ? paymentMethodId
        : {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: cardholderName },
          };

      // 2. Confirm with Stripe. A SetupIntent secret ("seti_...") is what
      // Stripe uses to save a card for trial plans with no upfront charge;
      // a PaymentIntent secret ("pi_...") is used to charge immediately.
      const confirm = clientSecret.startsWith("seti_")
        ? await stripe.confirmCardSetup(clientSecret, {
            payment_method: paymentMethodPayload,
          })
        : await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodPayload,
          });

      if (confirm.error) {
        throw new Error(confirm.error.message);
      }

      setSuccess(true);
      setCompleted(true);
      setShowBill(false);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const goToDashboard = () => router.push("/dashboard");

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-[440px]">
        <div
          className={`flex justify-between items-center  px-8 pt-4 ${
            !success ? "border-b-2 border-b-gray-300" : ""
          }`}
        >
          {!success ? (
            <p className=" xxl:text-[48px] text-[28px] text-[#181818] font-[600] capitalize">
              Add Card Details
            </p>
          ) : (
            <p></p>
          )}
          <div onClick={onClick} className="cursor-pointer">
            <RxCross2 className="text-[28px] text-[#181818]" />
          </div>
        </div>

        <div className="flex flex-col  lg:h-auto md:h-screen px-8 mb-4">
          {showBill ? (
            <>
              <div className="space-y-3 xxl:w-[400px] xxl:ml-12">
                <p className="text-[16px] text-[#181818] font-semibold mt-2">
                  Payment Method
                </p>
                <div className="p-4 bg-[#F1F1F1] rounded-xl">
                  <p className="text-[16px] text-[#181818] font-semibold mt-2">
                    Payment Summary
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[16px] text-[#18181880] ">
                      {plan?.label || "Plan"}
                    </p>
                    <p className="text-[16px] text-[#4B4B4B] ">
                      ${plan?.displayPrice}
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="text-red-500 text-[13px] mt-3 xxl:w-[400px] xxl:ml-12">
                  {errorMessage}
                </p>
              )}

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handlePayNow}
                  disabled={processing}
                  className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%] disabled:opacity-60"
                >
                  {processing ? "Processing..." : "Pay Now"}
                </button>
              </div>
              <div className="my-4 flex justify-center">
                <button
                  onClick={() => setShowBill(false)}
                  disabled={processing}
                  className="bg-[#21293514] text-[13px] px-4 py-3 rounded-[12px] w-[97%] font-bold"
                >
                  Back
                </button>
              </div>
            </>
          ) : success && isVip ? (
            <div className="flex flex-col justify-center items-center lg:h-auto md:h-screen mb-10">
              <div>
                <img
                  src={"/images/qrSnap.png"}
                  alt="success"
                  className="w-[120px]"
                />
              </div>
              <div className="mt-4 space-y-3 xxl:w-[400px] xxl:ml-12 text-center">
                <p className=" xxl:text-[48px] text-[32px] text-[#181818] font-[600] capitalize">
                  Your QR Code
                </p>
                <p className="xxl:text-[26px] text-[16px] text-[#565656] capitalize ">
                  Scan this QR code upon entering to get access to VIP lounge
                  features
                </p>
              </div>
              <div className="mt-4 flex justify-center w-[360px]">
                <button
                  onClick={""}
                  className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%]"
                >
                  Download QR Code
                </button>
              </div>
              <div className="my-4 flex justify-center w-[360px]">
                <button
                  onClick={goToDashboard}
                  className="bg-white border-[1px] border-[#000000] text-[13px] px-4 py-3 rounded-[12px] w-[97%] font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col justify-center items-center lg:h-auto md:h-screen mb-10">
              <div>
                <img
                  src={"/images/SuccessCheck.png"}
                  alt="success"
                  className="w-[120px]"
                />
              </div>
              <div className="mt-4 space-y-3 xxl:w-[400px] xxl:ml-12 text-center">
                <p className=" xxl:text-[48px] text-[32px] text-[#181818] font-[600] capitalize">
                  Congratulations
                </p>
                <p className="xxl:text-[26px] text-[16px] text-[#565656]">
                  You have successfully subscribed to the {plan?.label} Plan.
                </p>
              </div>
              <div className="mt-6 flex justify-center w-[360px]">
                <button
                  onClick={goToDashboard}
                  className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%]"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 xxl:w-[400px] xxl:ml-12">
              <p className="text-[16px] text-[#181818] font-semibold mt-2">
                Add Payment Details
              </p>
              <div>
                <label className="block text-[14px] font-[500] text-[#737373] mb-2 mt-6">
                  Card Holder Name
                </label>
                <div className="px-1">
                  <input
                    placeholder="Enter card holder name here"
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    maxLength={30}
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className={`w-full px-4 py-2 text-sm rounded-[12px] bg-transparent ring-1 ring-[#BEBEBE] 
            focus:ring-2 focus:ring-gray-200 focus:outline-none pr-12 placeholder:font-light placeholder:text-[12px] placeholder:text-[#737373]`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-[500] text-[#737373] mb-2 mt-6">
                  Card Number
                </label>
                <div className="px-1">
                  <div className={cardElementWrapperClass}>
                    <CardNumberElement options={{ style: cardElementStyle }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center border-b-2 border-b-gray-300 pb-3 gap-3">
                <div className="flex-1">
                  <label className="block text-[14px] font-[500] text-[#737373] mb-2 mt-2">
                    Expiry
                  </label>
                  <div className="px-1">
                    <div className={cardElementWrapperClass}>
                      <CardExpiryElement
                        options={{ style: cardElementStyle }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[14px] font-[500] text-[#737373] mb-2 mt-2">
                    CVC
                  </label>
                  <div className="px-1">
                    <div className={cardElementWrapperClass}>
                      <CardCvcElement options={{ style: cardElementStyle }} />
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="text-red-500 text-[13px]">{errorMessage}</p>
              )}

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleAddCard}
                  className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%]"
                >
                  Add Card
                </button>
              </div>
              <div className="my-4 flex justify-center">
                <button
                  onClick={onClick}
                  className="bg-[#21293514] text-[13px] px-4 py-3 rounded-[12px] w-[97%] font-bold"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BuySubscriptionModal = (props) => (
  <Elements stripe={getStripe()}>
    <BuySubscriptionModalContent {...props} />
  </Elements>
);

export default BuySubscriptionModal;
