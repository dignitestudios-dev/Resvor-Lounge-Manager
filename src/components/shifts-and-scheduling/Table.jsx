"use client";
import React, { useState } from "react";
import CustomPagination from "@/components/common/CustomPagination";
import { IoIosArrowForward } from "react-icons/io";
import utils from "@/lib/utils";
import ShiftDetails from "./ShiftDetails";
import AddShiftAndScheduling from "./AddShiftAndScheduling";
import DeleteShiftPopup from "./DeleteShiftPopup";
import UpdateSuccessPopup from "./UpdateSuccessPopup";
import { useGetShifts, useGetEligibleEvents } from "@/lib/hooks/queries/useShifts";
import { useDeleteShift } from "@/lib/hooks/mutations/ShiftMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const Table = () => {
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data: shiftsResponse, isLoading, isError, error } = useGetShifts({ page, limit: LIMIT });
  const { data: eventsResponse } = useGetEligibleEvents({ page: 1, limit: 100 });
  const { mutate: deleteShift } = useDeleteShift();

  const shifts = shiftsResponse?.data || [];
  const eventsList = eventsResponse?.data || [];
  const totalPages = shiftsResponse?.pagination?.totalPages || 1;

  const normalizedShifts = shifts.map((shift) => {
    const bartenders = (shift.bartenderIds || []).map((b) => ({
      name: typeof b === "object" ? b.fullName : b,
      profileImage: typeof b === "object" ? (b.profileImage?.location || "/images/profile.png") : "/images/profile.png",
    }));
    const startStr = utils.formatTime12(shift.startDateTime);
    const endStr = utils.formatTime12(shift.endDateTime);
    const foundEvent = eventsList.find((e) => e._id === shift.referenceId);

    return {
      ...shift,
      date: shift.startDateTime,
      time: startStr && endStr ? `${startStr} - ${endStr}` : "",
      role: shift.role,
      event: foundEvent ? foundEvent.title : shift.referenceId || "-",
      bartenders,
      status: shift.status || "pending",
      instruction: shift.instructions || "",
    };
  });

  const [selected, setSelected] = useState(null); // {data, index}
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "draft":
        return "text-gray-700";
      case "unfilled":
        return "text-[#DC3545]"; // red
      case "confirmed":
        return "text-[#28A745]"; // green
      default:
        return "text-[#28A745]";
    }
  };

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowClick = (event, index) => {
    setSelected({ data: event, index });
    setDetailsOpen(true);
  };

  const handleDelete = () => {
    if (!selected?.data?._id) return;
    deleteShift(selected.data._id, {
      onSuccess: () => {
        SuccessToast("Shift deleted successfully.");
        setDeleteOpen(false);
        setDetailsOpen(false);
        setSelected(null);
      },
      onError: (error) => {
        ErrorToast(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete shift."
        );
      },
    });
  };

  return (
    <CustomPagination
      loading={isLoading}
      onPageChange={onPageChange}
      totalPages={totalPages}
    >
      <div className="bg-white rounded-xl overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Role</th>
              <th className="px-4 py-5 text-left text-nowrap">Event</th>
              <th className="px-4 py-5 text-left text-nowrap">Worker</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {isError ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-red-500 font-medium">
                  {error?.response?.data?.message || error?.message || "Failed to load shifts."}
                </td>
              </tr>
            ) : normalizedShifts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No shifts found.
                </td>
              </tr>
            ) : (
              normalizedShifts.map((event, index) => (
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
                    {event.bartenders && event.bartenders.length > 0 ? (
                      <span className="text-sm">
                        {event.bartenders.map((b) => b.name).join(", ")}
                      </span>
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
              ))
            )}
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
