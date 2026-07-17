"use client";
import React from "react";
import { RxCross2 } from "react-icons/rx";

const FlyerLimitModal = ({
  isOpen,
  onClose,
  onAccept,
  flyerLimit = 0,
  flyerUsage = 0,
  planLabel = "Current",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0A150F80] bg-opacity-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-[12px] w-[440px] pb-2 overflow-y-auto">
        <div className="flex justify-between items-center px-8 pt-4 border-b-2 border-b-gray-300">
          <h2 className="text-[28px] font-bold mb-4">Flyer Limit Reached</h2>
          <div onClick={onClose} className="cursor-pointer">
            <RxCross2 className="text-[28px] text-[#181818]" />
          </div>
        </div>
        <div className="flex flex-col lg:h-auto md:h-auto px-8 mb-4">
          <div className="space-y-3">
            <p className="text-[16px] text-[#181818] font-semibold mt-2">
              Monthly Flyer Usage
            </p>
            <div className="p-4 bg-[#F1F1F1] rounded-xl">
              <p className="text-[16px] text-[#181818] font-semibold pb-2 border-b border-b-gray-300">
                Usage Summary
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[14px] font-[500] text-[#18181880]">
                  {planLabel} Plan Limit
                </p>
                <p className="text-[16px] text-[#4B4B4B]">{flyerLimit} flyers</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[14px] font-[500] text-[#18181880]">
                  Used This Month
                </p>
                <p className="text-[16px] text-[#4B4B4B]">{flyerUsage} flyers</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[14px] font-[500] text-[#18181880]">
                  Remaining
                </p>
                <p className="text-[16px] text-[#D93025] font-semibold">
                  {Math.max(0, flyerLimit - flyerUsage)} flyers
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[#666666] mt-1">
              You have reached your monthly flyer limit. Now send flyer by paying extra <span className="text-[#181818] font-semibold">$10</span> per flyer or wait for next month to renew your limit.
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={onAccept}
              className="bg-gradient-to-l from-[#012C57] to-[#061523] text-white text-[13px] font-bold px-4 py-3 rounded-[12px] w-[97%]"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerLimitModal;
