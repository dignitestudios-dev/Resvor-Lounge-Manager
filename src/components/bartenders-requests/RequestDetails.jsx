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

const RequestDetails = ({ isOpen, onOpenChange, data, onReject, onAccept }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl! w-xl!">
        <DialogHeader>
          <h2 className="text-3xl font-bold">Request Details</h2>

          <DialogDescription>
            {data && (
              <div className="mt-6 space-y-4">
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
                    <div className="font-semibold text-black">
                      {data.role || "Bar Server"}
                    </div>
                  </div>
                </div>

                <hr />

                <div>
                  <div className=" text-gray-500">Event</div>
                  <div className="font-semibold text-black">
                    {data.event || "Corporate Networking Night"}
                  </div>
                </div>

                <hr />

                <div>
                  <div className=" text-black font-semibold">
                    Any Instruction{" "}
                    <span className="text-gray-300">(optional)</span>
                  </div>
                  <p className="mt-2  text-gray-600">
                    {data.instruction ||
                      "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod. The standard."}
                  </p>
                </div>

                <hr />

                <div>
                  <div className=" text-gray-500">Bartender</div>
                  <div className="font-semibold text-black">
                    {data.bartender?.name || "Christine Easom"}
                  </div>
                </div>

                <div>
                  <div className=" text-black mt-3">Reason for Time Off</div>
                  <p className="mt-2  text-gray-600">
                    {data.reason ||
                      "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod. The standard."}
                  </p>
                </div>

                <hr />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={onReject}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
                    onClick={onAccept}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetails;
