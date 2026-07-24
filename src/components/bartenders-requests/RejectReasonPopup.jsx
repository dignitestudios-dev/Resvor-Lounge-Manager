"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

const RejectReasonPopup = ({ isOpen, onOpenChange, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  const handleClose = (open) => {
    if (!open) {
      setReason("");
      setError("");
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Reason for Rejection
          </DialogTitle>
          <DialogDescription asChild>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Please specify the reason for rejecting this request.
                </p>
                <Textarea
                  placeholder="Enter rejection reason here..."
                  className="min-h-24  text-black font-normal"
                  value={reason}
                  
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                />
                {error && (
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-4">
                <Button
                  type="button"
                  onClick={onCancel}
                  className="flex-1"
                  variant="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReasonPopup;
