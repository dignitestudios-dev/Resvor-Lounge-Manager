"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LogoutConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-2 w-[380px] rounded-[16px] bg-white shadow-lg flex flex-col justify-center gap-3 [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Empty top bar matching reference layout */}
        <div className="flex justify-end w-full p-2" />

        <div className="flex items-center px-5 flex-col gap-2 mb-4">
          {/* Logout icon */}
          <div className="w-full flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-[#EE3131]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </div>

          <DialogHeader className="items-center space-y-1">
            <DialogTitle className="text-[#181818] font-bold text-[20px]">
              Log out
            </DialogTitle>
            <p className="text-[#565656] text-[16px] text-center">
              Are you sure you want to log out?
            </p>
          </DialogHeader>

          <div className="flex gap-3 items-center mt-3">
            <button
              className="bg-[#21293514] text-[#212935] rounded-[8px] px-10 py-2 disabled:opacity-60"
              onClick={onClose}
              disabled={isLoading}
            >
              No
            </button>
            <button
              className="bg-[#EE3131] text-white rounded-[8px] px-10 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Yes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmationModal;
