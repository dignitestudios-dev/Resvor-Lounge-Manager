"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const PlanCard = ({
  title,
  price,
  features = [],
  highlight = false,
  onPrimary,
  priceColor = "text-[#0b2b8d]",
  primaryClass = "",
  primaryLabel,
  buttonVariant,
}) => {
  return (
    <div className="max-w-[320px] w-full bg-white rounded-2xl border p-6 shadow-sm flex flex-col min-h-[420px]">
      <div className="mb-4 text-sm text-gray-500">{title}</div>

      <div className="flex-1">
        <h3 className="text-2xl font-extrabold mb-2">
          {title === "Plan 1" && highlight ? "Platinum" : title}
        </h3>
        <div className={`text-3xl font-bold mb-6 ${priceColor}`}>{price}</div>

        <ul className="text-sm text-gray-700 mb-6 list-disc pl-5 space-y-3">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <Button
          onClick={onPrimary}
          variant={buttonVariant}
          className={`w-full ${primaryClass}`}
        >
          {primaryLabel
            ? primaryLabel
            : highlight
            ? "Cancel Subscription"
            : "Update Plan"}
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
