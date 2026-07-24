"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import Edit2 from "@/components/icons/Edit2";
import Delete2 from "@/components/icons/Delete2";
import utils from "@/lib/utils";
import Edit from "../icons/Edit";
import Delete from "../icons/Delete";
import { useGetShiftById, useGetEligibleEvents } from "@/lib/hooks/queries/useShifts";

const ShiftDetails = ({
  isOpen,
  onOpenChange,
  data,
  onEditClick,
  onDeleteClick,
}) => {
  const { data: shiftDetail, isLoading } = useGetShiftById(data?._id);
  const { data: eventsResponse } = useGetEligibleEvents({ page: 1, limit: 100 });
  const eventsList = eventsResponse?.data || [];

  let eventName = "-";
  if (typeof shiftDetail?.referenceId === "object" && shiftDetail?.referenceId !== null) {
    eventName =
      shiftDetail.referenceId.title ||
      shiftDetail.referenceId.name ||
      shiftDetail.referenceId.guestName ||
      "-";
  } else if (typeof shiftDetail?.referenceId === "string") {
    const foundEvent = eventsList.find((e) => e._id === shiftDetail.referenceId);
    eventName = foundEvent
      ? foundEvent.title || foundEvent.name || foundEvent.guestName
      : shiftDetail.referenceId;
  }

  const bartendersList = (shiftDetail?.bartenderIds || []).map((b) => {
    if (typeof b === "object" && b !== null) {
      const imgUrl =
        typeof b.profileImage === "object" && b.profileImage !== null
          ? b.profileImage.location || b.profileImage.url
          : typeof b.profileImage === "string" && b.profileImage.trim() !== ""
          ? b.profileImage
          : null;

      return {
        name: b.fullName || b.name || "-",
        profileImage: imgUrl,
      };
    }
    return { name: typeof b === "string" ? b : "-", profileImage: null };
  });

  const startStr = shiftDetail ? utils.formatTime12(shiftDetail.startDateTime) : "";
  const endStr = shiftDetail ? utils.formatTime12(shiftDetail.endDateTime) : "";
  const timeStr = startStr && endStr ? `${startStr} - ${endStr}` : "-";
  const dateStr = shiftDetail ? utils.formatDateWithName(shiftDetail.startDateTime) : "-";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Shift Details</h2>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button
                className="cursor-pointer scale-125"
                onClick={onEditClick}
              >
                <Edit />
              </button>

              <button
                onClick={onDeleteClick}
                className="cursor-pointer scale-90"
              >
                <Delete color={"red"} />
              </button>
            </div>
          </div>

          <hr className="my-4" />

          <DialogDescription asChild>
            {isLoading ? (
              <div className="flex justify-center items-center py-10 text-gray-500">
                Loading shift details...
              </div>
            ) : shiftDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className=" text-gray-500">Date</div>
                    <div className="font-semibold text-black">
                      {dateStr}
                    </div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Time</div>
                    <div className="font-semibold text-black">{timeStr}</div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Role</div>
                    <div className="font-semibold text-black">{shiftDetail.role || "-"}</div>
                  </div>
                </div>

                <hr />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className=" text-gray-500">Event</div>
                    <div className="font-semibold text-black">{eventName}</div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Bartender(s)</div>
                    {bartendersList.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {bartendersList.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {b.profileImage ? (
                              <img
                                src={b.profileImage}
                                alt={b.name}
                                className="h-[32px] w-[32px] rounded-full object-cover shrink-0 border border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-[32px] w-[32px] rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs shrink-0 border border-gray-300">
                                {b.name ? b.name.charAt(0).toUpperCase() : "B"}
                              </div>
                            )}
                            <span className="font-semibold text-black text-sm">{b.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="font-semibold text-black">-</div>
                    )}
                  </div>
                </div>

                <hr />

                <div>
                  <div className=" font-bold text-black">
                    Any Instruction{" "}
                    <span className="text-gray-300">(optional)</span>
                  </div>
                  <p className="mt-2 text-wrap break-words text-gray-600">
                    {shiftDetail.instructions || "-"}
                  </p>
                </div>
              </div>
            ) : null}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetails;
