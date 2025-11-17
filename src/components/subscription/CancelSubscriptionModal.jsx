"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineWarning } from "react-icons/ai";
import { IoWarning } from "react-icons/io5";

const CancelSubscriptionModal = ({ open, setOpen, onProceed }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger is managed externally; we don't render a trigger here */}
      <DialogContent className={"p-10 min-w-xl"}>
        <DialogHeader className="flex flex-col items-center text-center">
          <IoWarning className="text-red-600 size-14" />

          <DialogTitle className="text-4xl mt-5 font-bold">
            Cancel Subscription
          </DialogTitle>
          <DialogDescription className="mt-2 text-lg text-gray-600 max-w-xl">
            Are you sure you want to cancel this subscription plan?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <div className="w-full px-5 flex justify-center gap-6">
            <Button
              variant="destructive"
              onClick={() => {
                if (onProceed) onProceed();
                setOpen(false);
              }}
              className={"flex-1"}
            >
              Proceed Now
            </Button>

            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 bg-gray-100 text-gray-800"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;
