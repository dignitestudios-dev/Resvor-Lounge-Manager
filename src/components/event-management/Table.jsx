"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomPagination from "@/components/common/CustomPagination";
import utils, { capitalize, getBookingStatusStyles } from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

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

  // const sortedServices = [...displayedEvents].sort((a, b) => {
  //   if (!sortConfig.key) return 0;

  //   let valA = a[sortConfig.key];
  //   let valB = b[sortConfig.key];

  //   // Convert guestLimit to number for numeric sorting
  //   if (sortConfig.key === "qty") {
  //     valA = parseInt(valA, 10);
  //     valB = parseInt(valB, 10);
  //   }

  //   if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
  //   if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
  //   return 0;
  // });

  // const requestSort = (key) => {
  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  return (
    <CustomPagination
      loading={isLoading}
      onPageChange={onPageChange}
      totalPages={totalPages}
      currentPage={currentPage}
    >
      <div className="bg-white rounded-xl overflow-y-auto">
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
            {displayedEvents?.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-500">
                  No events found.
                </td>
              </tr>
            ) : (
              displayedEvents?.map((event, index) => (
                <tr
                  key={event._id || index}
                  className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(event._id)}
                >
                  <td className="px-4 py-6">{event?.eventName}</td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      {/* <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${event.user.profile})`,
                        }}
                      /> */}
                      {event?.guestName}
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    {utils.formatNumber(event?.guestLimit)}
                  </td>
                  <td className="px-4 py-6 text-nowrap">{capitalize(event?.eventType)}</td>
                  <td className="px-4 py-6 text-nowrap">
                    {utils.formatDateWithName(event?.eventDate)}
                  </td>
                  <td className="px-4 py-6 text-nowrap">{event?.eventTime}</td>
                  <td className="px-4 py-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusStyles(event?.status) || ""}`}
                    >
                      {capitalize(event?.status || "pending")}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    {utils.formatNumber(event?.budget)}
                  </td>
                  <td className="px-4 py-6 text-nowrap">
                    <div className="flex justify-center items-center cursor-pointer">
                      <IoIosArrowForward size={24} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CustomPagination>
  );
};

export default Table;
