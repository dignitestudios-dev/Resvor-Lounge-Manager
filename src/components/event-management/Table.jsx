"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

const Table = ({ filters = {}, events }) => {
  const router = useRouter();
  const [filteredEvents, setFilteredEvents] = React.useState([]);

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
  }, [filters]);

  const displayedEvents = Object.keys(filters).some((key) => filters[key])
    ? filteredEvents
    : events;

  const onPageChange = (page) => {
    // Pagination logic or API call
  };

  const handleRowClick = (index) => {
    router.push(`/dashboard/event-management/${index}`);
  };

  return (
    <CustomPagination
      loading={false}
      onPageChange={onPageChange}
      totalPages={5}
    >
      <div className="bg-white rounded-xl overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Lounge Name</th>
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
            {displayedEvents?.map((event, index) => (
              <tr
                key={index}
                className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(index)}
              >
                <td className="px-4 py-6">{event?.loungeName}</td>
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
