"use client";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
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
import { useQueryClient } from "@tanstack/react-query";

// Map route prefixes → query keys to invalidate after a lounge switch
// More specific prefixes (with trailing slash) must come before general ones
const ROUTE_QUERY_MAP = [
  { prefix: "/dashboard/guestbook/", key: ["guestbook-list"] },
  { prefix: "/dashboard/guestbook", key: ["guestbook-list"] },
  { prefix: "/dashboard/event-management/", key: ["event-detail"] },
  { prefix: "/dashboard/event-management", key: ["events-list"] },
  { prefix: "/dashboard/bookings/", key: ["booking-detail"] },
  { prefix: "/dashboard/bookings", key: ["bookings-list"] },
  { prefix: "/dashboard/bartenders", key: ["bartenders-list"] },
  { prefix: "/dashboard/campaign-and-flyers", key: ["campaigns-list"] },
  { prefix: "/dashboard/profile", key: ["lounges-list"] },
];

const LoungeSelector = () => {
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);
  const [activeLoungeId, setActiveLoungeId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeLoungeId") || null;
    }
    return null;
  });

  const { data: lounges = [], isLoading } = useGetLounges();
  const switchLoungeMutation = useSwitchLounge();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  // The lounge to show in the trigger button
  const activeLounge = useMemo(() => {
    if (activeLoungeId) return lounges.find((l) => l._id === activeLoungeId) ?? lounges[0];
    return lounges[0] ?? null;
  }, [activeLoungeId, lounges]);

  // Sync state with localStorage and handle fallback
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("activeLoungeId");
      if (storedId) {
        setActiveLoungeId(storedId);
      } else if (lounges.length > 0) {
        const defaultId = lounges[0]._id;
        localStorage.setItem("activeLoungeId", defaultId);
        setActiveLoungeId(defaultId);
        window.dispatchEvent(new Event("activeLoungeChanged"));
      }
    }
  }, [lounges]);

  // Listen to activeLoungeChanged events
  React.useEffect(() => {
    const handleLoungeChange = () => {
      if (typeof window !== "undefined") {
        setActiveLoungeId(localStorage.getItem("activeLoungeId") || null);
      }
    };
    window.addEventListener("activeLoungeChanged", handleLoungeChange);
    return () => {
      window.removeEventListener("activeLoungeChanged", handleLoungeChange);
    };
  }, []);

  // Resolve which query key belongs to the current open page
  const getPageQueryKey = () => {
    const match = ROUTE_QUERY_MAP.find((r) => pathname.startsWith(r.prefix));
    return match?.key ?? null;
  };

  const handleSelect = async (lounge) => {
    if (switchLoungeMutation.isPending) return;
    try {
      setSwitchingId(lounge._id);
      await switchLoungeMutation.mutateAsync({ loungeId: lounge._id });

      if (typeof window !== "undefined") {
        localStorage.setItem("activeLoungeId", lounge._id);
        setActiveLoungeId(lounge._id);
        window.dispatchEvent(new Event("activeLoungeChanged"));
      }

      // Invalidate only the query for the current page
      const pageKey = getPageQueryKey();
      if (pageKey) {
        queryClient.invalidateQueries({ queryKey: pageKey });
      }

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
          {/* Lounge avatar or home icon */}
          {activeLounge?.logo?.location ? (
            <Image
              src={activeLounge.logo.location}
              alt={activeLounge.name}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            />
          ) : activeLounge ? (
            <span className="w-5 h-5 rounded-full bg-[#010067] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {activeLounge.name?.charAt(0)?.toUpperCase()}
            </span>
          ) : (
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
          )}

          {/* Active lounge name (truncated) */}
          <span className="max-w-[120px] truncate">
            {isLoading ? "Loading..." : activeLounge?.name ?? "Switch Lounge"}
          </span>

          <IoIosArrowDropdownCircle
            className={`text-[#010067] text-lg flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-64 p-2 rounded-xl shadow-lg border border-gray-100"
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
          Switch Lounge
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
              const isSwitching = switchingId === lounge._id;
              const isActive = lounge._id === (activeLoungeId ?? lounges[0]?._id);
              return (
                <button
                  key={lounge._id}
                  onClick={() => handleSelect(lounge)}
                  disabled={switchLoungeMutation.isPending}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors w-full text-left disabled:opacity-60 disabled:cursor-not-allowed group ${isActive ? "bg-[#E8E8FF]" : "hover:bg-[#F1F5F9]"
                    }`}
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
                    <span className={`text-sm font-medium truncate transition-colors ${isActive ? "text-[#010067]" : "text-[#1E293B] group-hover:text-[#010067]"}`}>
                      {isSwitching ? "Switching..." : lounge.name}
                    </span>
                    {lounge.location?.address && (
                      <span className="text-xs text-gray-400 truncate">
                        {lounge.location.address}
                      </span>
                    )}
                  </div>

                  {/* Active checkmark or switching spinner */}
                  {isSwitching ? (
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
                  ) : isActive ? (
                    <svg className="w-4 h-4 text-[#010067] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LoungeSelector;
