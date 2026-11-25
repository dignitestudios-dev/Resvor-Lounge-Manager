"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { campaignAndFlyers } from "@/lib/constants";
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
import { Button } from "@/components/ui/button";
import SendInvitationForm from "@/components/campaign-and-flyers/SendInvitationForm";
import ConfirmPopup from "@/components/campaign-and-flyers/ConfirmPopup";
import SelectedFlyersBar from "@/components/campaign-and-flyers/SelectedFlyersBar";
import FlyerPreviewCard from "@/components/campaign-and-flyers/FlyerPreviewCard";
import AddCustomFlyerModal from "@/components/campaign-and-flyers/AddCustomFlyerModal";
import ImageCropperModal from "@/components/common/ImageCropperModal";
import { Crop, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { ErrorToast } from "@/components/ui/toaster";
import { campaignFlyerSchema } from "@/lib/schema/campaign/campaignFlyerSchema";
import {
  EMPTY_FLYER_VALUES,
  addFlyerToList,
  createFlyerItem,
  getTomorrowDateString,
  isDuplicatePredefinedTemplate,
  removeFlyerFromList,
  validateFlyersSelection,
} from "@/lib/utils/flyerUtils";
import { generateAllFlyerFiles } from "@/lib/utils/captureFlyers";

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

const CampaignAndFlyersDetails = () => {
  const params = useParams();
  const router = useRouter();
  const flyerId = useMemo(() => params.id, [params]);
  const flyerRefs = useRef({});
  const fileInputRef = useRef(null);

  const initialTemplate = useMemo(() => {
    return (
      campaignAndFlyers.find((c) => String(c.id) === String(flyerId)) ||
      campaignAndFlyers[0]
    );
  }, [flyerId]);

  // Multi-flyer array state (1 to 3 flyers)
  const [flyers, setFlyers] = useState(() => [
    createFlyerItem({
      type: "predefined",
      templateId: initialTemplate?.id ?? 5,
      title: initialTemplate?.title || "Predefined Flyer",
      imageUrl: initialTemplate?.image || "/images/flyerImage.jpg",
    }),
  ]);
  const [activeFlyerId, setActiveFlyerId] = useState(() => flyers[0].id);

  // Formik form state for the currently active flyer
  const formik = useFormik({
    initialValues: { ...EMPTY_FLYER_VALUES },
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
    setTouched,
    resetForm,
  } = formik;

  const activeFlyer =
    flyers.find((f) => f.id === activeFlyerId) || flyers[0] || null;

  // Sync first predefined flyer when route param changes on initial load
  useEffect(() => {
    if (!flyerId) return;
    const matched = campaignAndFlyers.find(
      (c) => String(c.id) === String(flyerId)
    );
    if (!matched) return;

    setFlyers((prev) => {
      if (prev.length === 1 && prev[0].type === "predefined") {
        return [
          {
            ...prev[0],
            templateId: matched.id,
            title: matched.title,
            imageUrl: matched.image,
          },
        ];
      }
      return prev;
    });
  }, [flyerId]);

  // Modal & generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [designedFlyers, setDesignedFlyers] = useState([]);
  const [invitationChannel, setInvitationChannel] = useState("email");

  // Custom flyer re-crop / replace states for active custom flyer
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedCropFile, setSelectedCropFile] = useState(null);

  const updateFlyerById = (targetId, updater) => {
    setFlyers((prev) =>
      prev.map((f) =>
        f.id === targetId
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

  // Swap active predefined flyer's template via carousel (blocking duplicates)
  const handleSelectCarouselTemplate = (template) => {
    if (!activeFlyer || activeFlyer.type !== "predefined") return;
    if (
      isDuplicatePredefinedTemplate(flyers, template.id, activeFlyer.id)
    ) {
      ErrorToast("This predefined flyer is already selected.");
      return;
    }

    updateFlyerById(activeFlyer.id, {
      templateId: template.id,
      title: template.title,
      imageUrl: template.image,
    });
  };

  // Add another predefined flyer via + Add Flyer chooser
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

  // Add custom flyer created via AddCustomFlyerModal
  const handleAddCustomFlyer = (customFlyer) => {
    const result = addFlyerToList(flyers, customFlyer);
    if (!result.ok) {
      ErrorToast(result.error);
      return;
    }

    setFlyers(result.flyers);
    switchActiveFlyer(customFlyer.id, result.flyers);
  };

  const handleRemoveFlyer = (targetId) => {
    const { flyers: nextFlyers, nextActiveId } = removeFlyerFromList(
      flyers,
      targetId
    );
    setFlyers(nextFlyers);
    if (
      targetId === activeFlyerId ||
      !nextFlyers.some((f) => f.id === activeFlyerId)
    ) {
      if (nextActiveId) {
        switchActiveFlyer(nextActiveId, nextFlyers);
      } else {
        setActiveFlyerId(null);
        resetForm({ values: { ...EMPTY_FLYER_VALUES } });
      }
    }
  };

  // Active custom flyer image replace / re-crop handlers
  const handleCustomImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeFlyer) return;

    const fileExt = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (
      !ALLOWED_MIME_TYPES.includes(file.type) ||
      !ALLOWED_EXTENSIONS.includes(fileExt)
    ) {
      ErrorToast("Only JPEG and PNG images are allowed.");
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

  const handleReCrop = () => {
    if (!activeFlyer) return;
    const fileToCrop = activeFlyer.rawImageFile || activeFlyer.imageFile;
    if (!fileToCrop) return;
    setSelectedCropFile(fileToCrop);
    setIsCropperOpen(true);
  };

  const handleClearCustomImage = () => {
    if (!activeFlyer) return;
    updateFlyerById(activeFlyer.id, {
      imageFile: null,
      rawImageFile: null,
      imageUrl: null,
    });
  };

  const handleSaveAndSend = async () => {
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

    try {
      setIsGenerating(true);
      const generated = await generateAllFlyerFiles(flyers, flyerRefs.current);
      setDesignedFlyers(generated);
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

  // Predefined template IDs already used by OTHER flyers in the list
  const otherSelectedTemplateIds = useMemo(
    () =>
      flyers
        .filter((f) => f.id !== activeFlyer?.id && f.type === "predefined")
        .map((f) => f.templateId),
    [flyers, activeFlyer?.id]
  );

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="section-heading mt-4">Campaign and Flyers</h1>
      <div className="mt-10 flex-1 bg-white border rounded-2xl p-5 space-y-6">
        {/* Selected Flyers Bar (1-3 flyers + Add Flyer button) */}
        <SelectedFlyersBar
          flyers={flyers}
          activeFlyerId={activeFlyer?.id || null}
          onSelectFlyer={(id) => switchActiveFlyer(id)}
          onRemoveFlyer={handleRemoveFlyer}
          onAddPredefined={handleAddPredefinedFlyer}
          onAddCustom={() => setOpenCustomModal(true)}
        />

        {activeFlyer ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="section-heading text-2xl font-bold">
                      Event Details
                    </h3>
                    <p className="text-[#333333]">
                      Fill in the details below to design your flyer card in
                      real-time.
                    </p>
                  </div>
                  {flyers.length > 1 && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                      Editing Flyer {flyers.findIndex((f) => f.id === activeFlyer.id) + 1}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Type
                  </Label>
                  <Select
                    value={values.eventType}
                    onValueChange={(value) =>
                      handleSelectFieldChange("eventType", value)
                    }
                  >
                    <SelectTrigger
                      className={`w-full h-14! ${
                        errors.eventType && touched.eventType
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className={"h-[200px]"}>
                      <SelectGroup>
                        <SelectLabel>Event Types</SelectLabel>
                        {eventTypes.map((type, index) => (
                          <SelectItem value={type} key={index}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.eventType && touched.eventType && (
                    <p className="text-red-600 text-[12px] mt-1">
                      {errors.eventType}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Event Title
                  </Label>
                  <Input
                    name="eventTitle"
                    value={values.eventTitle}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    placeholder="Enter event title"
                    maxLength={100}
                    className={`h-12 ${
                      errors.eventTitle && touched.eventTitle
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.eventTitle && touched.eventTitle && (
                    <p className="text-red-600 text-[12px] mt-1">
                      {errors.eventTitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      Event Date
                    </Label>
                    <Input
                      name="eventDate"
                      type={"date"}
                      value={values.eventDate}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      min={getTomorrowDateString()}
                      placeholder="Enter event date"
                      className={`h-12 ${
                        errors.eventDate && touched.eventDate
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.eventDate && touched.eventDate && (
                      <p className="text-red-600 text-[12px] mt-1">
                        {errors.eventDate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      Start Time
                    </Label>
                    <Input
                      name="eventStartTime"
                      type={"time"}
                      value={values.eventStartTime}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      placeholder="Enter start time"
                      className={`h-12 ${
                        errors.eventStartTime && touched.eventStartTime
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.eventStartTime && touched.eventStartTime && (
                      <p className="text-red-600 text-[12px] mt-1">
                        {errors.eventStartTime}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-black">
                      End Time
                    </Label>
                    <Input
                      name="eventEndTime"
                      type={"time"}
                      value={values.eventEndTime}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      placeholder="Enter end time"
                      className={`h-12 ${
                        errors.eventEndTime && touched.eventEndTime
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.eventEndTime && touched.eventEndTime && (
                      <p className="text-red-600 text-[12px] mt-1">
                        {errors.eventEndTime}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="section-heading text-2xl font-bold">Location</h3>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Address
                  </Label>
                  <textarea
                    name="address"
                    rows={2}
                    value={values.address}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    maxLength={200}
                    placeholder="Enter event address"
                    className={`w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent text-black placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-primary focus-visible:ring-[3px] outline-none resize-none transition-[color,box-shadow] md:text-sm ${
                      errors.address && touched.address
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.address && touched.address && (
                    <p className="text-red-600 text-[12px] mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">City</Label>
                  <Input
                    name="city"
                    value={values.city}
                    maxLength={60}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    placeholder="Enter city"
                    className={`h-12 ${
                      errors.city && touched.city
                        ? "border-red-500 ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.city && touched.city && (
                    <p className="text-red-600 text-[12px] mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[400px]">
                  <h3 className="section-heading text-2xl font-bold mb-2">
                    Card Preview
                  </h3>

                  {/* Dynamic Overlay Preview */}
                  <div className="rounded-2xl border-2 p-6 sm:p-8 bg-gray-50 flex justify-center">
                    <FlyerPreviewCard
                      imageUrl={activeFlyer.imageUrl}
                      values={values}
                    />
                  </div>

                  {activeFlyer.type === "predefined" ? (
                    <div>
                      <p className="my-3 font-semibold text-lg">
                        Select Card Template
                      </p>

                      <TemplateCarousel
                        selectedId={activeFlyer.templateId}
                        disabledIds={otherSelectedTemplateIds}
                        onSelectTemplate={handleSelectCarouselTemplate}
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <p className="font-semibold text-sm text-gray-800">
                        Custom Flyer Image
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                        className="hidden"
                        onChange={handleCustomImageChange}
                      />
                      {activeFlyer.imageUrl ? (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={activeFlyer.imageUrl}
                              alt="Custom Flyer"
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {activeFlyer.imageFile?.name || "custom-flyer.png"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={handleReCrop}
                              className="p-1.5 hover:bg-white text-gray-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                              title="Crop image"
                            >
                              <Crop className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-1.5 hover:bg-white text-gray-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                              title="Replace image"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleClearCustomImage}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 px-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary/50 bg-gray-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-700">
                            Upload & Crop Custom Flyer Image
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <RichTextEditor
              key={activeFlyer.id}
              value={activeFlyer.editorContent}
              onChange={handleEditorChange}
            />
          </>
        ) : null}

        {/* Offscreen capture targets for all selected flyers */}
        {flyers.length > 0 && (
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

        <Button
          type="button"
          onClick={handleSaveAndSend}
          disabled={isGenerating || flyers.length === 0}
          className={"h-14! w-xl max-w-full flex items-center justify-center gap-2"}
        >
          {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
          {isGenerating
            ? "Designing Flyers..."
            : `Save & Send Invitation${
                flyers.length > 1 ? ` (${flyers.length} Flyers)` : ""
              }`}
        </Button>
      </div>

      {/* Add Custom Flyer Modal (picker mode) */}
      <AddCustomFlyerModal
        isOpen={openCustomModal}
        onOpenChange={setOpenCustomModal}
        onSaveFlyer={handleAddCustomFlyer}
      />

      {/* Cropper for active custom flyer */}
      <ImageCropperModal
        open={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedCropFile(null);
        }}
        imageFile={selectedCropFile}
        onCropSave={handleCropSave}
        aspect={4 / 5}
        targetWidth={800}
        targetHeight={1000}
        title="Crop Flyer Image"
        description="Drag and zoom to frame your flyer image for the 4:5 card preview."
        showCircularPreview={false}
        previewLabel="Flyer (4:5)"
      />

      {/* Invitation Modal */}
      <SendInvitationForm
        isOpen={openInvForm}
        onOpenChange={setOpenInvForm}
        onSendInvitation={handleSendSuccess}
        flyers={designedFlyers}
        image={designedFlyers[0]?.file || null}
        additionalInfo={designedFlyers[0]?.additionalInfo || ""}
      />

      {/* Confirmation Modal */}
      <ConfirmPopup
        isOpen={confirmPopup}
        channel={invitationChannel}
        onOpenChange={(open) => {
          setConfirmPopup(open);
          if (!open) {
            router.push("/dashboard/campaign-and-flyers/history");
          }
        }}
      />
    </div>
  );
};

export default CampaignAndFlyersDetails;
