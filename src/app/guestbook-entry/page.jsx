"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import {
  Camera,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Building2,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getPublicGuestbookLounges,
  createPublicGuestbookEntry,
  buildPublicGuestbookFormData,
} from "@/lib/api/publicGuestbook";
import { publicGuestbookSchema } from "@/lib/schema/guestbook/publicGuestbookSchema";
import SearchableLoungeSelector from "@/components/guestbook/SearchableLoungeSelector";
import PhoneInput from "@/components/auth/PhoneInput";
import { phoneFormatter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const initialFormValues = {
  loungeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  birthMonth: "",
  photo: null,
  specialDates: [],
  details: "",
};

export default function PublicGuestbookEntryPage() {
  const fileInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Submission UI state: 'idle' | 'submitting' | 'success' | 'duplicate'
  const [submissionState, setSubmissionState] = useState("idle");
  const [successLoungeName, setSuccessLoungeName] = useState("");
  const [duplicateLoungeName, setDuplicateLoungeName] = useState("");

  // Error banners
  const [generalError, setGeneralError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Fetch active lounges
  const {
    data: loungesResponse,
    isLoading: isLoungesLoading,
    isError: isLoungesError,
    refetch: refetchLounges,
  } = useQuery({
    queryKey: ["public-lounges"],
    queryFn: getPublicGuestbookLounges,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const activeLounges = loungesResponse?.data || [];

  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: publicGuestbookSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setFieldError }) => {
      setGeneralError("");
      setIsRateLimited(false);
      setSubmissionState("submitting");

      try {
        const formData = buildPublicGuestbookFormData(values);
        const response = await createPublicGuestbookEntry(formData);

        // Find selected lounge name for success screen
        const loungeObj = activeLounges.find((l) => l._id === values.loungeId);
        setSuccessLoungeName(loungeObj?.name || "the lounge");

        setSubmissionState("success");
      } catch (error) {
        setSubmissionState("idle");
        const status = error?.response?.status;
        const data = error?.response?.data;

        // 1. Duplicate entry - HTTP 409
        if (status === 409) {
          const loungeObj = activeLounges.find((l) => l._id === values.loungeId);
          setDuplicateLoungeName(loungeObj?.name || "this lounge");
          setSubmissionState("duplicate");
          return;
        }

        // 2. Inactive lounge - HTTP 400
        if (status === 400) {
          const msg = data?.message || "Lounge is not available";
          setGeneralError(`${msg}. Please choose another lounge.`);
          formik.setFieldValue("loungeId", "");
          refetchLounges();
          return;
        }

        // 3. Rate limited - HTTP 429
        if (status === 429) {
          setIsRateLimited(true);
          setGeneralError(
            data?.message ||
              "Too many guestbook requests. Please try again later."
          );
          return;
        }

        // 4. Validation errors - HTTP 422
        if (status === 422) {
          let hasMappedField = false;
          if (Array.isArray(data?.error)) {
            data.error.forEach((err) => {
              if (err.path) {
                const fieldName = err.path.replace(/^body\./, "");
                setFieldError(fieldName, err.message);
                hasMappedField = true;
              }
            });
          }
          if (!hasMappedField) {
            setGeneralError(
              data?.message ||
                "Validation error. Please verify the information entered."
            );
          }
          return;
        }

        // 5. General / Network error
        const errorMessage =
          data?.message ||
          (error.code === "NO_INTERNET"
            ? "No internet connection. Please check your network and try again."
            : "Failed to submit your details. Please check your connection and try again.");

        setGeneralError(errorMessage);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Pre-validate file type and size
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      formik.setFieldError("photo", "Only JPG, JPEG, PNG, and WEBP images are allowed.");
      formik.setFieldTouched("photo", true, false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      formik.setFieldError("photo", "Photo must be less than 5 MB.");
      formik.setFieldTouched("photo", true, false);
      return;
    }

    formik.setFieldError("photo", undefined);
    formik.setFieldValue("photo", file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    formik.setFieldValue("photo", null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddSpecialDate = () => {
    const current = formik.values.specialDates || [];
    formik.setFieldValue("specialDates", [...current, { title: "", date: "" }]);
  };

  const handleRemoveSpecialDate = (index) => {
    const current = formik.values.specialDates || [];
    formik.setFieldValue(
      "specialDates",
      current.filter((_, i) => i !== index)
    );
  };

  const handleAddAnotherLounge = () => {
    formik.resetForm({ values: initialFormValues });
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setGeneralError("");
    setIsRateLimited(false);
    setSubmissionState("idle");
  };

  const handleSelectAnotherFromDuplicate = () => {
    formik.setFieldValue("loungeId", "");
    setSubmissionState("idle");
    setGeneralError("");
  };

  const isSubmitting = submissionState === "submitting";

  return (
    <div className="min-h-screen bg-[#F4F4FF] py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      {/* Brand Header */}
      <div className="w-full max-w-lg mb-4 text-center">
        <div className="flex justify-center mb-3">
          <img
            src="/images/resLogo.png"
            alt="Resvor"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              // Graceful fallback to text if image fails
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* SUCCESS STATE */}
        {submissionState === "success" ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-4 border-green-100 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Added to Guestbook
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                You’re on the guestbook
              </h1>
              {successLoungeName && (
                <p className="text-sm font-semibold text-primary">
                  {successLoungeName}
                </p>
              )}
              <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                The lounge manager will be able to find your entry when you
                arrive.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                type="button"
                onClick={handleAddAnotherLounge}
                className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Add yourself to another lounge
              </Button>
            </div>
          </div>
        ) : submissionState === "duplicate" ? (
          /* DUPLICATE ENTRY STATE (HTTP 409) */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto border-4 border-blue-100 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-primary">
                Already Listed
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                You’re already on this guestbook
              </h1>
              <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
                You’re already listed in{" "}
                <span className="font-semibold text-gray-800">
                  {duplicateLoungeName}
                </span>
                ’s guestbook. The lounge manager can find your entry when you
                arrive.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={handleSelectAnotherFromDuplicate}
                className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Select another lounge
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmissionState("idle")}
                className="w-full h-11 text-sm font-medium text-gray-700 rounded-xl cursor-pointer"
              >
                Back to form
              </Button>
            </div>
          </div>
        ) : (
          /* MAIN GUESTBOOK FORM */
          <div className="p-5 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Join a Lounge Guestbook
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs sm:max-w-md mx-auto">
                Select the lounge you are visiting and enter your details to be
                added to their guestbook.
              </p>
            </div>

            {/* Error banner */}
            {generalError && (
              <div
                role="alert"
                className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs sm:text-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5">{generalError}</p>
                </div>
                {formik.submitCount > 0 && !isRateLimited && (
                  <button
                    type="button"
                    onClick={() => formik.handleSubmit()}
                    className="shrink-0 font-semibold underline text-red-700 hover:text-red-900"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Lounge Selector */}
              <SearchableLoungeSelector
                lounges={activeLounges}
                selectedLoungeId={formik.values.loungeId}
                onSelectLounge={(loungeId) => {
                  formik.setFieldValue("loungeId", loungeId);
                  formik.setFieldError("loungeId", undefined);
                  setGeneralError("");
                }}
                isLoading={isLoungesLoading}
                isError={isLoungesError}
                onRetry={refetchLounges}
                errorMessage={
                  formik.touched.loungeId ? formik.errors.loungeId : ""
                }
              />

              {/* Photo Upload */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <Label
                      htmlFor="publicGuestPhoto"
                      className="cursor-pointer block w-full h-full"
                    >
                      <div
                        className="w-full h-full rounded-full bg-center bg-cover flex justify-center items-center bg-gray-100 border-2 border-gray-200 hover:border-primary/50 transition-colors"
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
                        id="publicGuestPhoto"
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
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all duration-200 flex items-center justify-center w-6 h-6 border-2 border-white cursor-pointer"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="publicGuestPhoto"
                      className="text-primary font-semibold cursor-pointer hover:underline text-sm block"
                    >
                      {profileImagePreview ? "Change Photo" : "Add Your Photo"}{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG, or WEBP up to 5 MB
                    </p>
                  </div>
                </div>
                {formik.touched.photo && formik.errors.photo && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.photo}
                  </p>
                )}
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="w-full flex flex-col gap-1">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-900"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="e.g. Alex"
                    maxLength={100}
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`h-12 bg-white rounded-xl text-sm ${
                      formik.touched.firstName && formik.errors.firstName
                        ? "border-red-400 focus:border-red-500 ring-2 ring-red-100"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="e.g. Morgan"
                    maxLength={100}
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`h-12 bg-white rounded-xl text-sm ${
                      formik.touched.lastName && formik.errors.lastName
                        ? "border-red-400 focus:border-red-500 ring-2 ring-red-100"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="w-full flex flex-col gap-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-900"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  maxLength={120}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`h-12 bg-white rounded-xl text-sm ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-400 focus:border-red-500 ring-2 ring-red-100"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number & Birth Month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    autoComplete="tel"
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label
                    htmlFor="birthMonth"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Birth Month (Optional)
                  </Label>
                  <Select
                    value={
                      formik.values.birthMonth
                        ? String(formik.values.birthMonth)
                        : ""
                    }
                    onValueChange={(val) =>
                      formik.setFieldValue("birthMonth", val)
                    }
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
                  {formik.touched.birthMonth && formik.errors.birthMonth && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {formik.errors.birthMonth}
                    </p>
                  )}
                </div>
              </div>

              {/* Special Dates Section */}
              <div className="w-full flex flex-col gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">
                      Special Dates
                    </Label>
                    <span className="text-[11px] text-gray-500 block">
                      e.g., Birthday, Anniversary (Optional)
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

                {formik.values.specialDates &&
                formik.values.specialDates.length > 0 ? (
                  <div className="space-y-2.5 mt-1">
                    {formik.values.specialDates.map((item, index) => {
                      const titleError =
                        formik.errors.specialDates?.[index]?.title;
                      const dateError =
                        formik.errors.specialDates?.[index]?.date;
                      const isTouched = formik.touched.specialDates?.[index];

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Input
                                placeholder="Occasion (e.g. Birthday)"
                                className="h-10 text-xs sm:text-sm bg-white"
                                value={item.title || ""}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `specialDates[${index}].title`,
                                    e.target.value
                                  )
                                }
                                aria-label={`Occasion title ${index + 1}`}
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
                                className="h-10 text-xs sm:text-sm bg-white"
                                value={item.date || ""}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `specialDates[${index}].date`,
                                    e.target.value
                                  )
                                }
                                aria-label={`Occasion date ${index + 1}`}
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
                            aria-label={`Remove date ${index + 1}`}
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
              <div className="w-full flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="details"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Special Notes or Preferences
                  </Label>
                  <span className="text-[11px] text-gray-400">
                    {formik.values.details?.length || 0}/500
                  </span>
                </div>
                <Textarea
                  id="details"
                  name="details"
                  placeholder="e.g. Seating preferences, drinks, celebration notes"
                  className="h-20 resize-none text-sm bg-white rounded-xl border-gray-300"
                  maxLength={500}
                  value={formik.values.details}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.details && formik.errors.details && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {formik.errors.details}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isRateLimited}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding to Guestbook...
                    </span>
                  ) : (
                    "Add to Guestbook"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer text */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Powered by Resvor &bull; Lounge Guestbook
      </p>
    </div>
  );
}

