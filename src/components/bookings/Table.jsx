"use client";
import React from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils, { getBookingStatusStyles } from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";

const Table = ({
  filters = {},
  bookings = [],
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => { },
}) => {

  const router = useRouter();
  const [filteredBookings, setFilteredBookings] = React.useState([]);
  const [sortConfig, setSortConfig] = React.useState({
    key: "loungeName",
    direction: "asc",
  });

  // Transform API data to match table structure
  const transformBookingData = (apiBookings) => {
    return apiBookings.map((booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      const bookingEventTime = `${utils.formatTime12(startTime)} - ${utils.formatTime12(endTime)}`;
      const userName =
        `${booking.userId?.firstName || ""} ${booking.userId?.lastName || ""}`.trim();

      return {
        _id: booking._id,
        bookingId: booking._id,
        user: {
          name: userName,
          profileImage: "/images/profile.png",
        },
        loungeName: booking.loungeId?.name || "Unknown Lounge",
        guestLimit: booking.guestCount,
        eventType: booking.status || "Booking",
        eventDate: utils.formatDateWithName(booking.bookingDate),
        eventTime: bookingEventTime,
        ticketDoor: booking.guestCount,
        ...booking, // Include original data for reference
      };
    });
  };

  const transformedBookings = React.useMemo(() => {
    return transformBookingData(bookings);
  }, [bookings]);

  React.useEffect(() => {
    let filtered = [...transformedBookings];

    if (filters.selectedMonth) {
      const monthIndex = new Date(`${filters.selectedMonth} 1`).getMonth();
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.getMonth() === monthIndex;
      });
    }

    if (filters.selectedLounge) {
      filtered = filtered.filter((booking) => {
        return booking.loungeName === filters.selectedLounge;
      });
    }

    setFilteredBookings(filtered);
  }, [filters, transformedBookings]);

  const displayedBookings = Object.keys(filters).some((key) => filters[key])
    ? filteredBookings
    : transformedBookings;

  const handleRowClick = (bookingId) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const sortedBookings = [...displayedBookings].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    // Convert guestLimit to number for numeric sorting
    if (sortConfig.key === "guestLimit") {
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
              {/* <th className="px-4 py-5 text-left text-nowrap">Booking ID</th> */}
              <th className="px-4 py-5 text-left text-nowrap">Users</th>
              <th
                onClick={() => requestSort("loungeName")}
                className="px-4 py-5 text-left text-nowrap"
              >
                Lounge Name
                {/* {sortConfig.key === "loungeName" ? (
                  sortConfig.direction === "asc" ? (
                    <span className="cursor-pointer">↑</span>
                  ) : (
                    <span className="cursor-pointer">↓</span>
                  )
                ) : (
                  ""
                )} */}
              </th>
              <th className="px-4 py-5 text-left text-nowrap">Guest Limit</th>
              <th className="px-4 py-5 text-left text-nowrap">Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-left text-nowrap">Ticket Door</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>

          <tbody className="mt-10">
            {sortedBookings?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              sortedBookings?.map((booking) => (
                <tr
                  key={booking._id}
                  onClick={() => handleRowClick(booking._id)}
                  className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50 transition-all"
                >
                  {/* <td className="px-4 py-6">{booking?.bookingId}</td> */}
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      {/* <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                        style={{
                          backgroundImage: `url(${booking?.user?.profileImage})`,
                        }}
                      /> */}
                      {booking?.user?.name}
                    </div>
                  </td>
                  <td className="px-4 py-6">{booking?.loungeName}</td>
                  <td className="px-4 py-6">
                    {utils.formatNumber(booking?.guestLimit)}
                  </td>
                  <td className="px-4 py-6">{booking?.eventDate}</td>
                  <td className="px-4 py-6">{booking?.eventTime}</td>
                  <td className="px-4 py-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusStyles(
                        booking?.status,
                      )}`}
                    >
                      {utils.capitalize(booking?.status?.replaceAll("_", " "))}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    {utils.formatNumber(booking?.ticketDoor)}
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
