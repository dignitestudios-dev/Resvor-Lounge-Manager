import React from "react";
import { IoCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import Delete2 from "../icons/Delete2";
import { Button } from "../ui/button";

const DeleteGuestPopup = ({ isOpen, onOpenChange, onDelete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="h-32 w-32 rounded-full bg-red-400 flex justify-center items-center">
                <Delete2 />
              </div>

              <h3 className="text-[#181818] text-2xl font-bold text-center">
                Delete This Guest{" "}
              </h3>
              <p className="text-[#565656] text-center">
                Are you sure you want delete this Guest. Please confirm to
                proceed.{" "}
              </p>

              <div className="w-full flex gap-5">
                <Button
                  variant={"secondary"}
                  className={"flex-1"}
                  onClick={() => onOpenChange(false)}
                >
                  No
                </Button>
                <Button
                  className={"flex-1 bg-red-400 hover:bg-red-500"}
                  onClick={onDelete}
                >
                  Yes
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGuestPopup;
