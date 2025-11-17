"use client";
import React, { useState } from "react";
import CustomPagination from "@/components/common/CustomPagination";
import { IoIosArrowForward } from "react-icons/io";
import utils from "@/lib/utils";
import ShiftDetails from "./ShiftDetails";
import AddShiftAndScheduling from "./AddShiftAndScheduling";
import DeleteShiftPopup from "./DeleteShiftPopup";
import UpdateSuccessPopup from "./UpdateSuccessPopup";

const Table = () => {
  const initialEvents = [
    {
      date: "2025-11-10",
      time: "07:00 PM - 01:00 AM",
      role: "Head Bartender",
      event: "Corporate Party",
      bartender: {
        name: "John Doe",
        profileImage: "/images/profile.png",
      },
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-11",
      time: "06:00 PM - 12:00 AM",
      role: "Assistant Bartender",
      event: "Wedding Reception",
      bartender: null,
      status: "unfilled",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-12",
      time: "05:00 PM - 11:00 PM",
      role: "Bar Manager",
      event: "Birthday Party",
      bartender: {
        name: "Jane Smith",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-13",
      time: "08:00 PM - 02:00 AM",
      role: "Bartender",
      event: "Night Club Event",
      bartender: null,
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-14",
      time: "07:30 PM - 01:30 AM",
      role: "Head Bartender",
      event: "Private Party",
      bartender: {
        name: "Michael Johnson",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-15",
      time: "06:30 PM - 12:30 AM",
      role: "Bartender",
      event: "Music Festival",
      bartender: {
        name: "Olivia Martinez",
        profileImage: "/images/profile.png",
      },
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-16",
      time: "05:00 PM - 10:00 PM",
      role: "Assistant Bartender",
      event: "Charity Gala",
      bartender: null,
      status: "unfilled",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-17",
      time: "09:00 PM - 02:00 AM",
      role: "Bartender",
      event: "Halloween Bash",
      bartender: {
        name: "Emily Davis",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-18",
      time: "07:30 PM - 12:30 AM",
      role: "Bar Manager",
      event: "New Year Warmup",
      bartender: {
        name: "William Anderson",
        profileImage: "/images/profile.png",
      },
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-19",
      time: "04:00 PM - 10:00 PM",
      role: "Bartender",
      event: "Corporate Mixer",
      bartender: null,
      status: "unfilled",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-20",
      time: "06:00 PM - 11:30 PM",
      role: "Head Bartender",
      event: "Wine Tasting Night",
      bartender: {
        name: "James Brown",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-21",
      time: "05:30 PM - 10:30 PM",
      role: "Assistant Bartender",
      event: "Outdoor BBQ",
      bartender: null,
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-22",
      time: "07:00 PM - 01:00 AM",
      role: "Bartender",
      event: "DJ Night",
      bartender: {
        name: "Sophia Turner",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-23",
      time: "06:30 PM - 12:00 AM",
      role: "Bar Manager",
      event: "Luxury Launch Event",
      bartender: {
        name: "Robert Wilson",
        profileImage: "/images/profile.png",
      },
      status: "pending",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
    {
      date: "2025-11-24",
      time: "08:00 PM - 01:30 AM",
      role: "Head Bartender",
      event: "Holiday Celebration",
      bartender: {
        name: "Ava Clark",
        profileImage: "/images/profile.png",
      },
      status: "confirmed",
      instruction:
        "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    },
  ];

  const events = initialEvents;

  const [selected, setSelected] = useState(null); // {data, index}
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-[#FFAE10]"; // orange
      case "unfilled":
        return "text-[#DC3545]"; // red
      case "confirmed":
        return "text-[#28A745]"; // green
      default:
        return "text-gray-500";
    }
  };

  const onPageChange = (page) => {
    // handle pagination
  };

  const handleRowClick = (event, index) => {
    setSelected({ data: event, index });
    setDetailsOpen(true);
  };

  const handleDelete = () => {
    // static mode: do not remove data, only close modals
    setDeleteOpen(false);
    setDetailsOpen(false);
    setSelected(null);
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
              <th className="px-4 py-5 text-left text-nowrap">Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Role</th>
              <th className="px-4 py-5 text-left text-nowrap">Event</th>
              <th className="px-4 py-5 text-left text-nowrap">Bartender</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr
                key={index}
                className="border-b border-[#D4D4D4] cursor-pointer"
                onClick={() => handleRowClick(event, index)}
              >
                <td className="px-4 py-6">
                  {utils.formatDateWithName(event.date)}
                </td>
                <td className="px-4 py-6">{event.time}</td>
                <td className="px-4 py-6">{event.role}</td>
                <td className="px-4 py-6">{event.event}</td>
                <td className="px-4 py-6">
                  {event.bartender ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${event.bartender.profileImage})`,
                        }}
                      />
                      {event.bartender.name}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={`px-4 py-6 ${getStatusColor(event.status)}`}>
                  {utils.capitalize(event.status)}
                </td>
                <td className="px-4 py-6">
                  <div className="flex justify-center items-center">
                    <IoIosArrowForward size={24} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ShiftDetails
        isOpen={detailsOpen}
        onOpenChange={setDetailsOpen}
        data={selected ? selected.data : null}
        onEditClick={() => {
          setEditOpen(true);
          setDetailsOpen(false);
        }}
        onDeleteClick={() => setDeleteOpen(true)}
      />

      {/* Edit/Add Shift modal (reused component) */}
      <AddShiftAndScheduling
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        isEdit={true}
        data={selected ? selected.data : null}
        showTrigger={false}
      />

      {/* Delete confirmation for shift */}
      <DeleteShiftPopup
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />
    </CustomPagination>
  );
};

export default Table;
