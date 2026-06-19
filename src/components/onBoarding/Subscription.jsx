/* eslint-disable react/prop-types */
import { useState } from "react";
import BuySubscriptionModal from "./BuySubscriptionModal";
import AuthButton from "../auth/AuthButton";
import { useRouter } from "next/navigation";
import { useGetSubscriptionPlans } from "@/lib/hooks/queries/useSubscriptionPlans";
import { usePurchaseSubscription } from "@/lib/hooks/mutations/SubscriptionMutation";
import { CloudCog, LogOutIcon } from "lucide-react";

const Subscription = ({ handlePrevious }) => {
  const router = useRouter();
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);

  const { mutateAsync: purchasePlan, isPending: isPurchasing } =
    usePurchaseSubscription();
  console.log("🚀 ~ Subscription ~ isPurchasing:", isPurchasing);

  const { data: plansResponse, isLoading } = useGetSubscriptionPlans();
  console.log("🚀 ~ Subscription ~ isLoading:", isLoading);
  const plans = plansResponse?.data || [];

  // const handleBuyNow = (plan) => {
  //   setSelectedPlan(plan);
  //   setSubscriptionModal(true);
  // };

  const handleBuyNow = async (plan) => {
    try {
      setActivePlanId(plan._id);
      const purchaseRes = await purchasePlan(plan._id);
      console.log("🚀 ~ handleBuyNow ~ purchaseRes:", purchaseRes);
      if (purchaseRes?.data?.checkoutUrl) {
        window.location.href = purchaseRes.data.checkoutUrl;
      }
    } catch (error) {
      ErrorToast("Failed to initiate purchase. Please try again.");
      console.log("🚀 ~ handleBuyNow ~ error:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      {completed ? (
        <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-3.5 max-w-[440px] px-4">
          <div className="flex justify-center pb-4">
            <img
              src={"/images/successLight.png"}
              alt="success"
              className="w-[120px]"
            />
          </div>
          <p className="xxl:text-[48px] text-[36px] text-[#E6E6E6] font-[600] capitalize">
            Account Created
          </p>
          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
            Your profile has been created successfully.
          </p>
          <div className="mt-6 ">
            <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
              <AuthButton
                type="button"
                text={"Explore Dashboard"}
                onClick={() => router.push("/dashboard")}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 text-center space-y-4 max-w-[800px] px-4">
            <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-[600] capitalize">
              Subscription Plans
            </p>
            <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
              Choose the Right Plan for Your Lounge. Manage events, track
              guests, and grow your lounge with Resvor&apos;s professional
              tools.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="mt-10 w-full max-w-[1100px] px-4">
            {isLoading ? (
              <div className="text-center text-[#E6E6E6] py-10">
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center text-[#E6E6E6] py-10">
                No plans available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={plan._id}
                    className="bg-white/5 border border-white/20 rounded-[20px] p-6 flex flex-col min-h-[400px] hover:border-white/40 transition"
                  >
                    <div className="text-sm text-[#BEC2C9] mb-4">
                      Plan {index + 1}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {plan.label}
                    </h2>
                    <div className="text-4xl font-bold text-[#FFA500] mb-6">
                      ${plan.displayPrice}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {/* {plan.trialDays > 0 && (
                        <li className="text-[#E6E6E6] flex items-start">
                          <span className="mr-3 mt-0.5">•</span>
                          <span>
                            Includes a {plan.trialDays}-day free trial
                          </span>
                        </li>
                      )} */}
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="text-[#E6E6E6] flex items-start">
                          <span className="mr-3 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={activePlanId === plan._id}
                      onClick={() => handleBuyNow(plan)}
                      className="w-full bg-white text-[#181818] font-semibold py-3 rounded-[12px] hover:bg-gray-100 transition text-sm"
                    >
                      {activePlanId === plan._id ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="w-full mt-6">
              <button
                onClick={() => handlePrevious()}
                className="w-full bg-[#EFEFEF1A] border border-[#CACACA] text-white py-2.5 rounded-xl text-[13px] font-semibold mt-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {subscriptionModal && (
        <BuySubscriptionModal
          onClick={() => setSubscriptionModal(false)}
          setCompleted={setCompleted}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default Subscription;
