"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";
import { useSwitchLounge } from "./../../lib/hooks/mutations/LoungeMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

interface Lounge {
  _id: string;
  name: string;
  location: {
    address: string;
  };
  logo: {
    location: string;
  };
}

interface LoungeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLounge?: () => void;
}

export default function LoungeModal({
  isOpen,
  onClose,
  onAddLounge,
}: LoungeModalProps) {
  const { data: lounges = [], isLoading } = useGetLounges();
  const [selectedLoungeId, setSelectedLoungeId] = useState<string>("");
  const switchLoungeMutation = useSwitchLounge();

  // Set default selected lounge when data loads
  useEffect(() => {
    if (lounges.length > 0 && !selectedLoungeId) {
      setSelectedLoungeId(lounges[0]._id);
    }
  }, [lounges, selectedLoungeId]);

  const handleSubmit = async () => {
    try {
      if (!selectedLoungeId) {
        ErrorToast("Please select a lounge first");
        return;
      }

      await switchLoungeMutation.mutateAsync({
        loungeId: selectedLoungeId,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("activeLoungeId", selectedLoungeId);
        window.dispatchEvent(new Event("activeLoungeChanged"));
      }

      SuccessToast("Lounge switched successfully");
      onClose();
    } catch (error: any) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to switch lounge. Please try again.",
      );
      console.log("Switch lounge error:", error);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Main Modal Box (Matches W: 846px, H: 692px aspect ratio and rounded corners) */}
      <div className="relative w-full max-w-[846px] bg-white rounded-[12px] p-8 shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E293B] text-center tracking-tight">
            Select A Lounge To Manage
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 3x2 Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="text-slate-500">Loading lounges...</div>
            </div>
          ) : (
            <>
              {lounges.map((lounge: Lounge) => {
                const isSelected = lounge._id === selectedLoungeId;
                return (
                  <div
                    key={lounge._id}
                    onClick={() => setSelectedLoungeId(lounge._id)}
                    className={`cursor-pointer rounded-2xl bg-[#FDFDFF] p-4 flex flex-col items-center text-center transition-all border-2 ${isSelected
                        ? "border-[#010067] ring-1 ring-[#010067]"
                        : "border-[#CACACA] hover:border-slate-200"
                      }`}
                  >
                    {/* Lounge Logo (Circular Image Frame) */}
                    <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center relative mb-4">
                      {lounge.logo?.location ? (
                        <Image
                          src={lounge.logo.location}
                          alt={lounge.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold">
                          {lounge.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Text Layout */}
                    <h4 className="font-bold text-[#0F172A] text-sm mb-1 line-clamp-1">
                      {lounge.name}
                    </h4>

                    <div className="flex items-start justify-center gap-1 text-[11px] text-slate-400 max-w-[160px]">
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-2">
                        {lounge.location?.address}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Dotted Placeholder Card: "+ Add a New Lounge Profile" */}
          <button
            onClick={onAddLounge}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white p-6 transition-colors group h-full min-h-[178px]"
          >
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 transition-colors underline decoration-1 underline-offset-2">
              + Add a New Lounge Profile
            </span>
          </button>
        </div>

        {/* Footer Actions (Centered Dark Blue Action Button) */}
        <div className="flex justify-center mt-2">
          <button
            onClick={handleSubmit}
            disabled={switchLoungeMutation.isPending}
            className="w-full max-w-[400px] bg-[#000040] hover:bg-[#000060] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl shadow-md transition-colors tracking-wide"
          >
            {switchLoungeMutation.isPending ? "Switching..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
