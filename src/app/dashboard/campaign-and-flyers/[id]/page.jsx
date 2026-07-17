"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
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
import Image from "next/image";
import TemplateCarousel from "@/components/campaign-and-flyers/TemplateCarousel";
import { Button } from "@/components/ui/button";
import SendInvitationForm from "@/components/campaign-and-flyers/SendInvitationForm";
import ConfirmPopup from "@/components/campaign-and-flyers/ConfirmPopup";
import { Loader2 } from "lucide-react";
import { ErrorToast } from "@/components/ui/toaster";
import { campaignFlyerSchema } from "@/lib/schema/campaign/campaignFlyerSchema";

const CampaignAndFlyersDetails = () => {
  const params = useParams();
  const router = useRouter();
  const flyerId = useMemo(() => params.id, [params]);

  // Formik form state
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
      await handleSaveAndSendAction();
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
    setFieldTouched,
  } = formik;

  const [editorContent, setEditorContent] = useState("");

  // Show glass overlay only when user has entered any data
  const hasAnyData = !!(
    values.eventTitle ||
    values.eventDate ||
    values.eventStartTime ||
    values.eventEndTime ||
    values.address ||
    values.city
  );
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 1,
    image: campaignAndFlyers[0]?.image || "/images/flyerImage.jpg",
  });

  useEffect(() => {
    if (flyerId) {
      const currentCampaign = campaignAndFlyers.find(
        (c) => String(c.id) === String(flyerId),
      );
      if (currentCampaign) {
        setSelectedTemplate({
          id: currentCampaign.id,
          image: currentCampaign.image,
        });
      }
    }
  }, [flyerId]);

  // Modal and generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [designedFile, setDesignedFile] = useState(null);
  const flyerRef = useRef(null);

  const eventTypes = [
    "Birthday Celebration",
    "Ladies Night",
    "Anniversary Celebration",
    "Live DJ / Music Night",
    "Happy Hour",
    "VIP Bottle Service",
    "Seafood Boil / Food Event",
    "Special Event / Holiday",
    "Weekly Event Schedule",
    "Lounge Manager Announcement",
  ];

  // Convert 24h time string ("14:30") to 12h AM/PM format ("2:30 PM")
  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const generateFlyerFile = () => {
    return new Promise(async (resolve, reject) => {
      if (!flyerRef.current) {
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
              const file = new File([blob], "flyer.png", { type: "image/png" });
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
        reject(err);
      }
    });
  };

  const handleSaveAndSendAction = async () => {
    try {
      const file = await generateFlyerFile();
      setDesignedFile(file);
      setOpenInvForm(true);
    } catch (err) {
      console.error("Canvas drawing error:", err);
      ErrorToast("Error generating flyer image. Please try again.");
    }
  };

  const handleSaveAndSend = () => {
    handleSubmit();
    if (!formik.isValid) {
      ErrorToast("Please fill all the required fields.");
    }
  };

  const handleSendSuccess = () => {
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="section-heading mt-4">Campaign and Flyers</h1>
      <div className="mt-10 flex-1 bg-white border rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-5">
            <div>
              <h3 className="section-heading text-2xl font-bold">
                Event Details
              </h3>
              <p className="text-[#333333]">
                Fill in the details below to design your flyer card in
                real-time.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">
                Event Type
              </Label>
              <Select
                value={values.eventType}
                onValueChange={(value) => {
                  setFieldValue("eventType", value);
                  setFieldTouched("eventType", true, false);
                }}
              >
                <SelectTrigger
                  className={`w-full h-14! ${errors.eventType && touched.eventType ? "border-red-500 ring-red-500" : ""}`}
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
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter event title"
                maxLength={100}
                className={`h-12 ${errors.eventTitle && touched.eventTitle ? "border-red-500 ring-red-500" : ""}`}
              />
              {errors.eventTitle && touched.eventTitle && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.eventTitle}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-black">
                  Event Date
                </Label>
                <Input
                  name="eventDate"
                  type={"date"}
                  value={values.eventDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={getTomorrowDateString()}
                  placeholder="Enter event date"
                  className={`h-12 ${errors.eventDate && touched.eventDate ? "border-red-500 ring-red-500" : ""}`}
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter start time"
                  className={`h-12 ${errors.eventStartTime && touched.eventStartTime ? "border-red-500 ring-red-500" : ""}`}
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={values.eventStartTime || undefined}
                  placeholder="Enter end time"
                  className={`h-12 ${errors.eventEndTime && touched.eventEndTime ? "border-red-500 ring-red-500" : ""}`}
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
              <Label className="text-sm font-medium text-black">Address</Label>
              <Input
                name="address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={200}
                placeholder="Enter event address"
                className={`h-12 ${errors.address && touched.address ? "border-red-500 ring-red-500" : ""}`}
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
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter city"
                className={`h-12 ${errors.city && touched.city ? "border-red-500 ring-red-500" : ""}`}
              />
              {errors.city && touched.city && (
                <p className="text-red-600 text-[12px] mt-1">{errors.city}</p>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="min-w-sm w-[400px]">
              <h3 className="section-heading text-2xl font-bold mb-2">
                Card Preview
              </h3>

              {/* Dynamic Overlay Preview */}
              <div className="rounded-2xl border-2 p-8 bg-gray-50 flex justify-center">
                <div ref={flyerRef} className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg select-none">
                  {/* Base template image */}
                  <Image
                    src={selectedTemplate.image}
                    alt="Flyer Preview"
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />

                  {hasAnyData && (
                    <>
                      {/* Darkening gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/75 pointer-events-none" />

                      {/* Glass content panel — centered on image */}
                      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-5 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {/* Gold top accent bar */}
                        <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mb-4" />

                        {/* Event Title */}
                        <h2
                          className="text-white font-bold leading-snug text-center mb-4 tracking-wide break-words drop-shadow-lg w-full"
                          style={{
                            fontSize:
                              values.eventTitle && values.eventTitle.length > 40
                                ? "13px"
                                : "15px",
                          }}
                        >
                          {values.eventTitle || "Event Title"}
                        </h2>

                        {/* Thin divider */}
                        <div className="w-full h-px bg-white/20 mb-4" />

                        {/* Details rows */}
                        <div className="flex flex-col gap-2 w-full">
                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px]">
                              Date:
                            </span>
                            <span className="text-[11px] text-white/90">
                              {values.eventDate
                                ? (() => {
                                  const parts = values.eventDate.split("-");
                                  if (parts.length === 3) {
                                    const [year, month, day] = parts;
                                    return `${month} ${day} ${year}`;
                                  }
                                  const d = new Date(values.eventDate);
                                  return `${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")} ${d.getFullYear()}`;
                                })()
                                : "—"}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px]">
                              Time:
                            </span>
                            <span className="text-[11px] text-white/90">
                              {values.eventStartTime
                                ? `${formatTime12h(values.eventStartTime)}${values.eventEndTime ? ` - ${formatTime12h(values.eventEndTime)}` : ""}`
                                : "—"}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px] shrink-0">
                              Location:
                            </span>
                            <span className="text-[11px] text-white/90 leading-snug break-words">
                              {values.address
                                ? `${values.address}${values.city ? `, ${values.city}` : ""}`
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Gold bottom accent bar */}
                        <div className="w-10 h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#c9a84c] mt-4" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="my-3 font-semibold text-lg">
                  Select Card Template
                </p>

                <TemplateCarousel selectedId={selectedTemplate.id} onSelectTemplate={setSelectedTemplate} />
              </div>
            </div>
          </div>
        </div>
        <RichTextEditor
          // initialContent="<p>Start editing here...</p>"
          onChange={setEditorContent}
        />{" "}
        <Button
          type="button"
          onClick={handleSaveAndSend}
          disabled={isGenerating}
          className={"h-14! w-xl flex items-center justify-center gap-2"}
        >
          {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
          {isGenerating ? "Designing Flyer..." : "Save & Send Invitation"}
        </Button>
      </div>{" "}
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
