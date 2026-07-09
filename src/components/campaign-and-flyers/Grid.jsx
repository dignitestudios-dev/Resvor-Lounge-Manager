import React from "react";
import Card from "./Card";
import { campaignAndFlyers } from "@/lib/constants";

const CampaignAndFlyersGrid = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-y-auto h-full p-5">
      <div className="grid grid-cols-5 gap-x-3 gap-y-6">
        {campaignAndFlyers?.map((campaign, index) => (
          <Card key={index} data={campaign} />
        ))}
      </div>
    </div>
  );
};

export default CampaignAndFlyersGrid;
