"use client";
import React, { useEffect, useState, useRef } from "react";
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
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Camera, Plus, Trash2, X, Loader2 } from "lucide-react";
import Edit2 from "../icons/Edit2";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";
import {
  useCreateGuest,
  useUpdateGuest,
} from "@/lib/hooks/mutations/GuestbookMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { phoneFormatter, phoneToE164 } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { addGuestSchema } from "@/lib/schema/guestbook/addGuestSchema";
import PhoneInput from "../auth/PhoneInput";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const stripCountryCode = (phone) => {
  if (!phone) return "";
  if (phone.startsWith("+1")) {
    return phone.slice(2).replace(/\D/g, "");
  }
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return cleaned.slice(1);
  }
  return cleaned;
};

const parseSpecialDates = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const FieldError = ({ touched, error }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

const AddGuestForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  showTrigger = true,
}) => {
  const fileInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [selectedLoungeId, setSelectedLoungeId] = useState(() => {
    if (data?.loungeId) return data.loungeId;
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeLoungeId") || "";
    }
    return "";
  });

  const queryClient = useQueryClient();
  const { data: lounges = [] } = useGetLounges();
  const createGuestMutation = useCreateGuest();
  const updateGuestMutation = useUpdateGuest();

  const getInitialValues = (guestData) => {
    let fName = guestData?.firstName || "";
    let lName = guestData?.lastName || "";
    if (!fName && !lName && guestData?.fullName) {
      const parts = guestData.fullName.trim().split(" ");
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || "";
    }

    return {
      photo: null,
      firstName: fName,
      lastName: lName,
      email: guestData?.email || "",
      birthMonth: guestData?.birthMonth ? String(guestData.birthMonth) : "",
      phoneNumber: stripCountryCode(guestData?.phoneNumber) || "",
      specialDates: parseSpecialDates(guestData?.specialDates),
      details: guestData?.details || guestData?.notes || "",
    };
  };

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: addGuestSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (!isEdit && !selectedLoungeId) {
          ErrorToast("Please select a lounge");
          return;
        }

        const formattedPhone = values.phoneNumber?.trim()
          ? phoneToE164(values.phoneNumber)
          : "";

        const payload = {
          loungeId: selectedLoungeId,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          birthMonth: values.birthMonth || undefined,
          phoneNumber: formattedPhone || undefined,
          details: values.details?.trim() || undefined,
          specialDates: values.specialDates || [],
          photo: values.photo,
        };

        if (isEdit && data?._id) {
          await updateGuestMutation.mutateAsync({
            entryId: data._id,
            ...payload,
          });
        } else {
          await createGuestMutation.mutateAsync(payload);
        }

        queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });

        SuccessToast(
          isEdit ? "Guest updated successfully" : "Guest added successfully"
        );

        handleResetAndClose();
      } catch (error) {
        ErrorToast(
          error?.response?.data?.message ||
            error?.message ||
            `Failed to ${isEdit ? "update" : "add"} guest. Please try again.`
        );
        console.error(`${isEdit ? "Update" : "Add"} guest error:`, error);
      }
    },
  });

  const handleResetAndClose = () => {
    formik.resetForm();
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  // Sync selectedLoungeId
  useEffect(() => {
    if (isEdit && data) {
      setSelectedLoungeId(data.loungeId || "");
      return;
    }

    const syncLounge = () => {
      const storedId = localStorage.getItem("activeLoungeId");
      if (storedId) {
        setSelectedLoungeId(storedId);
      } else if (lounges.length > 0) {
        setSelectedLoungeId(lounges[0]._id);
      }
    };

    syncLounge();
    window.addEventListener("activeLoungeChanged", syncLounge);
    return () => {
      window.removeEventListener("activeLoungeChanged", syncLounge);
    };
  }, [lounges, isEdit, data]);

  // Sync initial values and image preview when editing
  useEffect(() => {
    if (isOpen) {
      if (isEdit && data) {
        const existingPhoto =
          data.photo?.location ||
          data.photo?.url ||
          (typeof data.photo === "string" ? data.photo : null) ||
          data.profileImage?.location ||
          data.profileImage?.url ||
          (typeof data.profileImage === "string" ? data.profileImage : null);
        setProfileImagePreview(existingPhoto);
      } else {
        formik.resetForm();
        setProfileImagePreview(null);
      }
    }
  }, [isOpen, isEdit, data]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("photo", file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    formik.setFieldValue("photo", null);
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddSpecialDate = () => {
    const currentDates = formik.values.specialDates || [];
    formik.setFieldValue("specialDates", [
      ...currentDates,
      { title: "", date: "" },
    ]);
  };

  const handleRemoveSpecialDate = (index) => {
    const currentDates = formik.values.specialDates || [];
    formik.setFieldValue(
      "specialDates",
      currentDates.filter((_, i) => i !== index)
    );
  };

  const isPending = isEdit
    ? updateGuestMutation.isPending
    : createGuestMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button className="w-14! h-14!">
              <Edit2 className="scale-150 cursor-pointer" />
            </Button>
          ) : (
            <Button className="border-2 h-12 text-[14px] px-6">
              Add New Guest
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto hidden-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {isEdit
              ? "Update guest details and special dates."
              : "Enter the guest's details to save to your guestbook."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="mt-2 space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 shrink-0">
                <Label
                  htmlFor="guestPhoto"
                  className="cursor-pointer block w-full h-full"
                >
                  <div
                    className="w-full h-full rounded-full bg-center bg-cover flex justify-center items-center bg-gray-100 border border-gray-200"
                    style={{
                      backgroundImage: profileImagePreview
                        ? `url(${profileImagePreview})`
                        : "none",
                    }}
                  >
                    {!profileImagePreview && (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="guestPhoto"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </Label>
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all duration-200 focus:outline-none flex items-center justify-center w-6 h-6 border-2 border-white cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <Label
                htmlFor="guestPhoto"
                className="text-primary font-semibold cursor-pointer hover:underline text-sm"
              >
                {profileImagePreview ? "Change Guest Photo" : "Add Guest Photo"}{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
            </div>
            <FieldError
              touched={formik.touched.photo}
              error={formik.errors.photo}
            />
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="firstName" className="text-sm font-medium text-black">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="First Name (e.g. Ada)"
                className="h-12"
                id="firstName"
                name="firstName"
                maxLength={50}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FieldError
                touched={formik.touched.firstName}
                error={formik.errors.firstName}
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="lastName" className="text-sm font-medium text-black">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Last Name (e.g. Lovelace)"
                className="h-12"
                id="lastName"
                name="lastName"
                maxLength={50}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FieldError
                touched={formik.touched.lastName}
                error={formik.errors.lastName}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="email" className="text-sm font-medium text-black">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="ada@example.com"
              type="email"
              className="h-12"
              id="email"
              name="email"
              maxLength={60}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FieldError
              touched={formik.touched.email}
              error={formik.errors.email}
            />
          </div>

          {/* Phone Number & Birth Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full flex flex-col gap-1">
              <PhoneInput
                variant="light"
                label="Phone Number (Optional)"
                value={phoneFormatter(formik.values.phoneNumber)}
                id="phoneNumber"
                name="phoneNumber"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.phoneNumber}
                touched={formik.touched.phoneNumber}
                autoComplete="off"
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="birthMonth" className="text-sm font-medium text-black mb-1">
                Birth Month (Optional)
              </Label>
              <Select
                value={formik.values.birthMonth ? String(formik.values.birthMonth) : ""}
                onValueChange={(val) => formik.setFieldValue("birthMonth", val)}
              >
                <SelectTrigger className="w-full h-12 bg-white border-gray-300 rounded-[15px] px-3 text-sm">
                  <SelectValue placeholder="Select Birth Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError
                touched={formik.touched.birthMonth}
                error={formik.errors.birthMonth}
              />
            </div>
          </div>

          {/* Special Dates Section */}
          <div className="w-full flex flex-col gap-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-black">
                  Special Dates
                </Label>
                <span className="text-xs text-gray-400 block">
                  e.g., Birthday, Anniversary
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpecialDate}
                className="text-xs h-8 px-3 flex items-center gap-1 border-dashed border-primary text-primary hover:bg-primary/5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Date
              </Button>
            </div>

            {formik.values.specialDates && formik.values.specialDates.length > 0 ? (
              <div className="space-y-3 mt-1">
                {formik.values.specialDates.map((item, index) => {
                  const titleError =
                    formik.errors.specialDates?.[index]?.title;
                  const dateError =
                    formik.errors.specialDates?.[index]?.date;
                  const isTouched =
                    formik.touched.specialDates?.[index];

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="Title (e.g. Birthday)"
                            className="h-10 text-sm bg-white"
                            value={item.title || ""}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `specialDates[${index}].title`,
                                e.target.value
                              )
                            }
                          />
                          {isTouched && titleError && (
                            <p className="text-red-500 text-[11px] mt-0.5">
                              {titleError}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="date"
                            className="h-10 text-sm bg-white"
                            value={item.date || ""}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `specialDates[${index}].date`,
                                e.target.value
                              )
                            }
                          />
                          {isTouched && dateError && (
                            <p className="text-red-500 text-[11px] mt-0.5">
                              {dateError}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecialDate(index)}
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 cursor-pointer"
                        title="Remove date"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Details / Notes */}
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="details" className="text-sm font-medium text-black">
              Details / Notes (Optional)
            </Label>
            <Textarea
              id="details"
              name="details"
              placeholder="e.g. VIP guest, preferred corner booth, special preferences"
              className="h-24 resize-none"
              maxLength={500}
              value={formik.values.details}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FieldError
              touched={formik.touched.details}
              error={formik.errors.details}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : isEdit ? (
              "Update Guest"
            ) : (
              "Save Guest"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestForm;

