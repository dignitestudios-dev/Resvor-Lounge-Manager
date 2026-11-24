"use client";
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import { useFormik } from "formik";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/global/RichTextEditor";
import TemplateCarousel from "@/components/campaign-and-flyers/TemplateCarousel";
import SendInvitationForm from "./SendInvitationForm";
import ConfirmPopup from "./ConfirmPopup";
import { campaignAndFlyers } from "@/lib/constants";
import { campaignFlyerSchema } from "@/lib/schema/campaign/campaignFlyerSchema";
import { ErrorToast } from "@/components/ui/toaster";
import {
  X,
  Trash2,
  RefreshCw,
  Loader2,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const eventTypes = [
  "Birthday Celebration",
  "Anniversary Celebration",
  "Special Event / Holiday",
  "Weekly Event Schedule",
  "Lounge Manager Announcement",
];

const AddCustomFlyerModal = ({ isOpen, onOpenChange }) => {
  const fileInputRef = useRef(null);
  const flyerRef = useRef(null);

  // Custom Image Upload state
  const [flyerImagePreview, setFlyerImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Template Selection state
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Rich Text Editor Content
  const [editorContent, setEditorContent] = useState("");

  // Generation & invitation modals state
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [designedFile, setDesignedFile] = useState(null);
  const [invitationChannel, setInvitationChannel] = useState("email");

  // Formik state
  const formik = useFormik({
    initialValues: {
      eventType: "",
      eventTitle: "",
      eventDate: "",
      eventStartTime: "",
      eventEndTime: "",
      address: "",
      city: "",
    },
    validationSchema: campaignFlyerSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async () => {
      await handleSaveAndSend();
    },
  });

  const {
    values,
    handleBlur,
    handleChange,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    resetForm,
  } = formik;

  // Has any live data for overlay
  const hasAnyData = Boolean(
    values.eventTitle ||
    values.eventDate ||
    values.eventStartTime ||
    values.eventEndTime ||
    values.address ||
    values.city
  );

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleFileProcess = (file) => {
    if (!file) return;

    const fileExt = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type);
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isAllowedType || !isAllowedExt) {
      const errorText =
        "Only JPEG and PNG images are allowed (GIFs, documents, and videos are not supported).";
      setErrorMessage(errorText);
      ErrorToast(errorText);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMessage("");
    setImageFile(file);
    setFlyerImagePreview(URL.createObjectURL(file));
    setSelectedTemplate(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setImageFile(null);
    setFlyerImagePreview(null);
    setSelectedTemplate(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setImageFile(null);
    setFlyerImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateFlyerFile = () => {
    return new Promise(async (resolve, reject) => {
      // If user uploaded a custom image and has NO overlay text data
      if (imageFile && !hasAnyData) {
        resolve(imageFile);
        return;
      }

      if (!flyerRef.current) {
        if (imageFile) {
          resolve(imageFile);
          return;
        }
        reject(new Error("Flyer preview element not found"));
        return;
      }

      try {
        setIsGenerating(true);
        const canvas = await html2canvas(flyerRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

        canvas.toBlob(
          (blob) => {
            setIsGenerating(false);
            if (blob) {
              const file = new File(
                [blob],
                imageFile?.name || "flyer.png",
                { type: "image/png" }
              );
              resolve(file);
            } else {
              reject(new Error("Canvas blob generation failed"));
            }
          },
          "image/png",
          1.0
        );
      } catch (err) {
        setIsGenerating(false);
        if (imageFile) {
          resolve(imageFile);
        } else {
          reject(err);
        }
      }
    });
  };

  const handleSaveAndSend = async () => {
    if (!activePreviewImage) {
      ErrorToast("Please upload a custom flyer image or select a template.");
      return;
    }

    const formErrors = await formik.validateForm();
    if (Object.keys(formErrors).length > 0) {
      formik.setTouched(
        Object.keys(formErrors).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      ErrorToast("Please fill all the required event details.");
      return;
    }

    try {
      const file = await generateFlyerFile();
      setDesignedFile(file);
      setOpenInvForm(true);
    } catch (err) {
      console.error("Canvas drawing error:", err);
      ErrorToast("Error generating flyer image. Please try again.");
    }
  };

  const handleSendSuccess = (channel) => {
    setInvitationChannel(channel || "email");
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  const handleModalClose = (open) => {
    if (!open) {
      resetForm();
      setImageFile(null);
      setFlyerImagePreview(null);
      setSelectedTemplate(null);
      setErrorMessage("");
      setEditorContent("");
      setDesignedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(open);
  };

  // Preview background image priority: custom uploaded image > selected template image
  const activePreviewImage = flyerImagePreview || selectedTemplate?.image;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[96vw] max-w-[96vw] sm:max-w-[96vw] max-h-[94vh] overflow-y-auto hidden-scrollbar p-6 sm:p-8 rounded-[20px] bg-white border-0 shadow-2xl gap-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181818]">
                Add Custom Flyer
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Design your flyer, select a template or upload your own, and invite guests.
              </p>
            </div>
            <DialogClose className="text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <div className="pt-5 space-y-6">
            {/* Main Form & Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Event Details Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Event Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Fill in the details below to update your card preview in real-time.
                  </p>
                </div>

                {/* Event Type */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={values.eventType}
                    onValueChange={(val) => {
                      setFieldValue("eventType", val);
                      setFieldTouched("eventType", true, false);
                    }}
                  >
                    <SelectTrigger
                      className={`w-full h-12 bg-white rounded-xl ${errors.eventType && touched.eventType
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[220px]">
                      <SelectGroup>
                        <SelectLabel>Event Types</SelectLabel>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.eventType && touched.eventType && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.eventType}
                    </p>
                  )}
                </div>

                {/* Event Title */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="eventTitle"
                    value={values.eventTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter event title"
                    maxLength={100}
                    className={`h-12 bg-white rounded-xl text-sm ${errors.eventTitle && touched.eventTitle
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300"
                      }`}
                  />
                  {errors.eventTitle && touched.eventTitle && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.eventTitle}
                    </p>
                  )}
                </div>

                {/* Date & Times (3 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      Event Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="eventDate"
                      type="date"
                      value={values.eventDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={getTomorrowDateString()}
                      className={`h-12 bg-white rounded-xl text-sm ${errors.eventDate && touched.eventDate
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    {errors.eventDate && touched.eventDate && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.eventDate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="eventStartTime"
                      type="time"
                      value={values.eventStartTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`h-12 bg-white rounded-xl text-sm ${errors.eventStartTime && touched.eventStartTime
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    {errors.eventStartTime && touched.eventStartTime && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.eventStartTime}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="eventEndTime"
                      type="time"
                      value={values.eventEndTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={values.eventStartTime || undefined}
                      className={`h-12 bg-white rounded-xl text-sm ${errors.eventEndTime && touched.eventEndTime
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    {errors.eventEndTime && touched.eventEndTime && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {errors.eventEndTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Section */}
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    Location
                  </h4>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium text-black">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        name="address"
                        rows={2}
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={200}
                        placeholder="Enter event address"
                        className={`w-full px-3 py-2 text-sm rounded-xl border bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${errors.address && touched.address
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      {errors.address && touched.address && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium text-black">
                        City (Optional)
                      </Label>
                      <Input
                        name="city"
                        value={values.city}
                        maxLength={60}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter city"
                        className={`h-12 bg-white rounded-xl text-sm ${errors.city && touched.city
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      {errors.city && touched.city && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-8">
                    <RichTextEditor
                      onChange={setEditorContent}
                      value={editorContent}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview & Custom Image / Templates 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Card Preview
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Live flyer with your event details
                  </p>

                  {/* Card Preview Container with html2canvas capture ref */}
                  <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 flex justify-center shadow-inner">
                    <div
                      ref={flyerRef}
                      className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[4/5] rounded-xl overflow-hidden shadow-lg select-none bg-gray-100"
                    >
                      {/* Base Image or Empty State */}
                      {activePreviewImage ? (
                        <img
                          src={activePreviewImage}
                          alt="Flyer Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs flex items-center justify-center mb-3 text-gray-400 border border-gray-200">
                            <Upload className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            No Image Selected
                          </p>
                          <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                            Upload a custom flyer image or select a template to preview
                          </p>
                        </div>
                      )}

                      {/* Live Text Overlay if image is selected and user entered any details */}
                      {activePreviewImage && hasAnyData && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/80 pointer-events-none" />

                          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 bg-black/55 backdrop-blur-xs rounded-xl border border-white/15 px-3.5 py-4 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            {/* Gold top accent bar */}
                            <div className="w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mb-3" />

                            {/* Title */}
                            <h2
                              className="text-white font-bold leading-snug text-center mb-3 tracking-wide break-words drop-shadow-md w-full"
                              style={{
                                fontSize:
                                  values.eventTitle &&
                                    values.eventTitle.length > 35
                                    ? "12px"
                                    : "14px",
                              }}
                            >
                              {values.eventTitle || "Event Title"}
                            </h2>

                            <div className="w-full h-px bg-white/20 mb-3" />

                            {/* Rows */}
                            <div className="flex flex-col gap-1.5 w-full text-[10px] text-white">
                              {/* Date */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-white/60 font-semibold min-w-[46px]">
                                  Date:
                                </span>
                                <span className="text-white/95 font-medium truncate">
                                  {values.eventDate
                                    ? (() => {
                                      const parts = values.eventDate.split("-");
                                      if (parts.length === 3) {
                                        const [year, month, day] = parts;
                                        return `${month}/${day}/${year}`;
                                      }
                                      return values.eventDate;
                                    })()
                                    : "—"}
                                </span>
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-white/60 font-semibold min-w-[46px]">
                                  Time:
                                </span>
                                <span className="text-white/95 font-medium truncate">
                                  {values.eventStartTime
                                    ? `${formatTime12h(values.eventStartTime)}${values.eventEndTime
                                      ? ` - ${formatTime12h(values.eventEndTime)}`
                                      : ""
                                    }`
                                    : "—"}
                                </span>
                              </div>

                              {/* Location */}
                              <div className="flex items-start gap-1.5">
                                <span className="text-white/60 font-semibold min-w-[46px] shrink-0">
                                  Location:
                                </span>
                                <span className="text-white/95 font-medium leading-tight break-words min-w-0 line-clamp-2">
                                  {values.address
                                    ? `${values.address}${values.city ? `, ${values.city}` : ""
                                    }`
                                    : "—"}
                                </span>
                              </div>
                            </div>

                            {/* Gold bottom accent bar */}
                            <div className="w-8 h-[2.5px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mt-3" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Image Upload Option */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-800">
                      Upload Custom Flyer Image
                    </Label>
                    {flyerImagePreview && (
                      <span className="text-[11px] text-green-600 font-semibold">
                        Custom image active
                      </span>
                    )}
                    {selectedTemplate && !flyerImagePreview && (
                      <span className="text-[11px] text-primary font-semibold">
                        Template active
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    id="modalCustomFlyerFileInput"
                    type="file"
                    accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {flyerImagePreview ? (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={flyerImagePreview}
                          alt="Uploaded Flyer"
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {imageFile?.name || "custom-flyer.png"}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {(imageFile?.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 hover:bg-white text-gray-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                          title="Change custom image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          title="Remove custom image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full py-4 px-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 bg-gray-50/50"
                        }`}
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <p className="text-xs text-gray-700 font-medium text-center">
                        Drop flyer image here, or{" "}
                        <span className="text-primary underline">browse</span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Supports JPEG, PNG up to 10 MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Templates Selector */}
                <div className="space-y-1.5 pt-1">

                </div>
              </div>
            </div>

            {/* Additional Information Section (Rich Text Editor) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">


            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModalClose(false)}
                className="h-12 px-6 rounded-xl text-sm font-medium w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSaveAndSend}
                disabled={isGenerating}
                className="h-12 px-8 bg-gradient text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isGenerating ? "Designing Flyer..." : "Save & Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Modal */}
      <SendInvitationForm
        isOpen={openInvForm}
        onOpenChange={setOpenInvForm}
        onSendInvitation={handleSendSuccess}
        image={designedFile}
        additionalInfo={editorContent}
      />

      {/* Confirmation Modal */}
      <ConfirmPopup
        isOpen={confirmPopup}
        channel={invitationChannel}
        onOpenChange={(open) => {
          setConfirmPopup(open);
          if (!open) {
            handleModalClose(false);
          }
        }}
      />
    </>
  );
};

export default AddCustomFlyerModal;
