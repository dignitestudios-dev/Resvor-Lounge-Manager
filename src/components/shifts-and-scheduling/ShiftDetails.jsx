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

const ShiftDetails = ({
  isOpen,
  onOpenChange,
  data,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Shift Details</h2>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Shift Details</span>
            </div>
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

          <DialogDescription>
            {data && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className=" text-gray-500">Date</div>
                    <div className="font-semibold text-black">
                      {utils.formatDateWithName(data.date)}
                    </div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Time</div>
                    <div className="font-semibold text-black">{data.time}</div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Role</div>
                    <div className="font-semibold text-black">{data.role}</div>
                  </div>
                </div>

                <hr />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className=" text-gray-500">Event</div>
                    <div className="font-semibold text-black">{data.event}</div>
                  </div>
                  <div>
                    <div className=" text-gray-500">Bartender</div>
                    <div className="font-semibold text-black">
                      {data.bartender ? data.bartender.name : "-"}
                    </div>
                  </div>
                </div>

                <hr />

                <div>
                  <div className=" font-bold text-black">
                    Any Instruction{" "}
                    <span className="text-gray-300">(optional)</span>
                  </div>
                  <p className="mt-2  text-gray-600">
                    {data.instruction || "-"}
                  </p>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetails;
