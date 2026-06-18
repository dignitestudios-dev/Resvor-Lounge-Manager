"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

const Table = ({
  filters = {},
  events,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) => {
  const router = useRouter();
  const [filteredEvents, setFilteredEvents] = React.useState([]);
  const [sortConfig, setSortConfig] = React.useState({
    key: "loungeName",
    direction: "asc",
  });

  React.useEffect(() => {
    let filtered = [...events];

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDate);
        return eventDate <= endDate;
      });
    }

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

  const handleRowClick = (eventId) => {
    router.push(`/dashboard/event-management/${eventId}`);
  };

  const sortedServices = [...displayedEvents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    // Convert guestLimit to number for numeric sorting
    if (sortConfig.key === "qty") {
      valA = parseInt(valA, 10);
      valB = parseInt(valB, 10);
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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
              {/* <th
                onClick={() => requestSort("loungeName")}
                className="px-4 py-5 text-left text-nowrap"
              >
                Lounge Name
                {sortConfig.key === "loungeName" ? (
                  sortConfig.direction === "asc" ? (
                    <span className="cursor-pointer">↑</span>
                  ) : (
                    <span className="cursor-pointer">↓</span>
                  )
                ) : (
                  ""
                )}
              </th> */}
              <th className="px-4 py-5 text-left text-nowrap">Event Name</th>
              <th className="px-4 py-5 text-left text-nowrap">Users</th>
              <th className="px-4 py-5 text-left text-nowrap">Guest Limit</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Type</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Event Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Ticket Door</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>

          <tbody className="mt-10">
            {sortedServices?.map((event, index) => (
              <tr
                key={event._id || index}
                className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(event._id)}
              >
                {/* <td className="px-4 py-6">{event?.loungeName}</td> */}
                <td className="px-4 py-6">{event?.eventName}</td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[43px] w-[43px] rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${event.user.profile})`,
                      }}
                    />
                    {event.user.name}
                  </div>
                </td>
                <td className="px-4 py-6">
                  {utils.formatNumber(event?.guestLimit)}
                </td>
                <td className="px-4 py-6 text-nowrap">{event?.eventType}</td>
                <td className="px-4 py-6 text-nowrap">
                  {utils.formatDateWithName(event?.eventDate)}
                </td>
                <td className="px-4 py-6 text-nowrap">{event?.eventTime}</td>
                <td className="px-4 py-6">
                  {utils.formatNumber(event?.ticketDoor)}
                </td>
                <td className="px-4 py-6 text-nowrap">
                  <div className="flex justify-center items-center cursor-pointer">
                    <IoIosArrowForward size={24} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomPagination>
  );
};

export default Table;
