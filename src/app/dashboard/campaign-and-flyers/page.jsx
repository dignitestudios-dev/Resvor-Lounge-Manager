"use client";
import React, { useState } from "react";
import CampaignAndFlyersGrid from "@/components/campaign-and-flyers/Grid";
import AddFlyerForm from "@/components/campaign-and-flyers/AddFlyerForm";
import SendInvitationForm from "@/components/campaign-and-flyers/SendInvitationForm";

const CampaignAndFlyers = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Campaign and Flyers</h1>

        <div>
          <AddFlyerForm isOpen={openForm} onOpenChange={setOpenForm} />
        </div>
      </div>

      <div className="mt-10 flex-1 overflow-y-auto">
        <CampaignAndFlyersGrid />
      </div>
    </div>
  );
};

export default CampaignAndFlyers;
