"use client";

import React, { useState } from "react";
import CancelSubscriptionModal from "@/components/subscription/CancelSubscriptionModal";
import {
  useGetSubscriptionPlans,
  useGetMySubscription,
} from "@/lib/hooks/queries/useSubscriptionPlans";
import {
  usePurchaseSubscription,
  useCancelSubscription,
} from "@/lib/hooks/mutations/SubscriptionMutation";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";

const invoices = [
  {
    id: 1,
    date: "Feb 19, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 2,
    date: "Feb 07, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 3,
    date: "Feb 02, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 4,
    date: "Jan 30, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 5,
    date: "Feb 07, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 6,
    date: "Feb 02, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
  {
    id: 7,
    date: "Jan 30, 2024",
    desc: "Subscription plan",
    total: "$150.00",
    status: "Paid",
  },
];

const statusBadge = (status) => {
  const map = {
    active: { label: "Active", cls: "bg-green-100 text-green-700" },
    trialing: { label: "Trialing", cls: "bg-blue-100 text-blue-700" },
    canceled: { label: "Canceled", cls: "bg-red-100 text-red-600" },
    past_due: { label: "Past Due", cls: "bg-yellow-100 text-yellow-700" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SubscriptionPlans = () => {
  const [tab, setTab] = useState("billing");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: plansResponse, isLoading: isPlansLoading } =
    useGetSubscriptionPlans();
  const plans = plansResponse?.data || [];

  const {
    data: mySubData,
    isLoading: isMySubLoading,
  } = useGetMySubscription();
  const subscription = mySubData?.subscription || null;
  const isActive = mySubData?.isActive || false;
  const subscribedPlanId = subscription?.planId?._id || null;

  // Mutations
  const { mutateAsync: purchasePlan } = usePurchaseSubscription();
  const { mutateAsync: cancelSub, isPending: isCancelling } =
    useCancelSubscription();

  // const handleBuyNow = async (plan) => {
  //   try {
  //     setPurchasingPlanId(plan._id);
  //     const purchaseRes = await purchasePlan(plan._id);
  //     if (purchaseRes?.data?.checkoutUrl) {
  //       window.location.href = purchaseRes.data.checkoutUrl;
  //     }
  //   } catch (error) {
  //     const msg =
  //       error?.response?.data?.message ||
  //       "Failed to initiate purchase. Please try again.";
  //     ErrorToast(msg);
  //     setPurchasingPlanId(null);
  //   }
  // };

  const handleProceedCancel = async () => {
    try {
      await cancelSub();
      SuccessToast("Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel subscription. Please try again."
      );
    }
  };

  return (
    <div>
      <h1 className="section-heading">Subscription Plans</h1>

      <div className="mt-6 bg-white rounded-2xl p-6">
        <div className="border-b">
          <nav className="flex gap-6">
            <button
              onClick={() => setTab("billing")}
              className={`py-4 cursor-pointer ${tab === "billing"
                ? "border-b-2 border-gray-800 font-semibold"
                : "text-gray-500"
                }`}
            >
              Billing
            </button>
            <button
              onClick={() => setTab("plan")}
              className={`py-4 cursor-pointer ${tab === "plan"
                ? "border-b-2 border-gray-800 font-semibold"
                : "text-gray-500"
                }`}
            >
              Plan
            </button>
          </nav>
        </div>

        {tab === "billing" ? (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border p-6">
                <p className="text-sm text-gray-500">Next Invoice Issue Date</p>
                <div className="text-xl font-semibold mt-3">
                  {subscription ? formatDate(subscription.periodEnd) : "—"}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <p className="text-sm text-gray-500">Invoice Total</p>
                <div className="text-xl font-semibold mt-3">
                  {subscription?.planId
                    ? `$${subscription.planId.displayPrice}`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3">Date</th>
                    <th className="py-3">Description</th>
                    <th className="py-3">Invoice Total</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 text-gray-700">{inv.date}</td>
                      <td className="py-4 text-gray-700">{inv.desc}</td>
                      <td className="py-4 text-gray-700">{inv.total}</td>
                      <td className="py-4 text-gray-700">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {isPlansLoading || isMySubLoading ? (
              <div className="text-center text-gray-400 py-10">
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No plans available right now.
              </div>
            ) : (
              <div className="flex items-start justify-center gap-x-8 gap-y-8 flex-wrap">
                {plans.map((plan, index) => {
                  const isSubscribed =
                    isActive && subscribedPlanId === plan._id;
                  const isCancelPending =
                    isSubscribed && subscription?.cancelAtPeriodEnd;

                  return (
                    <div
                      key={plan._id}
                      className={`max-w-[320px] w-full bg-white rounded-2xl border p-6 shadow-sm flex flex-col min-h-[420px] relative ${isSubscribed
                        ? "border-[#010067] ring-1 ring-[#010067]"
                        : "border-gray-200"
                        }`}
                    >
                      {/* Current plan badge */}
                      {isSubscribed && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-[#010067] text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="mb-4 text-sm text-gray-500 flex items-center justify-between">
                        <span>Plan {index + 1}</span>
                        {isSubscribed &&
                          statusBadge(subscription.status)}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-2xl font-extrabold mb-2">
                              {plan.label}
                            </h3>
                            <div
                              className={`text-3xl font-bold mb-1 ${isSubscribed
                                ? "text-[#010067]"
                                : "text-[#FFA500]"
                                }`}
                            >
                              ${plan.displayPrice}
                            </div>
                            <p className="text-xs text-gray-400 mb-5">
                              per {plan.durationDays} days
                            </p>
                          </div>
                          <div>
                            {isSubscribed && subscription && (
                              <div className="mb-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                  <span>Start: </span>
                                  <span className="font-medium text-gray-700">
                                    {formatDate(subscription.periodStart)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span> End: </span>
                                  <span className="font-medium text-gray-700">
                                    {formatDate(subscription.periodEnd)}
                                  </span>
                                </div>
                                {isCancelPending && (
                                  <div className="text-red-500 font-medium mt-1 text-center">
                                    Cancels at period end
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <ul className="text-sm text-gray-700 mb-6 list-disc pl-5 space-y-3">
                          {plan.features?.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        {isSubscribed ? (
                          <button
                            onClick={() => setCancelOpen(true)}
                            disabled={isCancelPending}
                            className={`w-full py-3 rounded-xl text-sm font-semibold transition ${isCancelPending
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-100 text-red-500 hover:bg-gray-200"
                              }`}
                          >
                            {isCancelPending
                              ? "Cancellation Pending"
                              : "Cancel Subscription"}
                          </button>
                        ) : (
                          <></>
                          // <button
                          //   // onClick={() => handleBuyNow(plan)}
                          //   disabled={purchasingPlanId === plan._id}
                          //   className="w-full bg-gradient-to-r from-[#0b1738] to-[#0b2b8d] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          // >
                          //   {purchasingPlanId === plan._id
                          //     ? "Processing..."
                          //     : "Buy Now"}
                          // </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <CancelSubscriptionModal
        open={cancelOpen}
        setOpen={setCancelOpen}
        onProceed={handleProceedCancel}
      />
    </div>
  );
};

export default SubscriptionPlans;
