"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LogoutConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Confirm Logout</DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to log out? You will need to log in again to
            access your account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging out..." : "Log Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmationModal;
