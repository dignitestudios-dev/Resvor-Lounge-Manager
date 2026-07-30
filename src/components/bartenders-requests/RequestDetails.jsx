"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import utils from "@/lib/utils";

const RequestDetails = ({ isOpen, onOpenChange, data, onReject, onAccept, loading }) => {
  console.log("🚀 ~ RequestDetails ~ data:", data)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl! w-xl!">
        <DialogHeader>
          <h2 className="text-3xl font-bold">Request Details</h2>

          <DialogDescription>
            {data && (
              <div className="mt-6 space-y-4 break-words break-all">
                {data.isShiftSwap ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Original Shift (Swapping Out)
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-gray-500 text-xs">Date</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.requestorShift?.startDateTime
                              ? utils.formatDateWithName(data.requestorShift.startDateTime)
                              : utils.formatDateWithName(data.date)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Time</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.requestorShiftTime || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Role</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.requestorShift?.role || data.role || "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Swap With Shift (Target)
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-gray-500 text-xs">Date</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.targetShift?.startDateTime
                              ? utils.formatDateWithName(data.targetShift.startDateTime)
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Time</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.targetShiftTime || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Role</div>
                          <div className="font-semibold text-black text-sm break-words break-all">
                            {data.targetShift?.role || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className=" text-gray-500">Date</div>
                      <div className="font-semibold text-black break-words break-all">
                        {utils.formatDateWithName(data.date)}
                      </div>
                    </div>
                    <div>
                      <div className=" text-gray-500">Time</div>
                      <div className="font-semibold text-black break-words break-all">{data.time}</div>
                    </div>
                    <div>
                      <div className=" text-gray-500">Role</div>
                      <div className="font-semibold text-black break-words break-all">
                        {data.role || "Bar Server"}
                      </div>
                    </div>
                  </div>
                )}

                <hr />

                <div>
                  <div className=" text-gray-500">Event</div>
                  <div className="font-semibold text-black break-words break-all">
                    {data.event}
                  </div>
                </div>

                <hr />

                <div>
                  <div className=" text-black font-semibold">
                    Any Instruction{" "}
                    <span className="text-gray-300">(optional)</span>
                  </div>
                  <p className="mt-2 text-gray-600 break-words break-all">
                    {data.instruction ||
                      "Not Provided"}
                  </p>
                </div>

                <hr />

                <div>
                  <div className=" text-gray-500">Bartender</div>
                  <div className="font-semibold text-black break-words break-all">
                    {data.bartender?.name || "Christine Easom"}
                  </div>
                </div>

                <div>
                  <div className=" text-black mt-3">
                    {data.isShiftSwap ? "Reason for Shift Swap" : "Reason for Time Off"}
                  </div>
                  <p className="mt-2 text-wrap break-words break-all text-gray-600">
                    {data.reason ||
                      "No reason provided"}
                  </p>
                </div>

                <hr />

                {data.status?.toLowerCase() === "pending" && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                      onClick={onReject}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Reject"}
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
                      onClick={onAccept}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Accept"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetails;
