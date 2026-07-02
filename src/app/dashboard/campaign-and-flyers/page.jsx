"use client";
import React, { useState } from "react";
import CampaignAndFlyersGrid from "@/components/campaign-and-flyers/Grid";
import AddFlyerForm from "@/components/campaign-and-flyers/AddFlyerForm";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";

const CampaignAndFlyers = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Campaign and Flyers</h1>

        <div className="flex items-center gap-3">
          {/* Flyer History Button */}
          <Link href="/dashboard/campaign-and-flyers/history">
            <Button
              variant="outline"
              className="h-12 text-[14px] px-6 flex items-center gap-2 border-2"
            >
              <History className="w-4 h-4" />
              Flyer History
            </Button>
          </Link>

          {/* <AddFlyerForm isOpen={openForm} onOpenChange={setOpenForm} /> */}
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        <CampaignAndFlyersGrid />
      </div>
    </div>
  );
};

export default CampaignAndFlyers;
