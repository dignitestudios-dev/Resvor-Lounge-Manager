import React from "react";
import { IoCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

const UpdateSuccessPopup = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col justify-center items-center gap-4 py-6">
              <div className="w-28 h-28 rounded-full bg-gradient mx-auto flex items-center justify-center mb-6">
                <IoCheckmark className="text-white" size={70} />
              </div>

              <h3 className="text-[#181818] text-3xl font-bold text-center">
                Shift Updated!
              </h3>
              <p className="text-[#565656] text-center text-lg">
                Shift has been successfully updated.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSuccessPopup;
