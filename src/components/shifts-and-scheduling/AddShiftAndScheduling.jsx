"use client";
import React, { useState, useEffect } from "react";
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
import { useGetBartenders } from "@/lib/hooks/queries/useBartenders";
import { useGetEligibleEvents } from "@/lib/hooks/queries/useShifts";
import { useCreateShift, useUpdateShift } from "@/lib/hooks/mutations/ShiftMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const formatDateForInput = (isoString) => {
  if (!isoString) return "";
  const dateObj = new Date(isoString);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTimeForInput = (isoString) => {
  if (!isoString) return "";
  const dateObj = new Date(isoString);
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

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

  // Form states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [role, setRole] = useState("");
  const [eventId, setEventId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bartenderId, setBartenderId] = useState("");

  // Data queries & mutation
  const { data: bartendersResponse } = useGetBartenders({ page: 1, limit: 100 });
  const { data: eventsResponse } = useGetEligibleEvents({ page: 1, limit: 100 });
  const { mutate: createShift } = useCreateShift();
  const { mutate: updateShift } = useUpdateShift();

  const bartendersData = bartendersResponse?.data || [];
  const eventsData = eventsResponse?.data || [];

  // Populate or reset form states based on mode
  useEffect(() => {
    if (isOpen) {
      if (isEdit && data) {
        setDate(data.date && data.date.includes("T") ? formatDateForInput(data.date) : data.date || "");
        if (data.startDateTime) {
          setDate(formatDateForInput(data.startDateTime));
          setStartTime(formatTimeForInput(data.startDateTime));
        }
        if (data.endDateTime) {
          setEndTime(formatTimeForInput(data.endDateTime));
        }
        setRole(data.role || "");
        setInstructions(data.instruction || data.instructions || "");
        
        // Match event name if possible
        if (data.event && eventsData.length > 0) {
          const foundEvent = eventsData.find((e) => e.title === data.event);
          if (foundEvent) setEventId(foundEvent._id);
        }
        
        // Match bartender name if possible
        if (data.bartender && bartendersData.length > 0) {
          const bartenderName = typeof data.bartender === "object" ? data.bartender.name : data.bartender;
          const foundBartender = bartendersData.find((b) => b.fullName === bartenderName);
          if (foundBartender) setBartenderId(foundBartender._id);
        }
      } else {
        // Reset form for new shift
        setDate("");
        setStartTime("");
        setEndTime("");
        setRole("");
        setEventId("");
        setInstructions("");
        setBartenderId("");
      }
    }
  }, [isOpen, isEdit, data, eventsData, bartendersData]);

  // Handle Event selection change to auto-fill date/time
  const handleEventChange = (val) => {
    setEventId(val);
    const selectedEvent = eventsData.find((e) => e._id === val);
    if (selectedEvent) {
      if (selectedEvent.startDateTime) {
        setDate(formatDateForInput(selectedEvent.startDateTime));
        setStartTime(formatTimeForInput(selectedEvent.startDateTime));
      }
      if (selectedEvent.endDateTime) {
        setEndTime(formatTimeForInput(selectedEvent.endDateTime));
      }
    }
  };

  const selectedEventObj = eventsData.find((e) => e._id === eventId);
  const selectedBartenderObj = bartendersData.find((b) => b._id === bartenderId);

  const reviewData = {
    date: date,
    time: startTime && endTime ? `${startTime} - ${endTime}` : "",
    role: role,
    event: selectedEventObj ? selectedEventObj.title : "",
    bartender: selectedBartenderObj ? selectedBartenderObj.fullName : "",
    instruction: instructions,
    status: "published",
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!eventId) {
      ErrorToast("Please select an event.");
      return;
    }
    if (!role) {
      ErrorToast("Please enter a role.");
      return;
    }
    if (!date || !startTime || !endTime) {
      ErrorToast("Please fill in the date and both start/end times.");
      return;
    }
    if (!bartenderId) {
      ErrorToast("Please select a bartender.");
      return;
    }

    onOpenChange(false);
    setReviewPopup(true);
  };

  const handleSaveTemplate = () => {
    onOpenChange(false);
  };

  const handleEdit = (e) => {
    e?.preventDefault();
    if (!eventId) {
      ErrorToast("Please select an event.");
      return;
    }
    if (!role) {
      ErrorToast("Please enter a role.");
      return;
    }
    if (!date || !startTime || !endTime) {
      ErrorToast("Please fill in the date and both start/end times.");
      return;
    }
    if (!bartenderId) {
      ErrorToast("Please select a bartender.");
      return;
    }

    const startObj = new Date(`${date}T${startTime}`);
    let endObj = new Date(`${date}T${endTime}`);

    if (endObj <= startObj) {
      endObj.setDate(endObj.getDate() + 1);
    }

    const startDateTime = startObj.toISOString();
    const endDateTime = endObj.toISOString();

    updateShift(
      {
        id: data._id,
        referenceType: "event",
        referenceId: eventId,
        role: role,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        bartenderIds: [bartenderId],
        instructions: instructions,
        status: "published",
      },
      {
        onSuccess: () => {
          SuccessToast("Shift updated successfully.");
          onOpenChange(false);
          if (typeof onUpdateSubmit === "function") {
            onUpdateSubmit();
          } else {
            setUpdatedOpen(true);
          }
        },
        onError: (error) => {
          ErrorToast(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update shift."
          );
        },
      }
    );
  };

  const handleConfirm = () => {
    // Parse input date and times to ISO strings
    const startObj = new Date(`${date}T${startTime}`);
    let endObj = new Date(`${date}T${endTime}`);

    // If end time is before or equal to start time, it means the shift crosses midnight into the next day
    if (endObj <= startObj) {
      endObj.setDate(endObj.getDate() + 1);
    }

    const startDateTime = startObj.toISOString();
    const endDateTime = endObj.toISOString();

    createShift(
      {
        referenceType: "event",
        referenceId: eventId,
        role: role,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        bartenderIds: [bartenderId],
        instructions: instructions,
        status: "published",
      },
      {
        onSuccess: () => {
          SuccessToast("Shift created successfully.");
          setReviewPopup(false);
          setConfirmPopup(true);
          // Clear states
          setDate("");
          setStartTime("");
          setEndTime("");
          setRole("");
          setEventId("");
          setInstructions("");
          setBartenderId("");
        },
        onError: (error) => {
          ErrorToast(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to create shift."
          );
        },
      }
    );
  };

  const handleBack = () => {
    setReviewPopup(false);
    onOpenChange(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {showTrigger ? (
          <DialogTrigger asChild>
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
            <DialogDescription asChild>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Date</Label>
                  <Input
                    placeholder="Date"
                    type={"date"}
                    className={"h-14"}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Start Time</Label>
                  <Input
                    placeholder="Start Time"
                    type={"time"}
                    className={"h-14"}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>End Time</Label>
                  <Input
                    placeholder="End Time"
                    type={"time"}
                    className={"h-14"}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Role</Label>
                  <Input
                    placeholder="Role"
                    className={"h-14"}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Event</Label>
                  <Select value={eventId} onValueChange={handleEventChange}>
                    <SelectTrigger className={"w-full !h-14"}>
                      <SelectValue placeholder="Select an Event" />
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Events</SelectLabel>
                        {eventsData.map((event) => (
                          <SelectItem value={event._id} key={event._id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>
                    Any Instructions{" "}
                    <span className="text-gray-300">(optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Add text here"
                    className={"h-28"}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Assign Bartender
                  </Label>
                  <Select value={bartenderId} onValueChange={setBartenderId}>
                    <SelectTrigger className={"w-full !h-14"}>
                      <SelectValue placeholder="Select a Bartender" />
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Bartenders</SelectLabel>
                        {bartendersData.map((bartender) => (
                          <SelectItem value={bartender._id} key={bartender._id}>
                            {bartender.fullName}
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
                  {isEdit ? "Update" : "Create Shift"}
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
        data={reviewData}
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
