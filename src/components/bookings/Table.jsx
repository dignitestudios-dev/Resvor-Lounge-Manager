"use client";
import React from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()?.replace(/_/g, " ")) {
      case "completed": return "text-[#22C55E]";
      case "confirmed": return "text-[#3B82F6]";
      case "expired":   return "text-[#6B7280]";
      case "rejected":  return "text-[#EF4444]";
      case "approved":  return "text-[#10B981]";
      case "published": return "text-[#6366F1]";
      case "cancelled": return "text-[#DC2626]";
      case "upcoming":  return "text-[#8B5CF6]";
      case "pending":
      case "awaiting payment":
      case "incoming":
      case "processing": return "text-[#F59E0B]";
      case "accepted": return "text-[#10B981]";
      case "failed":   return "text-[#EF4444]";
      default: return "text-gray-500";
    }
  };

  // Transform API data to match table structure
  const transformBookingData = (apiBookings) => {
    return apiBookings.map((booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      const bookingEventTime = `${utils.formatTime12(startTime)} - ${utils.formatTime12(endTime)}`;
      const userName =
        booking?.guestName ||
        `${booking.userId?.firstName || ""} ${booking.userId?.lastName || ""}`.trim() ||
        "Unknown Guest";
      const profilePic =
        booking.userId?.profilePicture?.location ||
        booking.user?.profileImage ||
        "/images/profile.png";

      return {
        _id: booking._id,
        bookingId: booking._id,
        user: {
          name: userName,
          profileImage: profilePic,
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
      <div className="bg-white rounded-xl overflow-y-auto min-h-[300px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Users</th>
              <th
                onClick={() => requestSort("loungeName")}
                className="px-4 py-5 text-left text-nowrap cursor-pointer select-none"
              >
                Lounge Name
              </th>
              <th className="px-4 py-5 text-left text-nowrap">Guest Limit</th>
              <th className="px-4 py-5 text-left text-nowrap">Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>

          <tbody className="mt-10">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#012C57]" />
                    <p className="text-sm font-medium">Loading bookings data...</p>
                  </div>
                </td>
              </tr>
            ) : sortedBookings?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                  No Bookings Found.
                </td>
              </tr>
            ) : (
              sortedBookings?.map((booking) => (
                <tr
                  key={booking._id}
                  onClick={() => handleRowClick(booking._id)}
                  className="border-b border-[#D4D4D4] hover:bg-gray-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-gray-200 border border-gray-100 shrink-0"
                        style={{
                          backgroundImage: `url(${booking?.user?.profileImage})`,
                        }}
                      />
                      <span className="font-semibold text-gray-900">{booking?.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-sm font-medium text-gray-800">
                    {booking?.loungeName}
                  </td>
                  <td className="px-4 py-6 text-sm text-nowrap">
                    {utils.formatNumber(booking?.guestLimit)}
                  </td>
                  <td className="px-4 py-6 text-sm text-nowrap">
                    {booking?.eventDate}
                  </td>
                  <td className="px-4 py-6 text-sm text-nowrap">
                    {booking?.eventTime}
                  </td>
                  <td className={`px-4 py-6 text-sm font-bold ${getStatusColor(booking?.status)}`}>
                    {utils.capitalize(booking?.status?.replaceAll("_", " "))}
                  </td>
                  <td className="px-4 py-6 text-nowrap">
                    <div className="flex justify-center items-center text-gray-400 hover:text-gray-900 transition">
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
