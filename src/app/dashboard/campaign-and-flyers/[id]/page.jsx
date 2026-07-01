"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
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

const CampaignAndFlyersDetails = () => {
  const params = useParams();
  const flyerId = useMemo(() => params.id, [params]);

  // Form states
  const [eventType, setEventType] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [editorContent, setEditorContent] = useState("");

  // Show glass overlay only when user has entered any data
  const hasAnyData = !!(eventTitle || eventDate || eventStartTime || eventEndTime || address || city);
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 1,
    image: "/images/flyer.png",
  });

  // Modal and generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [designedFile, setDesignedFile] = useState(null);

  const eventTypes = [
    "Concert",
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Charity Gala",
    "Festival",
    "Product Launch",
    "Sports Event",
    "Networking Meetup",
    "Conference",
    "Workshop",
    "Exhibition",
    "Fundraiser",
    "Award Ceremony",
    "Community Fair",
  ];

  const generateFlyerFile = () => {
    return new Promise((resolve, reject) => {
      setIsGenerating(true);
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = selectedTemplate.image;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 1000;
          const ctx = canvas.getContext("2d");

          // 1. Draw template background
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Calculate overlay box parameters (centered, 85% width, 75% height)
          const boxW = canvas.width * 0.85;
          const boxH = canvas.height * 0.75;
          const boxX = (canvas.width - boxW) / 2;
          const boxY = (canvas.height - boxH) / 2;

          // 2. Draw card overlay border and glowing shadow
          ctx.save();
          ctx.shadowColor = "rgba(251, 191, 36, 0.45)"; // Gold shadow glow
          ctx.shadowBlur = 35;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Fill translucent dark background
          ctx.fillStyle = "rgba(10, 8, 5, 0.85)";
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 30);
          ctx.fill();

          // Stroke border with gold color
          ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
          ctx.lineWidth = 4;
          ctx.shadowBlur = 0; // disable shadow for stroke to keep it clean
          ctx.stroke();
          ctx.restore();

          // Configure text rendering styles
          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // 3. Draw Event Title / Main Description text
          // Centered vertically within the upper part of the card
          const titleText = eventTitle || "Showcase weekly events including brunches, karaoke, DJs, ladies nights, etc.";
          ctx.font = "italic 36px Georgia, serif"; // Serif-style font matching the user's picture
          
          // Wrapping words helper
          const words = titleText.split(" ");
          let lines = [];
          let currentLine = "";
          const maxWidth = boxW - 80;
          
          for (let i = 0; i < words.length; i++) {
            let testLine = currentLine + words[i] + " ";
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
              lines.push(currentLine.trim());
              currentLine = words[i] + " ";
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine.trim());

          const lineHeight = 50;
          let yStart = boxY + (boxH * 0.35) - ((lines.length - 1) * lineHeight) / 2;
          
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, yStart + index * lineHeight);
          });

          // 4. Draw Event Details (Date, Time, Location) Left Aligned as a Block
          // Positioned at the bottom of the card
          ctx.textAlign = "left";
          ctx.font = "24px system-ui, -apple-system, sans-serif";
          
          // Format date like '30-6-2026'
          let dateStr = "00-2-2026";
          if (eventDate) {
            const dateObj = new Date(eventDate);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();
            dateStr = `${day}-${month}-${year}`;
          }

          let timeStr = "00:00 am";
          if (eventStartTime) {
            timeStr = eventStartTime;
            if (eventEndTime) {
              timeStr += ` - ${eventEndTime}`;
            }
          }

          const locationStr = address
            ? `${address}${city ? `, ${city}` : ""}`
            : "My house";

          // Calculate details alignment starting X (centered block)
          // We find a reasonable offset from the center
          const detailsX = canvas.width / 2 - 130;
          
          const yDate = boxY + boxH - 120;
          const yTime = boxY + boxH - 85;
          const yLoc = boxY + boxH - 50;

          // Draw Details labels and values
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Label color
          ctx.fillText("Date:", detailsX, yDate);
          ctx.fillText("Time:", detailsX, yTime);
          ctx.fillText("Location:", detailsX, yLoc);

          // Draw values next to labels
          ctx.fillStyle = "#FFFFFF"; // Value color
          ctx.fillText(dateStr, detailsX + 70, yDate);
          ctx.fillText(timeStr, detailsX + 70, yTime);
          ctx.fillText(locationStr, detailsX + 110, yLoc);

          canvas.toBlob((blob) => {
            setIsGenerating(false);
            if (blob) {
              const file = new File([blob], "flyer.png", { type: "image/png" });
              resolve(file);
            } else {
              reject(new Error("Canvas blob generation failed"));
            }
          }, "image/png");
        } catch (err) {
          setIsGenerating(false);
          reject(err);
        }
      };

      img.onerror = (err) => {
        setIsGenerating(false);
        reject(err);
      };
    });
  };

  const handleSaveAndSend = async () => {
    if (!eventTitle) {
      ErrorToast("Please enter an event title.");
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

  const handleSendSuccess = () => {
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="section-heading">Campaign and Flyers</h1>
      <div className="mt-10 flex-1 bg-white border rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-5">
            <div>
              <h3 className="section-heading text-2xl font-bold">
                Event Details
              </h3>
              <p className="text-[#333333]">
                Fill in the details below to design your flyer card in real-time.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">
                Event Type
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className={"w-full h-14!"}>
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
              </Select>{" "}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">
                Event Title
              </Label>
              <Input
                name="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Enter event title"
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-black">
                  Event Date
                </Label>
                <Input
                  name="eventDate"
                  type={"date"}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="Enter event date"
                  className="h-12"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-black">
                  Start Time
                </Label>
                <Input
                  name="eventStartTime"
                  type={"time"}
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  placeholder="Enter start time"
                  className="h-12"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-black">
                  End Time
                </Label>
                <Input
                  name="eventEndTime"
                  type={"time"}
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  placeholder="Enter end time"
                  className="h-12"
                />
              </div>
            </div>
            <h3 className="section-heading text-2xl font-bold">Location</h3>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">Address</Label>
              <Input
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter event address"
                className="h-12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">City</Label>
              <Input
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="h-12"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="min-w-sm w-[400px]">
              <h3 className="section-heading text-2xl font-bold mb-2">
                Card Preview
              </h3>

              {/* Dynamic Overlay Preview */}
              <div className="rounded-2xl border-2 p-8 bg-gray-50 flex justify-center">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg select-none">
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
                          style={{ fontSize: eventTitle && eventTitle.length > 40 ? "13px" : "15px" }}
                        >
                          {eventTitle ||
                            "Event Title"}
                        </h2>

                        {/* Thin divider */}
                        <div className="w-full h-px bg-white/20 mb-4" />

                        {/* Details rows */}
                        <div className="flex flex-col gap-2 w-full">
                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px]">Date:</span>
                            <span className="text-[11px] text-white/90">
                              {eventDate
                                ? (() => {
                                    const d = new Date(eventDate);
                                    return `${String(d.getDate()).padStart(2, "0")}-${d.getMonth() + 1}-${d.getFullYear()}`;
                                  })()
                                : "—"}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px]">Time:</span>
                            <span className="text-[11px] text-white/90">
                              {eventStartTime
                                ? `${eventStartTime}${eventEndTime ? ` - ${eventEndTime}` : ""}`
                                : "—"}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start gap-2">
                            <span className="text-[11px] text-white/60 font-semibold min-w-[56px] shrink-0">Location:</span>
                            <span className="text-[11px] text-white/90 leading-snug break-words">
                              {address ? `${address}${city ? `, ${city}` : ""}` : "—"}
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

                <TemplateCarousel onSelectTemplate={setSelectedTemplate} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="section-heading text-2xl font-bold">
            Additional Information
          </h3>

          <p className="text-[#333333]">
            Provide additional details about your event. The message will appear
            next to your invitation.
          </p>
        </div>
        <RichTextEditor
          initialContent="<p>Start editing here...</p>"
          onChange={setEditorContent}
        />{" "}
        <Button
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
      <ConfirmPopup isOpen={confirmPopup} onOpenChange={setConfirmPopup} />
    </div>
  );
};

export default CampaignAndFlyersDetails;

