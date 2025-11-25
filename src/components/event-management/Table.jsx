"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

const Table = ({ filters = {} }) => {
  const router = useRouter();
  const [filteredEvents, setFilteredEvents] = React.useState([]);

  const events = [
    {
      loungeName: "First Lounge",
      eventName: "Summer Night Bash",
      user: { name: "Olivia Carter", profile: "/images/profile.png" },
      guestLimit: 150,
      eventType: "Beach Party",
      eventDate: "2025-07-22T19:00:00Z",
      eventTime: "07:00 PM - 10:00 PM",
      ticketDoor: 25,
    },
    {
      loungeName: "First Lounge",
      eventName: "Cocktail Friday",
      user: { name: "Ethan Moore", profile: "/images/profile.png" },
      guestLimit: 80,
      eventType: "Corporate Meetup",
      eventDate: "2025-08-05T20:30:00Z",
      eventTime: "08:30 PM - 11:00 PM",
      ticketDoor: 18,
    },
    {
      loungeName: "First Lounge",
      eventName: "Winter Wonderland",
      user: { name: "Sophia Kim", profile: "/images/profile.png" },
      guestLimit: 300,
      eventType: "Charity Gala",
      eventDate: "2025-12-20T18:00:00Z",
      eventTime: "06:00 PM - 11:00 PM",
      ticketDoor: 40,
    },
    {
      loungeName: "Second Lounge",
      eventName: "Beach Cocktail Fiesta",
      user: { name: "Liam Parker", profile: "/images/profile.png" },
      guestLimit: 200,
      eventType: "Sunset Gathering",
      eventDate: "2025-09-10T17:00:00Z",
      eventTime: "05:00 PM - 09:00 PM",
      ticketDoor: 30,
    },
    {
      loungeName: "Second Lounge",
      eventName: "New Year Sparkles",
      user: { name: "Emma Davis", profile: "/images/profile.png" },
      guestLimit: 500,
      eventType: "New Year Celebration",
      eventDate: "2025-12-31T21:00:00Z",
      eventTime: "09:00 PM - 01:00 AM",
      ticketDoor: 50,
    },
    {
      loungeName: "First Lounge",
      eventName: "Birthday Bash Deluxe",
      user: { name: "Michael Reed", profile: "/images/profile.png" },
      guestLimit: 120,
      eventType: "Birthday Party",
      eventDate: "2025-11-15T18:30:00Z",
      eventTime: "06:30 PM - 10:30 PM",
      ticketDoor: 20,
    },
    {
      loungeName: "First Lounge",
      eventName: "Wedding Afterparty",
      user: { name: "Ava Martinez", profile: "/images/profile.png" },
      guestLimit: 250,
      eventType: "Wedding Celebration",
      eventDate: "2025-10-05T19:00:00Z",
      eventTime: "07:00 PM - 12:00 AM",
      ticketDoor: 45,
    },
    {
      loungeName: "Second Lounge",
      eventName: "Tech Founders Meetup",
      user: { name: "Noah Johnson", profile: "/images/profile.png" },
      guestLimit: 100,
      eventType: "Networking Event",
      eventDate: "2025-11-25T17:30:00Z",
      eventTime: "05:30 PM - 09:00 PM",
      ticketDoor: 35,
    },
    {
      loungeName: "First Lounge",
      eventName: "Jazz & Wine Night",
      user: { name: "Luna Garcia", profile: "/images/profile.png" },
      guestLimit: 90,
      eventType: "Live Music Event",
      eventDate: "2025-12-10T20:00:00Z",
      eventTime: "08:00 PM - 11:00 PM",
      ticketDoor: 28,
    },
    {
      loungeName: "First Lounge",
      eventName: "Family Fun Festival",
      user: { name: "Daniel Lee", profile: "/images/profile.png" },
      guestLimit: 400,
      eventType: "Community Festival",
      eventDate: "2025-09-25T10:00:00Z",
      eventTime: "10:00 AM - 06:00 PM",
      ticketDoor: 15,
    },
  ];

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
