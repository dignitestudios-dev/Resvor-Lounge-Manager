"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomPagination from "@/components/common/CustomPagination";
import utils, { capitalize } from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { Loader2 } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "UG";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Table = ({
  filters = {},
  events,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => { },
}) => {
  const router = useRouter();
  const [filteredEvents, setFilteredEvents] = React.useState([]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()?.replace(/_/g, " ")) {
      case "completed": return "text-[#22C55E]";
      case "confirmed": return "text-[#3B82F6]";
      case "expired": return "text-[#6B7280]";
      case "rejected": return "text-[#EF4444]";
      case "approved": return "text-[#10B981]";
      case "published": return "text-[#6366F1]";
      case "cancelled": return "text-[#DC2626]";
      case "upcoming": return "text-[#8B5CF6]";
      case "pending":
      case "awaiting payment":
      case "incoming":
      case "processing": return "text-[#F59E0B]";
      case "accepted": return "text-[#10B981]";
      case "failed": return "text-[#EF4444]";
      default: return "text-gray-500";
    }
  };

  React.useEffect(() => {
    let filtered = [...events];

    if (filters.selectedMonth) {
      const monthIndex = new Date(`${filters.selectedMonth} 1`).getMonth();
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDate);
        return eventDate.getMonth() === monthIndex;
      });
    }

    if (filters.selectedLounge) {
      filtered = filtered.filter((event) => {
        return event.loungeName === filters.selectedLounge;
      });
    }

    setFilteredEvents(filtered);
  }, [filters, events]);

  const displayedEvents = Object.keys(filters).some((key) => filters[key])
    ? filteredEvents
    : events;
  console.log("🚀 ~ Table ~ displayedEvents:", displayedEvents)

  const handleRowClick = (eventId) => {
    router.push(`/dashboard/event-management/${eventId}`);
  };

  return (
    <CustomPagination
      loading={isLoading}
      onPageChange={onPageChange}
      totalPages={totalPages}
      currentPage={currentPage}
    >
      <div className="bg-white rounded-xl overflow-y-auto min-h-[300px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Event Name</th>
              <th className="px-4 py-5 text-left text-nowrap">Users</th>
              <th className="px-4 py-5 text-left text-nowrap">Guest Limit</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Type</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-left text-nowrap">Budget</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>

          <tbody className="mt-10">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#012C57]" />
                    <p className="text-sm font-medium">Loading events data...</p>
                  </div>
                </td>
              </tr>
            ) : displayedEvents?.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500 font-medium">
                  No Events Found.
                </td>
              </tr>
            ) : (
              displayedEvents?.map((event, index) => {
                const profilePic =
                  event?.userId?.profilePicture?.location ||
                  (typeof event?.userId?.profilePicture === "string"
                    ? event?.userId?.profilePicture
                    : null) ||
                  event?.user?.profile ||
                  (typeof event?.user?.profilePicture === "string"
                    ? event?.user?.profilePicture
                    : null);
                console.log("🚀 ~ Table ~ profilePic:", profilePic)
                const userName =
                  event?.guestName ||
                  `${event?.userId?.firstName || ""} ${event?.userId?.lastName || ""}`.trim() ||
                  "Unknown Guest";
                const budgetAmount =
                  typeof event?.budget === "number" ? Number(event?.budget || 0) : 0;

                return (
                  <tr
                    key={event._id || index}
                    className="border-b border-[#D4D4D4] hover:bg-gray-50/80 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(event._id)}
                  >
                    <td className="px-4 py-6 text-sm font-semibold text-gray-900">
                      {event?.eventName}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        {profilePic ? (
                          <div
                            className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-gray-200 border border-gray-100 shrink-0"
                            style={{
                              backgroundImage: `url(${profilePic})`,
                            }}
                          />
                        ) : (
                          <div className="h-[43px] w-[43px] rounded-full bg-[#012C57] text-white font-semibold flex items-center justify-center text-sm shrink-0 border border-gray-100">
                            {getInitials(userName)}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">{userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-sm text-nowrap">
                      {utils.formatNumber(event?.guestLimit)}
                    </td>
                    <td className="px-4 py-6 text-sm text-nowrap">
                      {capitalize(event?.eventType)}
                    </td>
                    <td className="px-4 py-6 text-sm text-nowrap">
                      {utils.formatDateWithName(event?.eventDate)}
                    </td>
                    <td className="px-4 py-6 text-sm text-nowrap">
                      {event?.eventTime}
                    </td>
                    <td className={`px-4 py-6 text-sm font-bold ${getStatusColor(event?.status)}`}>
                      {capitalize(event?.status || "pending")}
                    </td>
                    <td className="px-4 py-6 text-sm font-semibold">
                      {utils.formatCurrency(budgetAmount)}
                    </td>
                    <td className="px-4 py-6 text-nowrap">
                      <div className="flex justify-center items-center text-gray-400 hover:text-gray-900 transition">
                        <IoIosArrowForward size={24} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CustomPagination>
  );
};

export default Table;
