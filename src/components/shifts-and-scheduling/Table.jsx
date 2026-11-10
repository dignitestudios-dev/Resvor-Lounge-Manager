
"use client";

import React, { useState } from "react";
import CustomPagination from "@/components/common/CustomPagination";
import { IoIosArrowForward } from "react-icons/io";
import utils from "@/lib/utils";
import ShiftDetails from "./ShiftDetails";
import AddShiftAndScheduling from "./AddShiftAndScheduling";
import DeleteShiftPopup from "./DeleteShiftPopup";
import {
  useGetShifts,
  useGetEligibleEvents,
} from "@/lib/hooks/queries/useShifts";
import { useDeleteShift } from "@/lib/hooks/mutations/ShiftMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const Table = () => {
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const {
    data: shiftsResponse,
    isLoading,
    isError,
    error,
  } = useGetShifts({ page, limit: LIMIT });

  const { data: eventsResponse } = useGetEligibleEvents({
    page: 1,
    limit: 100,
  });

  const { mutate: deleteShift } = useDeleteShift();

  const shifts = shiftsResponse?.data || [];
  const eventsList = eventsResponse?.data || [];
  const totalPages = shiftsResponse?.pagination?.totalPages || 1;

  // Normalize shift data
  const normalizedShifts = shifts.map((shift) => {
    const bartenders = (shift.bartenderIds || []).map((b) => {
      if (typeof b === "object" && b !== null) {
        const imgUrl =
          typeof b.profileImage === "object" && b.profileImage !== null
            ? b.profileImage.location || b.profileImage.url
            : typeof b.profileImage === "string" &&
                b.profileImage.trim() !== ""
              ? b.profileImage
              : null;

        return {
          name: b.fullName || b.name || "-",
          profileImage: imgUrl,
        };
      }

      return {
        name: typeof b === "string" ? b : "-",
        profileImage: null,
      };
    });

    const startStr = utils.formatTime12(shift.startDateTime);
    const endStr = utils.formatTime12(shift.endDateTime);

    let eventTitle = "Not Assigned";

    if (
      typeof shift.referenceId === "object" &&
      shift.referenceId !== null
    ) {
      eventTitle =
        shift.referenceId.title ||
        shift.referenceId.name ||
        shift.referenceId.guestName ||
        "Not Assigned";
    } else if (typeof shift.referenceId === "string") {
      const foundEvent = eventsList.find(
        (e) => e._id === shift.referenceId
      );

      eventTitle = foundEvent
        ? foundEvent.title ||
          foundEvent.name ||
          foundEvent.guestName ||
          "Not Assigned"
        : "Not Assigned";
    }

    return {
      ...shift,
      date: shift.startDateTime,
      time:
        startStr && endStr
          ? `${startStr} - ${endStr}`
          : "",
      role: shift.role || "-",
      event: eventTitle,
      bartenders,
      status: shift.status || "pending",
      instruction: shift.instructions || "",
    };
  });

  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Status colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()?.replace(/_/g, " ")) {
      case "completed":
        return "text-[#22C55E]";
      case "confirmed":
        return "text-[#3B82F6]";
      case "expired":
        return "text-[#6B7280]";
      case "rejected":
        return "text-[#EF4444]";
      case "approved":
        return "text-[#10B981]";
      case "published":
        return "text-[#6366F1]";
      case "cancelled":
        return "text-[#DC2626]";
      case "upcoming":
        return "text-[#8B5CF6]";
      case "pending":
      case "draft":
        return "text-[#F59E0B]";
      default:
        return "text-gray-500";
    }
  };

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowClick = (event, index) => {
    setSelected({ data: event, index });
    setDetailsOpen(true);
  };

  // Delete shift
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

  // Common text wrapping classes
  const cellClass =
    "px-3 sm:px-4 py-5 align-middle whitespace-normal break-words [overflow-wrap:anywhere] min-w-0";

  return (
    <CustomPagination
      loading={isLoading}
      onPageChange={onPageChange}
      totalPages={totalPages}
    >
      {/* Table Wrapper */}
      <div className="w-full max-w-full bg-white rounded-xl overflow-x-hidden overflow-y-auto">

        <table className="w-full max-w-full table-fixed border-collapse">

          {/* Fixed Column Widths */}
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>

          {/* Table Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-3 sm:px-4 py-5 text-left text-nowrap font-semibold">
                Date
              </th>

              <th className="px-3 sm:px-4 py-5 text-left font-semibold">
                Time
              </th>

              <th className="px-3 sm:px-4 py-5 text-left font-semibold">
                Role
              </th>

              <th className="px-3 sm:px-4 py-5 text-left font-semibold">
                Event
              </th>

              <th className="px-3 sm:px-4 py-5 text-left font-semibold">
                Worker
              </th>

              <th className="px-3 sm:px-4 py-5 text-left font-semibold">
                Status
              </th>

              <th className="px-3 sm:px-4 py-5 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {isError ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-red-500 font-medium"
                >
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load shifts."}
                </td>
              </tr>
            ) : normalizedShifts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  No Shifts Found
                </td>
              </tr>
            ) : (
              normalizedShifts.map((event, index) => (
                <tr
                  key={event._id || index}
                  className="border-b border-[#D4D4D4] cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowClick(event, index)}
                >
                  {/* Date */}
                  <td className={cellClass}>
                    <span className="block break-words [overflow-wrap:anywhere]">
                      {utils.formatDateWithName(event.date)}
                    </span>
                  </td>

                  {/* Time */}
                  <td className={cellClass}>
                    <span className="block break-words [overflow-wrap:anywhere]">
                      {event.time || "-"}
                    </span>
                  </td>

                  {/* Role */}
                  <td className={cellClass}>
                    <span className="block break-words [overflow-wrap:anywhere]">
                      {event.role}
                    </span>
                  </td>

                  {/* Event */}
                  <td className={cellClass}>
                    <span className="block break-words [overflow-wrap:anywhere]">
                      {event.event}
                    </span>
                  </td>

                  {/* Workers */}
                  <td className={cellClass}>
                    {event.bartenders?.length > 0 ? (
                      <div className="flex flex-col gap-2 min-w-0 w-full">
                        {event.bartenders.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-center gap-2 min-w-0 w-full"
                          >
                            {b.profileImage ? (
                              <img
                                src={b.profileImage}
                                alt={b.name}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold border border-gray-300 shrink-0">
                                {b.name
                                  ? b.name.charAt(0).toUpperCase()
                                  : "B"}
                              </div>
                            )}

                            <span className="text-sm font-medium min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                              {b.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className={`${cellClass} ${getStatusColor(event.status)}`}>
                    <span className="block break-words [overflow-wrap:anywhere]">
                      {utils.capitalize(event.status)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-2 py-5 text-center align-middle">
                    <div className="flex justify-center items-center">
                      <IoIosArrowForward size={22} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shift Details */}
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

      {/* Edit Shift Modal */}
      <AddShiftAndScheduling
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        isEdit={true}
        data={selected ? selected.data : null}
        showTrigger={false}
      />

      {/* Delete Confirmation */}
      <DeleteShiftPopup
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />

    </CustomPagination>
  );
};

export default Table;
