"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Loader2 } from "lucide-react";
import { useGetGuestbook } from "@/lib/hooks/queries/useGuestbook";
import { useCreateCampaign } from "@/lib/hooks/mutations/CampaignMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const SendInvitationForm = ({ isOpen, onOpenChange, onSendInvitation, image, additionalInfo }) => {
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [customEmail, setCustomEmail] = useState("");

  // Fetch guests from guestbook API
  const { data: guestbookData, isLoading: isGuestsLoading } = useGetGuestbook({
    page: 1,
  });
  const guests = guestbookData?.data || [];

  // Campaign mutation
  const createCampaignMutation = useCreateCampaign();

  const handleRemoveGuest = (email) => {
    setSelectedGuests(selectedGuests.filter((g) => g !== email));
  };

  const handleGuestSelect = (email) => {
    if (!selectedGuests.includes(email)) {
      setSelectedGuests([email, ...selectedGuests]);
    }
  };

  const handleAddCustomEmail = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const email = customEmail.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!selectedGuests.includes(email)) {
        setSelectedGuests([...selectedGuests, email]);
      }
      setCustomEmail("");
    } else {
      ErrorToast("Please enter a valid email address");
    }
  };

  const handleSend = async () => {
    if (selectedGuests.length === 0) {
      ErrorToast("Please select or enter at least one email recipient.");
      return;
    }
    if (!image) {
      ErrorToast("No flyer designed or uploaded yet.");
      return;
    }

    try {
      await createCampaignMutation.mutateAsync({
        channel: "email",
        recipients: selectedGuests,
        additionalInfo: additionalInfo || "",
        image: image,
      });

      SuccessToast("Flyer campaign created successfully");
      setSelectedGuests([]); // reset selected guests on success
      if (onSendInvitation) {
        onSendInvitation();
      }
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message || "Failed to create flyer campaign"
      );
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
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Email"
                    className="h-14 flex-1"
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    onKeyDown={handleAddCustomEmail}
                  />
                  <Button
                    type="button"
                    onClick={addEmail}
                    className="h-14 px-4 bg-primary text-white hover:bg-primary/90"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Type an email and press Enter or click the "+" button to add.
                </p>

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
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                <div className="border-2 rounded-xl p-4 max-h-[240px] overflow-y-auto">
                  {isGuestsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : guests && guests.length > 0 ? (
                    <div className="space-y-3">
                      {guests.map((guest) => (
                        <div
                          key={guest._id}
                          onClick={() => handleGuestSelect(guest.email)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                            👤
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {guest.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {guest.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No guests found in guestbook.
                    </p>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={createCampaignMutation.isPending}
                className="w-full h-14 text-lg flex items-center justify-center gap-2"
              >
                {createCampaignMutation.isPending && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                {createCampaignMutation.isPending
                  ? "Sending..."
                  : "Send Invitation"}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvitationForm;

