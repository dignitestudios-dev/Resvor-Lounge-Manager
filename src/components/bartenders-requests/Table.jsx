"use client";
import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import RequestDetails from "./RequestDetails";
import RejectReasonPopup from "./RejectReasonPopup";
import CustomPagination from "@/components/common/CustomPagination";
import { useGetShiftRequests } from "@/lib/hooks/queries/useShiftRequests";
import { useReviewShiftRequest } from "@/lib/hooks/mutations/useReviewShiftRequest";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import utils from "@/lib/utils";

const Table = () => {
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const { data: shiftRequestsResponse, isLoading } = useGetShiftRequests({ page, limit: LIMIT });
  const { mutate: reviewRequest, isPending: isReviewing } = useReviewShiftRequest();

  const rawRequests = shiftRequestsResponse?.data || [];
  const totalPages = shiftRequestsResponse?.pagination?.totalPages || 1;

  const handleRowClick = (req) => {
    setSelected(req);
    setDetailsOpen(true);
  };

  const handleRejectInit = () => {
    setDetailsOpen(false);
    setRejectReasonOpen(true);
  };

  const handleConfirmReject = (reason) => {
    if (!selected) return;
    reviewRequest(
      { id: selected._id, status: "rejected", reviewNote: reason },
      {
        onSuccess: () => {
          SuccessToast("Request rejected successfully.");
          setRejectReasonOpen(false);
          setSelected(null);
        },
        onError: (err) => {
          ErrorToast(err.message || "Failed to reject request.");
        },
      }
    );
  };

  const handleCancelReject = () => {
    setRejectReasonOpen(false);
    setDetailsOpen(true);
  };

  const handleAccept = () => {
    if (!selected) return;
    reviewRequest(
      { id: selected._id, status: "approved", reviewNote: "Approved by Manager" },
      {
        onSuccess: () => {
          SuccessToast("Request approved successfully.");
          setDetailsOpen(false);
          setSelected(null);
        },
        onError: (err) => {
          ErrorToast(err.message || "Failed to approve request.");
        },
      }
    );
  };

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

  const bartenderRequests = rawRequests.map((req) => {
    // Determine type display
    const isShiftSwap = req.type === "shift_swap" || req.type === "swap_shift";
    let displayType = isShiftSwap ? "Shift Swap" : "Time off";

    // Parse status
    let displayStatus = "Pending";
    if (req.status) {
      displayStatus = req.status.charAt(0).toUpperCase() + req.status.slice(1);
    }

    // Shift objects
    const reqShiftObj = req.requestorShiftId || req.shiftId;
    const targetShiftObj = req.targetShiftId;

    // Helper for formatting start/end times
    const formatRange = (startIso, endIso) => {
      if (!startIso || !endIso) return "";
      const startStr = utils.formatTime12(startIso);
      const endStr = utils.formatTime12(endIso);
      return startStr && endStr ? `${startStr} - ${endStr}` : "";
    };

    const reqTimeStr = formatRange(reqShiftObj?.startDateTime, reqShiftObj?.endDateTime);
    const targetTimeStr = formatRange(targetShiftObj?.startDateTime, targetShiftObj?.endDateTime);

    // Fallback date & time
    const dateVal = reqShiftObj?.startDateTime || req.startDate || req.createdAt;

    let timeStr = reqTimeStr;
    if (!timeStr && req.startDate && req.endDate) {
      timeStr = formatRange(req.startDate, req.endDate);
    }
    if (!timeStr) timeStr = "N/A";

    // Event display
    let eventTitle = "Not Assigned";
    const refObj = reqShiftObj?.referenceId || req.shiftId?.referenceId;
    if (typeof refObj === "object" && refObj !== null) {
      eventTitle = refObj.title || refObj.name || refObj.guestName || "Not Assigned";
    } else if (reqShiftObj?.referenceType) {
      eventTitle = reqShiftObj.referenceType;
    }

    // Normalize profile image URL
    const profileImageUrl =
      typeof req.requestorId?.profileImage === "string"
        ? req.requestorId.profileImage
        : req.requestorId?.profileImage?.location || "/images/profile.png";

    return {
      _id: req._id,
      raw: req,
      isShiftSwap,
      bartender: {
        name: req.requestorId?.fullName || "Unknown Bartender",
        image: profileImageUrl,
      },
      date: dateVal,
      // time: isShiftSwap && targetTimeStr ? `${reqTimeStr} ➔ ${targetTimeStr}` : timeStr,
      time: isShiftSwap && targetTimeStr ? `${reqTimeStr}` : timeStr,
      type: displayType,
      reason: req.reason || "No reason provided",
      status: displayStatus,

      // Details popup fields
      event: eventTitle,
      role: reqShiftObj?.role || req.role || "Bartender",
      instruction: reqShiftObj?.instructions || "Not Provided",

      // Detailed shift swap objects
      requestorShift: reqShiftObj,
      requestorShiftTime: reqTimeStr,
      targetShift: targetShiftObj,
      targetShiftTime: targetTimeStr,
    };
  });

  const sortedBartenders = [...bartenderRequests].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valA = sortConfig.key === "name" ? a.bartender?.name : a[sortConfig.key];
    let valB = sortConfig.key === "name" ? b.bartender?.name : b[sortConfig.key];

    if (!valA) return 1;
    if (!valB) return -1;

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
      onPageChange={(p) => setPage(p)}
      totalPages={totalPages}
    >
      <div className=" rounded-xl overflow-y-auto ">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[#E8E8FF]">
            <tr>
              <th
                onClick={() => requestSort("name")}
                className="px-4 py-5 text-left text-nowrap cursor-pointer"
              >
                Name
                {sortConfig.key === "name" ? (
                  sortConfig.direction === "asc" ? (
                    <span className="ml-1">↑</span>
                  ) : (
                    <span className="ml-1">↓</span>
                  )
                ) : (
                  ""
                )}
              </th>
              <th className="px-4 py-5 text-left text-nowrap">Date</th>
              <th className="px-4 py-5 text-left text-nowrap">Time</th>
              <th className="px-4 py-5 text-left text-nowrap">Type</th>
              <th className="px-4 py-5 text-left text-nowrap">Reason</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && sortedBartenders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No Shift Requests Found.
                </td>
              </tr>
            ) : (
              sortedBartenders.map((req, index) => (
                <tr
                  key={req._id || index}
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
                    {req.date ? new Date(req.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) : "-"}
                  </td>
                  <td className="px-4 py-5">{req.time}</td>
                  <td className="px-4 py-5">{req.type}</td>
                  <td className="px-4 py-5 truncate max-w-[200px]" title={req.reason}>
                    {req.reason}
                  </td>
                  <td
                    className={`px-4 py-5 font-medium ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </td>
                  <td className="px-4 py-5 text-gray-500">
                    <div className="flex justify-center items-center">
                      <IoIosArrowForward size={22} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <RequestDetails
          isOpen={detailsOpen}
          onOpenChange={setDetailsOpen}
          data={selected}
          onReject={handleRejectInit}
          onAccept={handleAccept}
          loading={isReviewing}
        />

        <RejectReasonPopup
          isOpen={rejectReasonOpen}
          onOpenChange={setRejectReasonOpen}
          onConfirm={handleConfirmReject}
          onCancel={handleCancelReject}
          loading={isReviewing}
        />
      </div>
    </CustomPagination>
  );
};

export default Table;
