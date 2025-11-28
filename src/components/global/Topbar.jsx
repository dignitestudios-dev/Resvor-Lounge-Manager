"use client";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import NotificationPopup from "./NotificationPopup";
import ProfileMenu from "./ProfileMenu";
import { usePathname, useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

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
        <NotificationPopup />

        <ProfileMenu />
      </div>
    </div>
  );
};

export default Topbar;
