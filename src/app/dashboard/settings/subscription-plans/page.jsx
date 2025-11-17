"use client";

import React, { useState } from "react";
import PlanCard from "@/components/subscription/PlanCard";
import CancelSubscriptionModal from "@/components/subscription/CancelSubscriptionModal";

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

const SubscriptionPlans = () => {
  const [tab, setTab] = useState("billing");
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleProceedCancel = () => {
    // Called when user confirms cancellation. Replace with API call as needed.
    console.log("User proceeded to cancel subscription");
  };

  return (
    <div>
      <h1 className="section-heading">Subscription Plans</h1>

      <div className="mt-6 bg-white rounded-2xl p-6">
        <div className="border-b">
          <nav className="flex gap-6">
            <button
              onClick={() => setTab("billing")}
              className={`py-4 cursor-pointer ${
                tab === "billing"
                  ? "border-b-2 border-gray-800 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Billing
            </button>
            <button
              onClick={() => setTab("plan")}
              className={`py-4 cursor-pointer ${
                tab === "plan"
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
                <div className="text-xl font-semibold mt-3">Dec 29, 2024</div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <p className="text-sm text-gray-500">Invoice Total</p>
                <div className="text-xl font-semibold mt-3">$150.00</div>
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
            <div className="flex items-center justify-center gap-x-8 gap-y-8">
              <PlanCard
                title="Plan 1"
                price="$199.95"
                features={[
                  "Unlimited Guests",
                  "Unlimited Event",
                  "Delivery by Text or Email",
                ]}
                highlight={true}
                onPrimary={() => setCancelOpen(true)}
                priceColor="metallic-text"
                primaryClass={"bg-gray-100 text-red-500 hover:bg-gray-200"}
                primaryLabel={"Cancel Subscription"}
                buttonVariant={"ghost"}
              />

              <PlanCard
                title="Plan 2"
                price="$99.95"
                features={[
                  "1000 guests per event",
                  "Unlimited Event",
                  "Delivery by Text or Email",
                ]}
                onPrimary={() => console.log("Update plan 2")}
                priceColor="gold-text"
                primaryClass={
                  "bg-linear-to-r from-[#0b1738] to-[#0b2b8d] text-white"
                }
                buttonVariant={"default"}
              />

              <PlanCard
                title="Plan 3"
                price="$59.95"
                features={[
                  "500 guests per event",
                  "Unlimited Event",
                  "Delivery by Text or Email",
                ]}
                onPrimary={() => console.log("Update plan 3")}
                priceColor="orange-metallic"
                primaryClass={
                  "bg-linear-to-r from-[#0b1738] to-[#0b2b8d] text-white"
                }
                buttonVariant={"default"}
              />
            </div>
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
