"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { IoCheckmark } from "react-icons/io5";

const ProfileUpdateModal = ({
  open,
  setOpen,
  title = "Profile Updated!",
  message = "Bartender profile has been successfully updated.",
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl overflow-auto">
        <div className="py-8 text-center">
          <div className="w-28 h-28 rounded-full bg-linear-to-r from-[#0b1738] to-[#0b2b8d] mx-auto flex items-center justify-center mb-6">
            <IoCheckmark className="text-white" size={70} />
          </div>

          <h3 className="text-3xl font-bold">{title}</h3>
          <p className="text-gray-600 mt-3">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;
