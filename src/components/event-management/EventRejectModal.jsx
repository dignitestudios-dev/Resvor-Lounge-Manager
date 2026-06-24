import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EventRejectModal = ({ isOpen, onOpenChange, onSubmit, isLoading }) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    await onSubmit(rejectionReason);
    setRejectionReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Reject Event</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-32 resize-none break-all"
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setRejectionReason("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rejectionReason.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Rejecting..." : "Reject Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRejectModal;
