"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteLoungeModal({
  isOpen,
  onClose,
  onConfirm,
  loungeName,
  isLoading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md p-6 rounded-2xl bg-white shadow-xl"
        onInteractOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
              Delete Lounge
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {loungeName || "this lounge"}
              </span>
              ? All associated data will be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 w-full mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 h-11 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className="flex-1 h-11 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Deleting..." : "Delete Lounge"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

