"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
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
import { shiftValues } from "@/lib/init/shiftValues";
import { addShiftSchema } from "@/lib/schema/shift/addShiftSchema";

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

const getTodayString = () => {
  const dateObj = new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

  // Data queries & mutation
  const { data: bartendersResponse } = useGetBartenders({ page: 1, limit: 100 });
  const { data: eventsResponse } = useGetEligibleEvents({ page: 1, limit: 100 });
  const { mutate: createShift, isPending: isCreating } = useCreateShift();
  const { mutate: updateShift } = useUpdateShift();

  const bartendersData = bartendersResponse?.data || [];
  const eventsData = eventsResponse?.data || [];

  // Formik configuration
  const getInitialValues = () => {
    if (isEdit && data) {
      let editDate = data.date && data.date.includes("T") ? formatDateForInput(data.date) : data.date || "";
      let editStartTime = "";
      let editEndTime = "";
      if (data.startDateTime) {
        editDate = formatDateForInput(data.startDateTime);
        editStartTime = formatTimeForInput(data.startDateTime);
      }
      if (data.endDateTime) {
        editEndTime = formatTimeForInput(data.endDateTime);
      }
      const editRole = data.role || "";
      const editInstructions = data.instruction || data.instructions || "";

      let editEventName = "";
      let editEventId = data.referenceId || "";
      if (editEventId) {
        const foundEvent = eventsData.find((e) => e._id === editEventId);
        if (foundEvent) editEventName = foundEvent.title;
      } else if (data.event) {
        editEventName = data.event;
        const foundEvent = eventsData.find((e) => e.title === data.event);
        if (foundEvent) editEventId = foundEvent._id;
      }

      let editBartenderId = "";
      if (data.bartender && bartendersData.length > 0) {
        const bartenderName = typeof data.bartender === "object" ? data.bartender.name : data.bartender;
        const foundBartender = bartendersData.find((b) => b.fullName === bartenderName);
        if (foundBartender) editBartenderId = foundBartender._id;
      }

      return {
        date: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        role: editRole,
        eventId: editEventId,
        eventName: editEventName,
        instructions: editInstructions,
        bartenderId: editBartenderId,
      };
    }

    return shiftValues;
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: addShiftSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (isEdit) {
        const startObj = new Date(`${values.date}T${values.startTime}`);
        let endObj = new Date(`${values.date}T${values.endTime}`);

        const startDateTime = startObj.toISOString();
        const endDateTime = endObj.toISOString();

        updateShift(
          {
            id: data._id,
            referenceType: "event",
            referenceId: values.eventId,
            role: values.role,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            bartenderIds: [values.bartenderId],
            instructions: values.instructions,
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
      } else {
        onOpenChange(false);
        setReviewPopup(true);
      }
    },
  });

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
    resetForm,
  } = formik;

  // Reset form states ONLY when the modal and the review popup are both closed
  useEffect(() => {
    if (!isOpen && !reviewPopup) {
      resetForm();
    }
  }, [isOpen, reviewPopup, resetForm]);

  // Handle Event selection change to auto-fill date/time
  const handleEventSelect = (val) => {
    setFieldValue("eventId", val);
    const selectedEvent = eventsData.find((e) => e._id === val);
    if (selectedEvent) {
      setFieldValue("eventName", selectedEvent.title);
      if (selectedEvent.startDateTime) {
        setFieldValue("date", formatDateForInput(selectedEvent.startDateTime));
        setFieldValue("startTime", formatTimeForInput(selectedEvent.startDateTime));
      }
      if (selectedEvent.endDateTime) {
        setFieldValue("endTime", formatTimeForInput(selectedEvent.endDateTime));
      }
    } else {
      setFieldValue("eventName", "");
    }
  };

  const selectedBartenderObj = bartendersData.find((b) => b._id === values.bartenderId);

  const reviewData = {
    date: values.date,
    time: values.startTime && values.endTime ? `${values.startTime} - ${values.endTime}` : "",
    role: values.role,
    event: values.eventName,
    bartender: selectedBartenderObj ? selectedBartenderObj.fullName : "",
    instruction: values.instructions,
    status: "published",
  };

  const handleSaveTemplate = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    // Parse input date and times to ISO strings
    const startObj = new Date(`${values.date}T${values.startTime}`);
    let endObj = new Date(`${values.date}T${values.endTime}`);

    const startDateTime = startObj.toISOString();
    const endDateTime = endObj.toISOString();

    createShift(
      {
        referenceType: "event",
        referenceId: values.eventId,
        role: values.role,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        bartenderIds: [values.bartenderId],
        instructions: values.instructions,
        status: "published",
      },
      {
        onSuccess: () => {
          SuccessToast("Shift created successfully.");
          setReviewPopup(false);
          setConfirmPopup(true);
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
              <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Date</Label>
                  <Input
                    id="date"
                    name="date"
                    placeholder="Date"
                    type={"date"}
                    className={"h-14"}
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={getTodayString()}
                  />
                  {touched.date && errors.date && (
                    <p className="text-red-600 text-xs mt-1">{errors.date}</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    placeholder="Start Time"
                    type={"time"}
                    className={"h-14"}
                    value={values.startTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.startTime && errors.startTime && (
                    <p className="text-red-600 text-xs mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    placeholder="End Time"
                    type={"time"}
                    className={"h-14"}
                    value={values.endTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.endTime && errors.endTime && (
                    <p className="text-red-600 text-xs mt-1">{errors.endTime}</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Role</Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="Role"
                    className={"h-14"}
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.role && errors.role && (
                    <p className="text-red-600 text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>Event</Label>
                  <Select
                    value={values.eventId}
                    onValueChange={(val) => handleEventSelect(val)}
                  >
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
                  {touched.eventId && errors.eventId && (
                    <p className="text-red-600 text-xs mt-1">{errors.eventId}</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1 col-span-2">
                  <Label className={"text-base text-black"}>
                    Any Instructions{" "}
                    <span className="text-gray-300">(optional)</span>
                  </Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Add text here"
                    className={"h-28"}
                    value={values.instructions}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.instructions && errors.instructions && (
                    <p className="text-red-600 text-xs mt-1">{errors.instructions}</p>
                  )}
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Assign Bartender
                  </Label>
                  <Select
                    value={values.bartenderId}
                    onValueChange={(val) => setFieldValue("bartenderId", val)}
                  >
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
                  {touched.bartenderId && errors.bartenderId && (
                    <p className="text-red-600 text-xs mt-1">{errors.bartenderId}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className={"col-span-2 w-full h-14 text-lg"}
                >
                  {isEdit ? "Update" : "Create Shift"}
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveTemplate}
                  className={
                    "bg-gray-200 hover:bg-gray-100 text-black! col-span-2 w-full h-14 text-lg"
                  }
                >
                  Save This Template
                </Button>
              </form>
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
        isLoading={isCreating}
      />

      {/* Confirmation Popup  */}
      <ConfirmPopup isOpen={confirmPopup} onOpenChange={setConfirmPopup} />

      {/* Confirm Update Modal */}
      <UpdateSuccessPopup isOpen={updatedOpen} onOpenChange={setUpdatedOpen} />
    </>
  );
};

export default AddShiftAndScheduling;
