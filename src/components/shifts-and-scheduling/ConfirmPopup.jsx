import React from "react";
import { IoCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";

const ConfirmPopup = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="h-32 w-32 rounded-full bg-gradient flex justify-center items-center">
                <IoCheckmark className="text-white" size={70} />
              </div>

              <h3 className="text-[#181818] text-2xl font-bold text-center">
                Shift Assigned!{" "}
              </h3>
              <p className="text-[#565656] text-center">
                Shift has been assigned to the bartender and shifts are added in
                the shift scheduling section.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPopup;
