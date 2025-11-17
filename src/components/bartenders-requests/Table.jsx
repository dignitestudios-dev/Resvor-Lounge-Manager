"use client";
import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import RequestDetails from "./RequestDetails";
import AddShiftAndScheduling from "../shifts-and-scheduling/AddShiftAndScheduling";
import UpdateSuccessPopup from "../shifts-and-scheduling/UpdateSuccessPopup";

const Table = () => {
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleRowClick = (req) => {
    if (req.status.toLowerCase() === "pending") {
      setSelected(req);
      setDetailsOpen(true);
    }
  };

  const handleReject = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  const handleAccept = () => {
    setDetailsOpen(false);
    setUpdateOpen(true);
  };

  const handleUpdateComplete = () => {
    setUpdateOpen(false);
    setSuccessOpen(true);
  };

  const bartenderRequests = [
    {
      bartender: { name: "Alex Johnson", image: "/images/profile.png" },
      date: "2025-11-12T00:00:00Z",
      time: "06:00 PM - 12:00 AM",
      type: "Shift Swap",
      reason: "Attending friend’s wedding",
      status: "Approved",
    },
    {
      bartender: { name: "Maya Thompson", image: "/images/profile.png" },
      date: "2025-11-14T00:00:00Z",
      time: "08:00 PM - 02:00 AM",
      type: "Time off",
      reason: "Medical appointment",
      status: "Pending",
    },
    {
      bartender: { name: "Chris Evans", image: "/images/profile.png" },
      date: "2025-11-16T00:00:00Z",
      time: "05:00 PM - 11:00 PM",
      type: "Shift Swap",
      reason: "Family function",
      status: "Rejected",
    },
    {
      bartender: { name: "Lara Smith", image: "/images/profile.png" },
      date: "2025-11-18T00:00:00Z",
      time: "07:00 PM - 01:00 AM",
      type: "Time off",
      reason: "Travel plans",
      status: "Approved",
    },
    {
      bartender: { name: "Jacob Lee", image: "/images/profile.png" },
      date: "2025-11-20T00:00:00Z",
      time: "04:00 PM - 10:00 PM",
      type: "Shift Swap",
      reason: "Concert night",
      status: "Pending",
    },
    {
      bartender: { name: "Nina Patel", image: "/images/profile.png" },
      date: "2025-11-22T00:00:00Z",
      time: "03:00 PM - 09:00 PM",
      type: "Time off",
      reason: "Birthday celebration",
      status: "Approved",
    },
    {
      bartender: { name: "Ryan Green", image: "/images/profile.png" },
      date: "2025-11-24T00:00:00Z",
      time: "09:00 PM - 03:00 AM",
      type: "Shift Swap",
      reason: "Family emergency",
      status: "Rejected",
    },
    {
      bartender: { name: "Olivia Brown", image: "/images/profile.png" },
      date: "2025-11-25T00:00:00Z",
      time: "05:00 PM - 11:00 PM",
      type: "Time off",
      reason: "Attending workshop",
      status: "Approved",
    },
    {
      bartender: { name: "Ethan Williams", image: "/images/profile.png" },
      date: "2025-11-27T00:00:00Z",
      time: "07:00 PM - 01:00 AM",
      type: "Shift Swap",
      reason: "Graduation event",
      status: "Pending",
    },
    {
      bartender: { name: "Sophia Carter", image: "/images/profile.png" },
      date: "2025-11-29T00:00:00Z",
      time: "06:00 PM - 12:00 AM",
      type: "Time off",
      reason: "Family Day Celebration",
      status: "Rejected",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-[#FFAE10]";
      case "approved":
        return "text-[#28A745]";
      case "rejected":
        return "text-[#DC3545]";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-y-auto shadow-sm">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-[#E8E8FF]">
          <tr>
            <th className="px-4 py-5 text-left text-nowrap">Bartender</th>
            <th className="px-4 py-5 text-left text-nowrap">Date</th>
            <th className="px-4 py-5 text-left text-nowrap">Time</th>
            <th className="px-4 py-5 text-left text-nowrap">Type</th>
            <th className="px-4 py-5 text-left text-nowrap">Reason</th>
            <th className="px-4 py-5 text-left text-nowrap">Status</th>
            <th className="px-4 py-5 text-center text-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {bartenderRequests.map((req, index) => (
            <tr
              key={index}
              className="border-b border-[#D4D4D4] hover:bg-gray-50 cursor-pointer"
              onClick={() => handleRowClick(req)}
            >
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${req.bartender.image})`,
                    }}
                  />
                  {req.bartender.name}
                </div>
              </td>
              <td className="px-4 py-5">
                {new Date(req.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-5">{req.time}</td>
              <td className="px-4 py-5">{req.type}</td>
              <td className="px-4 py-5">{req.reason}</td>
              <td
                className={`px-4 py-5 font-medium ${getStatusColor(
                  req.status
                )}`}
              >
                {req.status}
              </td>
              <td className="px-4 py-5 text-gray-500">
                <div className="flex justify-center items-center cursor-pointer">
                  <IoIosArrowForward size={22} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <RequestDetails
        isOpen={detailsOpen}
        onOpenChange={setDetailsOpen}
        data={selected}
        onReject={handleReject}
        onAccept={handleAccept}
      />

      <AddShiftAndScheduling
        isOpen={updateOpen}
        onOpenChange={setUpdateOpen}
        isEdit={true}
        data={selected}
        showTrigger={false}
        onUpdateSubmit={handleUpdateComplete}
      />

      <UpdateSuccessPopup isOpen={successOpen} onOpenChange={setSuccessOpen} />
    </div>
  );
};

export default Table;
