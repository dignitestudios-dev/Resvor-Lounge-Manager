"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ConfirmPopup from "./ConfirmPopup";
import Link from "next/link";
import utils from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations } from "@/lib/constants";

const AddEventForm = ({ isOpen, onOpenChange }) => {
  // Modal triggers
  const [confirmPopup, setConfirmPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Event Added");
    onOpenChange(false);
    setConfirmPopup(true);
  };

  const handleFlyerInvite = () => {
    console.log("Send Flyer Invitation clicked!");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger>
          <Button className={"border-2 h-12 text-[14px] px-6"}>
            Add New Event
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Event
            </DialogTitle>
            <DialogDescription asChild>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <Label className={"text-black"}>Select Lounge</Label>

                  <Select>
                    <SelectTrigger className={"w-full h-14!"}>
                      <SelectValue placeholder="Select a Lounge" />
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Lounge</SelectLabel>
                        {locations.map((month) => (
                          <SelectItem
                            className={"text-black"}
                            value={month.name}
                            key={month._id}
                          >
                            {utils.capitalize(month.name)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* Event Name */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Name
                  </Label>
                  <Input
                    name="eventName"
                    placeholder="Text Here"
                    className="h-12"
                  />
                </div>

                {/* Event Type */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Type
                  </Label>
                  <Input
                    name="eventType"
                    placeholder="Text Here"
                    className="h-12"
                  />
                </div>

                {/* Guest Count */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Guest Count
                  </Label>
                  <Input
                    name="guestCount"
                    type="number"
                    placeholder="Text Here"
                    className="h-12"
                  />
                </div>

                {/* Packages */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Packages
                  </Label>
                  <Input
                    name="packages"
                    placeholder="Text Here"
                    className="h-12"
                  />
                </div>

                {/* Music */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Music
                  </Label>
                  <Input
                    name="music"
                    placeholder="Text Here"
                    className="h-12"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Additional Description
                  </Label>
                  <Textarea
                    name="description"
                    placeholder="Describe your event"
                    className="min-h-[100px]"
                  />
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full h-12 text-lg">
                    Add Now
                  </Button>
                  <Link
                    href={"/dashboard/campaign-and-flyers"}
                    className="w-full"
                  >
                    <Button
                      type="button"
                      onClick={handleFlyerInvite}
                      className="w-full h-12 text-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                      variant="secondary"
                    >
                      Send Flyer Invitation
                    </Button>
                  </Link>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <ConfirmPopup isOpen={confirmPopup} onOpenChange={setConfirmPopup} />
    </>
  );
};

export default AddEventForm;
