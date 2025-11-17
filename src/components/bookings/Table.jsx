"use client";
import React from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";

const Table = () => {
  const router = useRouter();
  const events = [
    {
      bookingId: "AD111515",
      user: {
        name: "Christine Easom",
        profileImage: "/images/profile.png",
      },
      guestLimit: 20,
      eventType: "Birthday Party",
      eventDate: "Jan 02, 2025",
      eventTime: "08:00 - 09:00",
      ticketDoor: 20,
    },
    {
      bookingId: "AD111516",
      user: {
        name: "John Smith",
        profileImage: "/images/profile.png",
      },
      guestLimit: 15,
      eventType: "Wedding Reception",
      eventDate: "Jan 03, 2025",
      eventTime: "02:00 PM - 04:00 PM",
      ticketDoor: 15,
    },
    {
      bookingId: "AD111517",
      user: {
        name: "Sarah Johnson",
        profileImage: "/images/profile.png",
      },
      guestLimit: 30,
      eventType: "Corporate Event",
      eventDate: "Jan 05, 2025",
      eventTime: "06:00 PM - 09:00 PM",
      ticketDoor: 28,
    },
    {
      bookingId: "AD111518",
      user: {
        name: "Mike Wilson",
        profileImage: "/images/profile.png",
      },
      guestLimit: 10,
      eventType: "Anniversary",
      eventDate: "Jan 07, 2025",
      eventTime: "07:00 PM - 10:00 PM",
      ticketDoor: 10,
    },
    {
      bookingId: "AD111519",
      user: {
        name: "Emily Davis",
        profileImage: "/images/profile.png",
      },
      guestLimit: 25,
      eventType: "Baby Shower",
      eventDate: "Jan 08, 2025",
      eventTime: "11:00 AM - 02:00 PM",
      ticketDoor: 22,
    },
    {
      bookingId: "AD111520",
      user: {
        name: "Robert Brown",
        profileImage: "/images/profile.png",
      },
      guestLimit: 50,
      eventType: "Conference",
      eventDate: "Jan 10, 2025",
      eventTime: "09:00 AM - 05:00 PM",
      ticketDoor: 45,
    },
    {
      bookingId: "AD111521",
      user: {
        name: "Lisa Anderson",
        profileImage: "/images/profile.png",
      },
      guestLimit: 12,
      eventType: "Dinner Party",
      eventDate: "Jan 12, 2025",
      eventTime: "07:30 PM - 11:00 PM",
      ticketDoor: 12,
    },
    {
      bookingId: "AD111522",
      user: {
        name: "David Miller",
        profileImage: "/images/profile.png",
      },
      guestLimit: 40,
      eventType: "Product Launch",
      eventDate: "Jan 15, 2025",
      eventTime: "03:00 PM - 06:00 PM",
      ticketDoor: 38,
    },
    {
      bookingId: "AD111523",
      user: {
        name: "Jennifer Taylor",
        profileImage: "/images/profile.png",
      },
      guestLimit: 18,
      eventType: "Graduation Party",
      eventDate: "Jan 18, 2025",
      eventTime: "01:00 PM - 04:00 PM",
      ticketDoor: 16,
    },
    {
      bookingId: "AD111524",
      user: {
        name: "Kevin Martin",
        profileImage: "/images/profile.png",
      },
      guestLimit: 35,
      eventType: "Networking Event",
      eventDate: "Jan 20, 2025",
      eventTime: "05:00 PM - 08:00 PM",
      ticketDoor: 32,
    },
  ];

  const onPageChange = (page) => {
    // getAllEvents(page);
  };

  const handleRowClick = (index) => {
    router.push(`/dashboard/bookings/${index}`);
  };

  return (
    <CustomPagination
      loading={false}
      onPageChange={onPageChange}
      totalPages={10}
    >
      <div className="bg-white rounded-xl overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Booking ID</th>
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
            {events?.map((event, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(index)}
                className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50 transition-all"
              >
                <td className="px-4 py-6">{event?.bookingId}</td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                      style={{
                        backgroundImage: `url(${event?.user?.profileImage})`,
                      }}
                    />
                    {event?.user?.name}
                  </div>
                </td>
                <td className="px-4 py-6">
                  {utils.formatNumber(event?.guestLimit)}
                </td>
                <td className="px-4 py-6">
                  {utils.capitalize(event?.eventType)}
                </td>
                <td className="px-4 py-6">{event?.eventDate}</td>
                <td className="px-4 py-6">{event?.eventTime}</td>
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
