"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Camera, Eye, EyeOff, Upload } from "lucide-react";
import SendInvitationForm from "./SendInvitationForm";
import ConfirmPopup from "./ConfirmPopup";

const AddFlyerForm = ({ isOpen, onOpenChange }) => {
  const [flyerImage, setFlyerImage] = useState(null);

  // Modal triggers
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFlyerImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Flyer Added");
    onOpenChange(false);
    setOpenInvForm(true);
  };

  const handleSendInvitation = () => {
    console.log("Invitation sent to guests");
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger>
          <Button className={"border-2 h-14 text-lg"}>Add Custom Flyer</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"text-3xl font-bold"}>
              Add Custom Flyer
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Image Upload */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="flyerImage"
                    className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50 transition"
                  >
                    {flyerImage ? (
                      <img
                        src={flyerImage}
                        alt="Service Preview"
                        className="w-40 h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Choose file to upload
                        </span>
                      </>
                    )}
                    <Input
                      id="flyerImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <Button className={"w-full h-14 text-lg"}>Add</Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Send email invitation */}
      <SendInvitationForm
        isOpen={openInvForm}
        onOpenChange={setOpenInvForm}
        onSendInvitation={handleSendInvitation}
      />

      {/* Cofirm Popup */}
      <ConfirmPopup isOpen={confirmPopup} onOpenChange={setConfirmPopup} />
    </>
  );
};

export default AddFlyerForm;
