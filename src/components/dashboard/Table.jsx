"use client";
import React, { useState } from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const Table = ({ data = [], isLoading = false, pagination, onPageChange }) => {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState({
    key: "customerName",
    direction: "asc",
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "incoming":
      case "pending":
        return "text-[#7D72F1]";
      case "processing":
      case "confirmed":
        return "text-[#0052CC]";
      case "completed":
        return "text-[#28A745]";
      case "cancelled":
      case "rejected":
        return "text-[#DC3545]";
      default:
        return "text-gray-500";
    }
  };

  const formattedItems = (data || []).map((item) => {
    const customerName =
      item?.guestName ||
      `${item?.userId?.firstName || ""} ${item?.userId?.lastName || ""}`.trim() ||
      "Unknown Guest";
    const profilePic = item?.userId?.profilePicture?.location || "/images/profile.png";
    const bookingDate = item?.bookingDate || item?.startTime;
    const tableCode = item?.tableIds?.map((t) => t.code).join(", ") || "N/A";
    const qty = item?.guestCount || 0;
    const amount = typeof item?.amountPaid === "number" ? item.amountPaid / 100 : 0;
    const status = item?.status || "N/A";
    const orderId = item?._id ? `#${item._id.slice(-6).toUpperCase()}` : "N/A";

    return {
      raw: item,
      _id: item?._id,
      orderId,
      customerName,
      profilePic,
      booking: bookingDate,
      tableCode,
      qty,
      amount,
      status,
    };
  });

  const sortedItems = [...formattedItems].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key === "qty" || sortConfig.key === "amount") {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
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
      totalPages={pagination?.totalPages || 1}
    >
      <div className="bg-white rounded-xl overflow-y-auto min-h-[300px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Order ID</th>
              <th
                onClick={() => requestSort("customerName")}
                className="px-4 py-5 text-left text-nowrap cursor-pointer select-none"
              >
                Customer Name
                {sortConfig.key === "customerName" ? (
                  sortConfig.direction === "asc" ? (
                    <span className="ml-1">↑</span>
                  ) : (
                    <span className="ml-1">↓</span>
                  )
                ) : (
                  ""
                )}
              </th>
              <th className="px-4 py-5 text-left text-nowrap">Booking</th>
              <th className="px-4 py-5 text-left text-nowrap">Table</th>
              <th className="px-4 py-5 text-left text-nowrap">Qty</th>
              <th className="px-4 py-5 text-left text-nowrap">Amount</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="mt-10">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#012C57]" />
                    <p className="text-sm font-medium">Loading dashboard data...</p>
                  </div>
                </td>
              </tr>
            ) : sortedItems?.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500 font-medium">
                  No dashboard records found.
                </td>
              </tr>
            ) : (
              sortedItems?.map((order, index) => (
                <tr
                  key={order._id || index}
                  onClick={() => order._id && router.push(`/dashboard/bookings/${order._id}`)}
                  className="border-b border-[#D4D4D4] hover:bg-gray-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-6 text-sm font-medium text-gray-800">
                    {order?.orderId}
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-gray-200 border border-gray-100 shrink-0"
                        style={{
                          backgroundImage: `url(${order?.profilePic})`,
                        }}
                      />
                      <span className="font-semibold text-gray-900">{order?.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-sm">
                    {order?.booking
                      ? `${utils.formatDateWithName(order?.booking)} ${utils.formatTime(
                          order?.booking,
                          "12"
                        )}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-6 text-nowrap font-medium text-gray-700">
                    {order?.tableCode}
                  </td>
                  <td className="px-4 py-6 text-sm font-medium">
                    {utils.formatNumber(order?.qty)}
                  </td>
                  <td className="px-4 py-6 text-sm font-semibold">
                    {utils.formatCurrency(order?.amount)}
                  </td>
                  <td className={`px-4 py-6 text-sm font-bold ${getStatusColor(order?.status)}`}>
                    {utils.capitalize(order?.status?.replaceAll("_", " "))}
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
