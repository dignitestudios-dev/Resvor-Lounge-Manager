import React from "react";
import { IoCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const AccountCreationPopup = ({ isOpen, onOpenChange, onSendMail, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent showCloseButton={false}>
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
                Login credentials have been successfully generated. Click the
                button below to send the credentials to the bartender via email.
              </p>

              <Button
                onClick={onSendMail}
                disabled={isLoading}
                className="min-w-[180px]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Send Mail to Bartender"
                )}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AccountCreationPopup;
