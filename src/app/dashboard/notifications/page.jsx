"use client";

import React, { useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/hooks/queries/useQueries";

const NotificationsPage = () => {
  const router = useRouter();
  const [selectTab, setSelectTab] = useState("all");
  const { data: notificationsData, isLoading } = useNotifications();
  const notifications = notificationsData?.data || [];

  const handleSelect = (val) => {
    setSelectTab(val);
  };

  const handleItemClick = (item) => {
    const resourceType =
      item?.metadata?.resourceType || item?.resourceType;
    const resource = item?.metadata?.resource || item?.resource;

    if (resourceType === "TimeOffRequest") {
      router.push("/dashboard/bartenders-requests");
    } else if (resourceType === "Booking" && resource) {
      router.push(`/dashboard/bookings/${resource}`);
    }
  };

  // Filter tasks from notifications based on selected tab
  const filteredTasks = notifications.filter((n) => {
    const isRead = n.isRead ?? n.read;
    if (selectTab === "all") return true;
    if (selectTab === "read") return isRead === true;
    if (selectTab === "unread") return isRead === false;
    return true;
  });

  return (
    <div>
      <h1 className="section-heading">Notifications</h1>

      <div
        className="mt-6 bg-white rounded-2xl p-6 shadow-xs"
        style={{ boxShadow: "0px 4px 30px 0px #00000010" }}
      >
        {/* Filter Tabs */}
        <div className="w-full border-b-2 border-gray-100 pb-2 mb-4">
          <div className="flex justify-start items-center gap-6">
            <button
              onClick={() => handleSelect("all")}
              className={`text-base font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${selectTab === "all"
                ? "text-primary border-primary font-bold"
                : "text-gray-500 border-transparent hover:text-gray-800"
                }`}
            >
              All
            </button>
            <button
              onClick={() => handleSelect("read")}
              className={`text-base font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${selectTab === "read"
                ? "text-primary border-primary font-bold"
                : "text-gray-500 border-transparent hover:text-gray-800"
                }`}
            >
              Read
            </button>
            <button
              onClick={() => handleSelect("unread")}
              className={`text-base font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${selectTab === "unread"
                ? "text-primary border-primary font-bold"
                : "text-gray-500 border-transparent hover:text-gray-800"
                }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto">
            {Array(4)
              .fill()
              .map((_, index) => (
                <div key={index} className="py-3 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div>
            {filteredTasks?.length > 0 ? (
              <div className="h-full divide-y divide-gray-100">
                {filteredTasks.map((item, index) => (
                  <div
                    key={item._id || index}
                    onClick={() => handleItemClick(item)}
                    className="flex justify-between items-start py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex-1 pr-4">
                      <h2 className="text-base text-gray-900 font-semibold">
                        {item?.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {item?.description || item?.message}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <p className="text-xs text-gray-500 mb-1">
                        {item?.createdAt
                          ? moment(item.createdAt).format("MM-DD-YYYY hh:mm A")
                          : item?.createdAt || ""}
                      </p>
                      {!(item?.isRead ?? item?.read) && (
                        <span className="bg-primary text-white text-xs font-semibold rounded-full px-2 py-0.5 mt-1">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 font-medium">
                No record found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
