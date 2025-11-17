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

const CampaignAndFlyersDetails = () => {
  const params = useParams();
  const flyerId = useMemo(() => params.id, [params]);

  const [editorContent, setEditorContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 1,
    image: "/images/flyer.png",
  });

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

  const handleSubmit = () => {
    console.log(editorContent);
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
                Select text on the invitation to customize the font, size, and
                color.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">
                Event Type
              </Label>
              <Select>
                <SelectTrigger className={"w-full h-14!"}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className={"h-[200px]"}>
                  <SelectGroup>
                    <SelectLabel>Event Types</SelectLabel>
                    {eventTypes.map((eventType, index) => (
                      <SelectItem value={eventType} key={index}>
                        {eventType}
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
                  placeholder="Enter event title"
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
                  placeholder="Enter event title"
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
                  placeholder="Enter event title"
                  className="h-12"
                />
              </div>
            </div>
            <h3 className="section-heading text-2xl font-bold">Location</h3>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">Address</Label>
              <Input
                name="address"
                placeholder="Enter event title"
                className="h-12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-black">City</Label>
              <Input
                name="city"
                placeholder="Enter event title"
                className="h-12"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="min-w-sm w-[500px]">
              <h3 className="section-heading text-2xl font-bold mb-2">
                Card Preview
              </h3>

              <div className="rounded-2xl border-2 p-8">
                <Image
                  src={selectedTemplate.image}
                  alt="Flyer Preview"
                  width={300}
                  height={400}
                  className="w-full h-auto"
                />
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
      </div>{" "}
    </div>
  );
};

export default CampaignAndFlyersDetails;
