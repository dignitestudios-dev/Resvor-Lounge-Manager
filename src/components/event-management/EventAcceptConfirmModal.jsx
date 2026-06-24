import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EventAcceptConfirmModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const handleConfirm = async () => {
    await onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Accept Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to accept this event?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Accepting..." : "Accept Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventAcceptConfirmModal;
