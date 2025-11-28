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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ReviewPopup from "./ReviewPopup";
import ConfirmPopup from "./ConfirmPopup";
import UpdateSuccessPopup from "./UpdateSuccessPopup";

const AddShiftAndScheduling = ({
  isOpen,
  onOpenChange,
  isEdit = false,
  data = null,
  showTrigger = true,
  onUpdateSubmit,
}) => {
  // Modal triggers
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [reviewPopup, setReviewPopup] = useState(false);
  const [updatedOpen, setUpdatedOpen] = useState(false);

  const bartenders = [
    "Jake Thompson",
    "Emily Carter",
    "Michael Reed",
    "Sophia Turner",
    "Ryan Brooks",
    "Ava Mitchell",
    "Ethan Collins",
    "Olivia Hayes",
    "Noah Sullivan",
    "Chloe Parker",
    "Liam Anderson",
    "Grace Morgan",
    "Mason Hughes",
    "Isabella Cooper",
    "Logan Bennett",
  ];

  const dummyShiftData = {
    date: "26 Dec, 2024",
    time: "06:00pm",
    role: "Bar Server",
    event: "Corporate Networking Night",
    bartender: "John Doe",
    instruction:
      "The standard Lorem Ipsum passage, m ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
  };

  const handleSubmit = (e) => {
    onOpenChange(false);
    setReviewPopup(true);
  };

  const handleSaveTemplate = () => {
    onOpenChange(false);
  };

  const handleEdit = (e) => {
    onOpenChange(false);
    // If onUpdateSubmit provided (from bartender requests), call it directly
    if (typeof onUpdateSubmit === "function") {
      onUpdateSubmit();
    } else {
      // Otherwise show the update success popup
      setUpdatedOpen(true);
    }
  };

  const handleConfirm = () => {
    setReviewPopup(false);
    setConfirmPopup(true);
  };

  const handleBack = () => {
    setReviewPopup(false);
    onOpenChange(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {showTrigger ? (
          <DialogTrigger>
            <Button className={"border-2 h-12 text-[14px] px-6"}>
              Add New Shift
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"text-3xl font-bold"}>
              {isEdit ? "Edit Shift" : "Add New Shift"}
            </DialogTitle>
            <DialogDescription>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Date</Label>
                  <Input placeholder="Date" type={"date"} className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Time</Label>
                  <Input placeholder="Time" type={"time"} className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Role</Label>
                  <Input placeholder="Role" className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Event</Label>
                  <Input placeholder="Event" className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>
                    Any Instructions{" "}
                    <span className="text-gray-300">(optional)</span>
                  </Label>
                  <Textarea placeholder="Add text here" className={"h-28"} />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Assign Bartender
                  </Label>

                  <Select>
                    <SelectTrigger className={"w-full !h-14"}>
                      <SelectValue placeholder="Select a Bartender" />
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Bartenders</SelectLabel>
                        {bartenders.map((bartender, index) => (
                          <SelectItem value={bartender} key={index}>
                            {bartender}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={isEdit ? handleEdit : handleSubmit}
                  className={"col-span-2 w-full h-14 text-lg"}
                >
                  {isEdit ? "Update" : "Save"}
                </Button>

                <Button
                  onClick={handleSaveTemplate}
                  className={
                    "bg-gray-200 hover:bg-gray-100 text-black! col-span-2 w-full h-14 text-lg"
                  }
                >
                  Save This Template
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Review Popup */}
      <ReviewPopup
        isOpen={reviewPopup}
        onOpenChange={setReviewPopup}
        data={dummyShiftData}
        onBack={handleBack}
        onConfirm={handleConfirm}
      />

      {/* Confirmation Popup  */}
      <ConfirmPopup isOpen={confirmPopup} onOpenChange={setConfirmPopup} />

      {/* Confirm Update Modal */}
      <UpdateSuccessPopup isOpen={updatedOpen} onOpenChange={setUpdatedOpen} />
    </>
  );
};

export default AddShiftAndScheduling;
