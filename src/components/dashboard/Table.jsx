"use client";
import React from "react";
import CustomPagination from "@/components/common/CustomPagination";
import utils from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

const Table = () => {
  const orders = [
    {
      orderId: "ORD-1001",
      customerName: "John Doe",
      booking: "2025-11-01T14:30:00Z",
      deliveryType: "Immediate",
      qty: 3,
      amount: 120.5,
      status: "Completed",
    },
    {
      orderId: "ORD-1002",
      customerName: "Jane Smith",
      booking: "2025-11-02T09:45:00Z",
      deliveryType: "Scheduled",
      qty: 1,
      amount: 45.0,
      status: "Incoming",
    },
    {
      orderId: "ORD-1003",
      customerName: "Michael Johnson",
      booking: "2025-11-03T16:20:00Z",
      deliveryType: "Immediate",
      qty: 5,
      amount: 230.75,
      status: "Processing",
    },
    {
      orderId: "ORD-1004",
      customerName: "Emily Davis",
      booking: "2025-11-04T11:10:00Z",
      deliveryType: "Scheduled",
      qty: 2,
      amount: 85.99,
      status: "Cancelled",
    },
    {
      orderId: "ORD-1005",
      customerName: "Robert Wilson",
      booking: "2025-11-05T15:00:00Z",
      deliveryType: "Immediate",
      qty: 4,
      amount: 178.4,
      status: "Completed",
    },
    {
      orderId: "ORD-1006",
      customerName: "Olivia Martinez",
      booking: "2025-11-06T13:25:00Z",
      deliveryType: "Scheduled",
      qty: 3,
      amount: 112.3,
      status: "Incoming",
    },
    {
      orderId: "ORD-1007",
      customerName: "James Brown",
      booking: "2025-11-07T10:15:00Z",
      deliveryType: "Immediate",
      qty: 2,
      amount: 96.0,
      status: "Completed",
    },
    {
      orderId: "ORD-1008",
      customerName: "Sophia Turner",
      booking: "2025-11-07T19:40:00Z",
      deliveryType: "Scheduled",
      qty: 6,
      amount: 340.2,
      status: "Processing",
    },
    {
      orderId: "ORD-1009",
      customerName: "William Anderson",
      booking: "2025-11-08T12:50:00Z",
      deliveryType: "Immediate",
      qty: 1,
      amount: 58.75,
      status: "Cancelled",
    },
    {
      orderId: "ORD-1010",
      customerName: "Ava Clark",
      booking: "2025-11-09T08:30:00Z",
      deliveryType: "Scheduled",
      qty: 4,
      amount: 210.1,
      status: "Completed",
    },
  ];

  const onPageChange = (page) => {
    // getAllUsers(page);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "incoming":
        return "text-[#7D72F1]";
      case "processing":
        return "text-[#FFAE10]";
      case "completed":
        return "text-[#28A745]";
      case "cancelled":
        return "text-[#DC3545]";
      default:
        return "text-gray-500"; // fallback color
    }
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
              <th className="px-4 py-5 text-left text-nowrap">Order ID</th>
              <th className="px-4 py-5 text-left text-nowrap">Customer Name</th>
              <th className="px-4 py-5 text-left text-nowrap">Booking</th>
              <th className="px-4 py-5 text-left text-nowrap">Delivery Type</th>
              <th className="px-4 py-5 text-left text-nowrap">Qty</th>
              <th className="px-4 py-5 text-left text-nowrap">Amount</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="mt-10">
            {orders?.map((order, index) => (
              <tr key={index} className="border-b border-[#D4D4D4]">
                <td className="px-4 py-6">{order?.orderId}</td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                      style={{
                        backgroundImage: `url(${"/images/profile.png"})`,
                      }}
                    />
                    {order?.customerName}
                  </div>
                </td>
                <td className="px-4 py-6">
                  {utils.formatDateWithName(order?.booking)}{" "}
                  {utils.formatTime(order?.booking, "12")}
                </td>
                <td className="px-4 py-6 text-nowrap">
                  {utils.capitalize(order?.deliveryType)}
                </td>
                <td className="px-4 py-6">{utils.formatNumber(order?.qty)}</td>
                <td className="px-4 py-6">
                  {utils.formatCurrency(order?.amount)}
                </td>
                <td className={`px-4 py-6 ${getStatusColor(order?.status)}`}>
                  {utils.capitalize(order?.status)}
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
