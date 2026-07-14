import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const formatTime12 = (time24) => {
  if (!time24) return "";
  const [hour, minute] = time24.split(":");
  if (hour === undefined || minute === undefined) return time24;
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = String(h % 12 || 12).padStart(2, "0");
  return `${formattedHour}:${minute} ${ampm}`;
};

const formatRange12 = (rangeStr) => {
  if (!rangeStr) return "";
  const parts = rangeStr.split(" - ");
  if (parts.length === 2) {
    return `${formatTime12(parts[0])} - ${formatTime12(parts[1])}`;
  }
  return rangeStr;
};

const ReviewPopup = ({ isOpen, onOpenChange, onConfirm, onBack, data, isLoading = false }) => {
  console.log("🚀 ~ ReviewPopup ~ data:", data)
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
                <p className="font-medium text-black">{formatRange12(data.time)}</p>
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
              <Button onClick={onConfirm} className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Confirming..." : "Confirm Now"}
              </Button>
              <Button onClick={onBack} className="w-full" variant="secondary" disabled={isLoading}>
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
