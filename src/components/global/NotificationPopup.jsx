"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { IoNotificationsOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useNotifications } from "@/lib/hooks/queries/useQueries";

const NotificationPopup = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: notificationsData, isLoading } = useNotifications();

  const notificationsList = notificationsData?.data || [];
  const notifications = notificationsList.slice(0, 5);

  const unreadCount = notificationsList.filter(
    (n) => !(n.isRead ?? n.read)
  ).length;

  const handleNavigateAll = () => {
    setOpen(false);
    router.push("/dashboard/notifications");
  };

  const handleItemClick = (item) => {
    setOpen(false);

    const resourceType =
      item?.metadata?.resourceType || item?.resourceType;
    const resource = item?.metadata?.resource || item?.resource;

    if (resourceType === "TimeOffRequest") {
      router.push("/dashboard/requests");
    } else if (resourceType === "Shift") {
      router.push("/dashboard/shift");
    } else if (resourceType === "Booking" && resource) {
      router.push(`/dashboard/bookings/${resource}`);
    } else {
      router.push("/dashboard/notifications");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="h-12! w-12! bg-[#d9d9e0] hover:bg-[#ababb1] rounded-lg p-2 relative cursor-pointer">
          {unreadCount > 0 && (
            <div className="w-5 h-5 rounded-full bg-gradient text-white absolute -top-2 -right-2 flex justify-center items-center text-xs font-semibold">
              {unreadCount}
            </div>
          )}
          <IoNotificationsOutline className="text-black size-6" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[450px] max-w-full rounded-xl shadow-lg p-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={handleNavigateAll}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(3)
                .fill()
                .map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <div className="space-y-2 flex-1 pr-4">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-48 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n, idx) => (
              <div
                key={n._id || n.id || idx}
                onClick={() => handleItemClick(n)}
                className="flex justify-between items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {n.description || n.message}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-3 shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {n.createdAt
                      ? moment(n.createdAt).format("hh:mm A")
                      : n.time || ""}
                  </span>
                  {!(n.isRead ?? n.read) && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center mt-1 font-semibold">
                      1
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 font-medium">
              No notifications found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 text-center bg-gray-50 rounded-b-xl">
          <button
            onClick={handleNavigateAll}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            See all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopup;
