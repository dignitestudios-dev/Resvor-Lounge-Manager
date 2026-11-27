"use client";
import React, { useState, useRef } from "react";
import { useFormik } from "formik";
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
import SendInvitationForm from "./SendInvitationForm";
import ConfirmPopup from "./ConfirmPopup";
import ImageCropperModal from "@/components/common/ImageCropperModal";
import FlyerPreviewCard from "./FlyerPreviewCard";
import SelectedFlyersBar from "./SelectedFlyersBar";
import { campaignFlyerSchema } from "@/lib/schema/campaign/campaignFlyerSchema";
import { ErrorToast } from "@/components/ui/toaster";
import {
  EMPTY_FLYER_VALUES,
  addFlyerToList,
  createFlyerItem,
  getTomorrowDateString,
  removeFlyerFromList,
  validateFlyersSelection,
} from "@/lib/utils/flyerUtils";
import { generateAllFlyerFiles } from "@/lib/utils/captureFlyers";
import {
  X,
  Trash2,
  RefreshCw,
  Loader2,
  Upload,
  Crop,
} from "lucide-react";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const eventTypes = [
  "Promoter Announcement",
  "Birthday Celebration",
  "Anniversary Celebration",
  "Special Event / Holiday",
  "Weekly Event Schedule",
  "Lounge Manager Announcement",
];

const createInitialCustomFlyer = () =>
  createFlyerItem({
    type: "custom",
    title: "Custom Flyer 1",
  });

const AddCustomFlyerModal = ({ isOpen, onOpenChange, onSaveFlyer = null }) => {
  const isPickerMode = typeof onSaveFlyer === "function";
  const fileInputRef = useRef(null);
  const flyerRefs = useRef({});

  // Multi-flyer array state (in picker mode, holds the single custom flyer being created)
  const [flyers, setFlyers] = useState(() => [createInitialCustomFlyer()]);
  const [activeFlyerId, setActiveFlyerId] = useState(() => flyers[0].id);

  // Cropper & drag state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedCropFile, setSelectedCropFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generation & invitation modals state
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [designedFlyers, setDesignedFlyers] = useState([]);
  const [invitationChannel, setInvitationChannel] = useState("email");

  const activeFlyer =
    flyers.find((f) => f.id === activeFlyerId) || flyers[0] || null;

  const formik = useFormik({
    initialValues: { ...EMPTY_FLYER_VALUES },
    validationSchema: campaignFlyerSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async () => {
      await handlePrimaryAction();
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
    setTouched,
    resetForm,
  } = formik;

  const updateFlyerById = (flyerId, updater) => {
    setFlyers((prev) =>
      prev.map((f) =>
        f.id === flyerId
          ? typeof updater === "function"
            ? updater(f)
            : { ...f, ...updater }
          : f
      )
    );
  };

  const switchActiveFlyer = (targetId, nextFlyersList = flyers) => {
    const target = nextFlyersList.find((f) => f.id === targetId);
    setActiveFlyerId(targetId);
    if (target) {
      resetForm({ values: { ...EMPTY_FLYER_VALUES, ...target.values } });
    }
  };

  const handleFieldChange = (e) => {
    handleChange(e);
    if (!activeFlyer) return;
    const { name, value } = e.target;
    updateFlyerById(activeFlyer.id, (f) => ({
      ...f,
      values: { ...f.values, [name]: value },
    }));
  };

  const handleSelectFieldChange = (field, value) => {
    setFieldValue(field, value);
    setFieldTouched(field, true, false);
    if (!activeFlyer) return;
    updateFlyerById(activeFlyer.id, (f) => ({
      ...f,
      values: { ...f.values, [field]: value },
    }));
  };

  const handleEditorChange = (html) => {
    if (!activeFlyer) return;
    updateFlyerById(activeFlyer.id, { editorContent: html });
  };

  // Multi-flyer selection bar handlers (standalone mode)
  const handleAddPredefinedFlyer = (template) => {
    const newFlyer = createFlyerItem({
      type: "predefined",
      templateId: template.id,
      title: template.title,
      imageUrl: template.image,
    });

    const result = addFlyerToList(flyers, newFlyer);
    if (!result.ok) {
      ErrorToast(result.error);
      return;
    }

    setFlyers(result.flyers);
    switchActiveFlyer(newFlyer.id, result.flyers);
  };

  const handleAddCustomFlyerSlot = () => {
    const customCount = flyers.filter((f) => f.type === "custom").length + 1;
    const newFlyer = createFlyerItem({
      type: "custom",
      title: `Custom Flyer ${customCount}`,
    });

    const result = addFlyerToList(flyers, newFlyer);
    if (!result.ok) {
      ErrorToast(result.error);
      return;
    }

    setFlyers(result.flyers);
    switchActiveFlyer(newFlyer.id, result.flyers);
  };

  const handleRemoveFlyer = (flyerId) => {
    const { flyers: nextFlyers, nextActiveId } = removeFlyerFromList(
      flyers,
      flyerId
    );
    setFlyers(nextFlyers);
    if (flyerId === activeFlyerId || !nextFlyers.some((f) => f.id === activeFlyerId)) {
      if (nextActiveId) {
        switchActiveFlyer(nextActiveId, nextFlyers);
      } else {
        setActiveFlyerId(null);
        resetForm({ values: { ...EMPTY_FLYER_VALUES } });
      }
    }
  };

  // Custom image upload & crop handlers (scoped to activeFlyer)
  const handleFileProcess = (file) => {
    if (!file || !activeFlyer) return;

    const fileExt = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type);
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isAllowedType || !isAllowedExt) {
      ErrorToast(
        "Only JPEG and PNG images are allowed (GIFs, documents, and videos are not supported)."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      ErrorToast("File size exceeds 10MB. Please select a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedCropFile(file);
    setIsCropperOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleCropSave = (croppedFile, previewUrl) => {
    if (!activeFlyer) return;
    const rawFile = selectedCropFile || activeFlyer.rawImageFile || croppedFile;
    updateFlyerById(activeFlyer.id, {
      imageFile: croppedFile,
      rawImageFile: rawFile,
      imageUrl: previewUrl,
    });
    setIsCropperOpen(false);
    setSelectedCropFile(null);
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setSelectedCropFile(null);
  };

  const handleReCrop = () => {
    if (!activeFlyer) return;
    const fileToCrop = activeFlyer.rawImageFile || activeFlyer.imageFile;
    if (!fileToCrop) return;
    setSelectedCropFile(fileToCrop);
    setIsCropperOpen(true);
  };

  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!activeFlyer) return;
    updateFlyerById(activeFlyer.id, {
      imageFile: null,
      rawImageFile: null,
      imageUrl: null,
    });
    setIsCropperOpen(false);
    setSelectedCropFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePrimaryAction = async () => {
    const validation = await validateFlyersSelection(flyers, campaignFlyerSchema);
    if (!validation.valid) {
      if (validation.invalidFlyerId) {
        switchActiveFlyer(validation.invalidFlyerId);
        if (Object.keys(validation.fieldErrors).length > 0) {
          setTouched(
            Object.keys(validation.fieldErrors).reduce(
              (acc, key) => ({ ...acc, [key]: true }),
              {}
            )
          );
        }
      }
      ErrorToast(validation.error);
      return;
    }

    if (isPickerMode) {
      const createdFlyer = flyers[0];
      onSaveFlyer(createdFlyer);
      handleModalClose(false);
      return;
    }

    try {
      setIsGenerating(true);
      const generated = await generateAllFlyerFiles(
        flyers,
        flyerRefs.current
      );
      console.log("Editor flyers before generation:", flyers);

      // Attach Additional Information to each generated flyer
      const generatedWithInfo = generated.map((item, index) => ({
        ...item,
        additionalInfo: flyers[index]?.editorContent || "",
      }));
      console.log("Generated flyers with info:", generatedWithInfo);

      setDesignedFlyers(generatedWithInfo);
      setOpenInvForm(true);
    } catch (err) {
      console.error("Canvas drawing error:", err);
      ErrorToast("Error generating flyer images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendSuccess = (channel) => {
    setInvitationChannel(channel || "email");
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  const handleModalClose = (open) => {
    if (!open) {
      const freshFlyer = createInitialCustomFlyer();
      setFlyers([freshFlyer]);
      setActiveFlyerId(freshFlyer.id);
      resetForm({ values: { ...EMPTY_FLYER_VALUES } });
      setIsCropperOpen(false);
      setSelectedCropFile(null);
      setDesignedFlyers([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(open);
  };

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
                {isPickerMode ? "Create Custom Flyer" : "Add Custom Flyer"}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isPickerMode
                  ? "Upload & crop your flyer image and enter its event details."
                  : "Design your flyer, select up to 3 flyers, and invite guests."}
              </p>
            </div>
            <DialogClose className="text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <div className="pt-5 space-y-6">
            {/* Multi-Flyer Selection Strip (standalone mode only) */}
            {!isPickerMode && (
              <SelectedFlyersBar
                flyers={flyers}
                activeFlyerId={activeFlyer?.id || null}
                onSelectFlyer={(id) => switchActiveFlyer(id)}
                onRemoveFlyer={handleRemoveFlyer}
                onAddPredefined={handleAddPredefinedFlyer}
                onAddCustom={handleAddCustomFlyerSlot}
              />
            )}

            {/* Main Form & Preview Grid */}
            {activeFlyer ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Left Column: Event Details Form (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Event Details
                      </h3>
                      <p className="text-xs text-gray-500">
                        Fill in the details below to update your card preview in real-time.
                      </p>
                    </div>
                    {!isPickerMode && flyers.length > 1 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        Editing Flyer {flyers.findIndex((f) => f.id === activeFlyer.id) + 1}
                      </span>
                    )}
                  </div>

                  {/* Event Type */}
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      Event Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={values.eventType}
                      onValueChange={(val) =>
                        handleSelectFieldChange("eventType", val)
                      }
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
                      onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
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
                          onChange={handleFieldChange}
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
                          onChange={handleFieldChange}
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
                        key={activeFlyer.id}
                        value={activeFlyer.editorContent}
                        onChange={handleEditorChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Card Preview & Custom Image Upload (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Card Preview
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Live flyer with your event details
                    </p>

                    <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 flex justify-center shadow-inner">
                      <div className="w-full max-w-[320px] sm:max-w-[360px]">
                        <FlyerPreviewCard
                          imageUrl={activeFlyer.imageUrl}
                          values={values}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Image Upload Option (shown only for custom flyers) */}
                  {activeFlyer.type === "custom" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-800">
                          Upload Custom Flyer Image
                        </Label>
                        {activeFlyer.imageUrl && (
                          <span className="text-[11px] text-green-600 font-semibold">
                            Custom image active
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

                      {activeFlyer.imageUrl ? (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={activeFlyer.imageUrl}
                              alt="Uploaded Flyer"
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {activeFlyer.imageFile?.name || "custom-flyer.png"}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {activeFlyer.imageFile?.size
                                  ? `${(
                                    activeFlyer.imageFile.size /
                                    (1024 * 1024)
                                  ).toFixed(2)} MB`
                                  : "Ready"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={handleReCrop}
                              className="p-1.5 hover:bg-white text-gray-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                              title="Crop custom image"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
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
                  ) : (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800">
                      Predefined template active:{" "}
                      <span className="font-semibold">{activeFlyer.title}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Offscreen capture targets for all selected flyers */}
            {!isPickerMode && flyers.length > 0 && (
              <div
                aria-hidden="true"
                className="fixed -left-[9999px] top-0 pointer-events-none"
              >
                {flyers.map((flyer) => (
                  <div key={flyer.id} className="w-[360px]">
                    <FlyerPreviewCard
                      captureRef={(el) => {
                        if (el) {
                          flyerRefs.current[flyer.id] = el;
                        } else {
                          delete flyerRefs.current[flyer.id];
                        }
                      }}
                      imageUrl={flyer.imageUrl}
                      values={flyer.values}
                    />
                  </div>
                ))}
              </div>
            )}

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
                onClick={handlePrimaryAction}
                disabled={isGenerating}
                className="h-12 px-8 bg-gradient text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPickerMode
                  ? "Add Custom Flyer"
                  : isGenerating
                    ? "Designing Flyers..."
                    : `Save & Send Invitation${flyers.length > 1 ? ` (${flyers.length} Flyers)` : ""
                    }`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Modal (standalone mode) */}
      {!isPickerMode && (
        <>
          <SendInvitationForm
            isOpen={openInvForm}
            onOpenChange={setOpenInvForm}
            onSendInvitation={handleSendSuccess}
            flyers={designedFlyers}
            image={designedFlyers[0]?.file || null}
            additionalInfo={designedFlyers
              .map((flyer, index) => {
                const info = flyer.additionalInfo?.trim();

                if (!info) return "";

                return designedFlyers.length > 1
                  ? `<h3>Flyer ${index + 1} Additional Information</h3>${info}`
                  : info;
              })
              .filter(Boolean)
              .join("<hr />")}
          />

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
      )}

      {/* Flyer Image Cropper Modal */}
      <ImageCropperModal
        open={isCropperOpen}
        onClose={handleCropCancel}
        imageFile={selectedCropFile}
        onCropSave={handleCropSave}
        aspect={null}
        allowResize={true}
        allowOriginal={true}
        title="Flyer Image"
        description="Drag or resize the crop frame freely using any of the 8 handles, or use the original image."
        showCircularPreview={false}
        previewLabel="Crop Preview"
      />
    </>
  );
};

export default AddCustomFlyerModal;
