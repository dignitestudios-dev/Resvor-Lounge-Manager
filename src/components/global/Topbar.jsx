"use client";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import NotificationPopup from "./NotificationPopup";
import ProfileMenu from "./ProfileMenu";
import { usePathname, useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";
import { useSwitchLounge } from "@/lib/hooks/mutations/LoungeMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const LoungeSelector = () => {
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);
  const { data: lounges = [], isLoading } = useGetLounges();
  const switchLoungeMutation = useSwitchLounge();

  const handleSelect = async (lounge) => {
    if (switchLoungeMutation.isPending) return;
    try {
      setSwitchingId(lounge._id);
      await switchLoungeMutation.mutateAsync({ loungeId: lounge._id });
      SuccessToast(`Switched to ${lounge.name}`);
      setOpen(false);
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to switch lounge. Please try again."
      );
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] border border-[#E2E8F0] rounded-xl px-3 py-2 h-auto font-medium text-sm shadow-none transition-all">
          <svg
            className="w-4 h-4 text-[#010067] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Switch Lounge</span>
          <IoIosArrowDropdownCircle
            className={`text-[#010067] text-lg transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-64 p-2 rounded-xl shadow-lg border border-gray-100"
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
          Select Lounge
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-400">
            Loading lounges...
          </div>
        ) : lounges.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-400">
            No lounges found
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
            {lounges.map((lounge) => {
              const isLoading = switchingId === lounge._id;
              return (
                <button
                  key={lounge._id}
                  onClick={() => handleSelect(lounge)}
                  disabled={switchLoungeMutation.isPending}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors w-full text-left disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {/* Lounge logo */}
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center">
                    {lounge.logo?.location ? (
                      <Image
                        src={lounge.logo.location}
                        alt={lounge.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white bg-[#010067] w-full h-full flex items-center justify-center">
                        {lounge.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Lounge info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#1E293B] truncate group-hover:text-[#010067] transition-colors">
                      {isLoading ? "Switching..." : lounge.name}
                    </span>
                    {lounge.location?.address && (
                      <span className="text-xs text-gray-400 truncate">
                        {lounge.location.address}
                      </span>
                    )}
                  </div>

                  {/* Switching spinner */}
                  {isLoading && (
                    <svg
                      className="w-4 h-4 text-[#010067] animate-spin flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const showBackButton = useMemo(
    () =>
      pathname === "/dashboard/settings" ||
      pathname.includes("/dashboard/guestbook/") ||
      pathname.includes("/dashboard/bartenders/") ||
      pathname.includes("/dashboard/event-management/") ||
      pathname.includes("/dashboard/event-management/") ||
      pathname.includes("/dashboard/bookings/") ||
      pathname.includes("/dashboard/campaign-and-flyers/") ||
      pathname.includes("/dashboard/settings/subscription-plans"),
    [pathname]
  );

  return (
    <div className="rounded-3xl w-full bg-white p-4 flex justify-between items-center">
      <div>
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-700 cursor-pointer"
          >
            <IoIosArrowRoundBack size={28} />
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-5">
        <LoungeSelector />

        <NotificationPopup />

        <ProfileMenu />
      </div>
    </div>
  );
};

export default Topbar;
