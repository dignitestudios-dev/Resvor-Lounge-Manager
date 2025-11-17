import React from "react";
import { IoCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

const AccountCreationPopup = ({ isOpen, onOpenChange, onSendMail }) => {
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
                Bartender Account Created
              </h3>
              <p className="text-[#565656] text-center">
                Login credentials have been successfully generated. The
                bartenders can now access their account and manage their
                profile.
              </p>

              <Button onClick={onSendMail}>Send Mail to Bartender</Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AccountCreationPopup;
