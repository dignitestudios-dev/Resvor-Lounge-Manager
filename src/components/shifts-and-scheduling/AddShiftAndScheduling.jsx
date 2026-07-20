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
import { useGetConfirmedEventsAndBookings } from "@/lib/hooks/queries/useShifts";
import { useCreateShift, useUpdateShift } from "@/lib/hooks/mutations/ShiftMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { Loader2, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { IoIosArrowDown } from "react-icons/io";
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
  const [searchVal, setSearchVal] = useState("");

  // Data queries & mutation
  const { data: bartendersResponse } = useGetBartenders({ page: 1, limit: 100 });
  const { mutate: createShift, isPending: isCreating } = useCreateShift();
  const { mutate: updateShift, isPending: isUpdating } = useUpdateShift();

  const bartendersData = bartendersResponse?.data || [];
  const filteredBartenders = bartendersData.filter((b) =>
    b.fullName?.toLowerCase().includes(searchVal.toLowerCase())
  );

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
      if (typeof data.event === "object" && data.event !== null) {
        editEventName = data.event.title || data.event.name || "";
        if (!editEventId) editEventId = data.event._id || "";
      } else if (typeof data.event === "string") {
        editEventName = data.event;
      }

      let editBartenderIds = [];
      if (data.bartenderIds && data.bartenderIds.length > 0) {
        editBartenderIds = data.bartenderIds.map((b) => (typeof b === "object" && b !== null) ? b._id : b);
      } else if (data.bartender && bartendersData.length > 0) {
        const bartenderName = typeof data.bartender === "object" ? data.bartender.name : data.bartender;
        const foundBartender = bartendersData.find((b) => b.fullName === bartenderName);
        if (foundBartender) editBartenderIds = [foundBartender._id];
      }

      return {
        date: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        role: editRole,
        eventId: editEventId,
        eventName: editEventName,
        instructions: editInstructions,
        bartenderIds: editBartenderIds,
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
            role: values.role,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
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

  // Fetch confirmed events and bookings for selected date
  const {
    data: eventsData = [],
    isLoading: isLoadingEvents,
    isFetching: isFetchingEvents,
  } = useGetConfirmedEventsAndBookings(values.date);

  const isEventsLoading = isLoadingEvents || isFetchingEvents;

  // Reset form states ONLY when the modal and the review popup are both closed
  useEffect(() => {
    if (!isOpen && !reviewPopup) {
      resetForm();
      setSearchVal("");
    }
  }, [isOpen, reviewPopup, resetForm]);

  // Handle Event selection change to auto-fill eventName
  const handleEventSelect = (val) => {
    setFieldValue("eventId", val);
    const selectedEvent = eventsData?.find((e) => e._id === val);
    if (selectedEvent) {
      setFieldValue("eventName", selectedEvent.title || selectedEvent.name || selectedEvent.eventName || "");
    }
  };

  const selectedBartenderNames = (values.bartenderIds || [])
    .map((id) => bartendersData.find((b) => b._id === id)?.fullName)
    .filter(Boolean);

  const reviewData = {
    date: values.date,
    time: values.startTime && values.endTime ? `${values.startTime} - ${values.endTime}` : "",
    role: values.role,
    event: values.eventName,
    bartender: selectedBartenderNames.join(", "),
    instruction: values.instructions,
    status: "published",
  };

  const handleSaveTemplate = () => {
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        formik.setTouched(
          Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        ErrorToast("Please fill all the required fields.");
        return;
      }

      const startObj = new Date(`${values.date}T${values.startTime}`);
      const endObj = new Date(`${values.date}T${values.endTime}`);

      const startDateTime = startObj.toISOString();
      const endDateTime = endObj.toISOString();

      if (isEdit) {
        updateShift(
          {
            id: data._id,
            role: values.role,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            instructions: values.instructions,
            status: "draft",
          },
          {
            onSuccess: () => {
              SuccessToast("Shift template saved as draft.");
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
                "Failed to update shift template."
              );
            },
          }
        );
      } else {
        createShift(
          {
            referenceType: "Event",
            referenceId: values.eventId,
            role: values.role,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            bartenderIds: values.bartenderIds,
            instructions: values.instructions,
            status: "draft",
          },
          {
            onSuccess: () => {
              SuccessToast("Shift template saved as draft.");
              onOpenChange(false);
            },
            onError: (error) => {
              ErrorToast(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save shift template."
              );
            },
          }
        );
      }
    });
  };

  const handleConfirm = () => {
    // Parse input date and times to ISO strings
    const startObj = new Date(`${values.date}T${values.startTime}`);
    let endObj = new Date(`${values.date}T${values.endTime}`);

    const startDateTime = startObj.toISOString();
    const endDateTime = endObj.toISOString();

    createShift(
      {
        referenceType: "Event",
        referenceId: values.eventId,
        role: values.role,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        bartenderIds: values.bartenderIds,
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
                    onChange={(e) => {
                      handleChange(e);
                      if (!isEdit) {
                        setFieldValue("eventId", "");
                        setFieldValue("eventName", "");
                      }
                    }}
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
                  <Label className={"text-base text-black flex items-center justify-between"}>
                    <span>Event</span>
                    {isEventsLoading && (
                      <span className="text-xs text-blue-900 flex items-center gap-1 font-normal">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading events...
                      </span>
                    )}
                  </Label>
                  <Select
                    value={values.eventId}
                    onValueChange={(val) => handleEventSelect(val)}
                    disabled={isEdit || isEventsLoading}
                  >
                    <SelectTrigger className={"w-full !h-14"}>
                      {isEventsLoading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-900" />
                          <span>Loading events...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select an Event" />
                      )}
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Events</SelectLabel>
                        {isEventsLoading ? (
                          <div className="flex items-center justify-center p-4 text-sm text-gray-500 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-900" />
                            Loading events...
                          </div>
                        ) : eventsData?.events?.length > 0 ? (
                          eventsData?.events?.map((event) => (
                            <SelectItem value={event._id} key={event._id}>
                              {event.title || event.name || event.eventName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">
                            {values.date ? "No events found for selected date" : "Please select a date first"}
                          </div>
                        )}
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
                    Assign Bartenders
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isEdit}
                        className="w-full !h-14 justify-between border-[#CACACA] hover:bg-transparent rounded-[15px] font-normal text-left text-sm"
                      >
                        <span className="truncate">
                          {values.bartenderIds && values.bartenderIds.length > 0
                            ? `${values.bartenderIds.length} Bartender(s) Selected`
                            : "Select Bartenders"}
                        </span>
                        <IoIosArrowDown className="text-gray-500 h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-4 bg-white border rounded-xl shadow-lg z-50">
                      {/* Search Input */}
                      <input
                        type="text"
                        placeholder="Search Bartender..."
                        className="w-full px-3 py-2 border rounded-lg text-sm mb-3 outline-none focus:ring-1 focus:ring-blue-900"
                        onChange={(e) => setSearchVal(e.target.value)}
                        value={searchVal}
                      />
                      {/* Bartenders List */}
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredBartenders.length > 0 ? (
                          filteredBartenders.map((bartender) => {
                            const isSelected = values.bartenderIds?.includes(bartender._id);
                            return (
                              <label
                                key={bartender._id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setFieldValue(
                                        "bartenderIds",
                                        values.bartenderIds.filter((id) => id !== bartender._id)
                                      );
                                    } else {
                                      setFieldValue("bartenderIds", [...(values.bartenderIds || []), bartender._id]);
                                    }
                                  }}
                                  className="h-4 w-4 rounded text-blue-900 border-gray-300 focus:ring-blue-800"
                                />
                                <span className="text-black font-medium">{bartender.fullName}</span>
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">No Bartenders found</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Display selected bartender badges below the select */}
                  {values.bartenderIds && values.bartenderIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {values.bartenderIds.map((id) => {
                        const b = bartendersData.find((bart) => bart._id === id);
                        if (!b) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900 text-white text-xs rounded-full font-medium"
                          >
                            {b.fullName}
                            {!isEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFieldValue(
                                    "bartenderIds",
                                    values.bartenderIds.filter((bid) => bid !== id)
                                  );
                                }}
                                className="hover:text-red-400 focus:outline-none flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {touched.bartenderIds && errors.bartenderIds && (
                    <p className="text-red-600 text-xs mt-1">{errors.bartenderIds}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className={"col-span-2 w-full h-14 text-lg flex items-center justify-center gap-2"}
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isEdit ? "Update" : "Create Shift"}
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveTemplate}
                  className={
                    "bg-gray-200 hover:bg-gray-100 text-black! col-span-2 w-full h-14 text-lg flex items-center justify-center gap-2"
                  }
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-5 w-5 animate-spin" />}
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
