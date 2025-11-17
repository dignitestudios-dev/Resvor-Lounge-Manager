import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

const ReviewPopup = ({ isOpen, onOpenChange, onConfirm, onBack, data }) => {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pb-2 border-b">
            Shift Details
          </DialogTitle>

          <DialogDescription className="space-y-4 pt-4">
            {/* Date, Time, Role */}
            <div className="grid grid-cols-3 gap-5">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-black">{data.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-black">{data.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-black">{data.role}</p>
              </div>
            </div>

            <hr />

            {/* Event and Bartender */}
            <div className="flex gap-10">
              <div>
                <p className="text-sm text-gray-500">Event</p>
                <p className="font-medium text-black">{data.event}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Bartender</p>
                <p className="font-medium text-black">{data.bartender}</p>
              </div>
            </div>

            <hr />

            {/* Instructions */}
            <div>
              <p className="text-sm text-black font-semibold">
                Any Instruction <span className="text-xs">(optional)</span>
              </p>
              <p className="text-sm text-gray-500">{data.instruction}</p>
            </div>

            {/* Buttons */}
            <div className="pt-4 space-y-2">
              <Button onClick={onConfirm} className="w-full">
                Confirm Now
              </Button>
              <Button onClick={onBack} className="w-full" variant="secondary">
                Back
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPopup;
