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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const SendInvitationForm = ({ isOpen, onOpenChange, onSendInvitation }) => {
  const [selectedGuests, setSelectedGuests] = useState([
    "sarah.johnson@email.com",
    "mike.anderson@email.com",
    "emma.wilson@email.com",
  ]);

  // Dummy guest data
  const guests = [
    {
      id: 1,
      name: "Christine Easom",
      email: "christine.easom@email.com",
      avatar: "👤",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "👤",
    },
    {
      id: 3,
      name: "Mike Anderson",
      email: "mike.anderson@email.com",
      avatar: "👤",
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      avatar: "👤",
    },
    {
      id: 5,
      name: "James Brown",
      email: "james.brown@email.com",
      avatar: "👤",
    },
    { id: 6, name: "Lisa Davis", email: "lisa.davis@email.com", avatar: "👤" },
    {
      id: 7,
      name: "David Miller",
      email: "david.miller@email.com",
      avatar: "👤",
    },
    {
      id: 8,
      name: "Rachel Green",
      email: "rachel.green@email.com",
      avatar: "👤",
    },
    { id: 9, name: "Tom Harris", email: "tom.harris@email.com", avatar: "👤" },
    {
      id: 10,
      name: "Anna Taylor",
      email: "anna.taylor@email.com",
      avatar: "👤",
    },
  ];

  const handleRemoveGuest = (email) => {
    setSelectedGuests(selectedGuests.filter((g) => g !== email));
  };

  const handleGuestSelect = (email) => {
    if (!selectedGuests.includes(email)) {
      setSelectedGuests([email, ...selectedGuests]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Send Invitation
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-4 space-y-4">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium text-black">
                  Email
                </Label>
                <Input
                  placeholder="Enter Email"
                  className="h-14"
                  type="email"
                />

                {/* Selected Guests Tags */}
                {selectedGuests?.length > 0 && (
                  <div className="border-2 rounded-xl p-4 max-h-28 overflow-y-auto flex flex-wrap gap-2 mt-2">
                    {selectedGuests.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuest(email)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guests List */}
              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium text-black">
                  Guests
                </Label>
                <div className="border-2 rounded-xl p-4 max-h-[280px] overflow-y-auto">
                  <div className="space-y-3">
                    {guests.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => handleGuestSelect(guest.email)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl flex-shrink-0">
                          {guest.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">
                            {guest.name}
                          </p>
                          <p className="text-sm text-gray-500">{guest.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={onSendInvitation}
                className="w-full h-14 text-lg"
              >
                Send Invitation
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvitationForm;
