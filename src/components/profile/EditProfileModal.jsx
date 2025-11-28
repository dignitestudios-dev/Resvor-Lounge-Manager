"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EditProfileModal = ({
  open,
  setOpen,
  onSave = () => console.log("save profile (parent)"),
}) => {
  const [loungeImage, setLoungeImage] = useState("/images/lounge.jfif");
  const [loungeName, setLoungeName] = useState("Mike Smith");
  const [businessEmail, setBusinessEmail] = useState("designer@gmail.com");
  const [businessPhone, setBusinessPhone] = useState("+1 462 849 558");
  const [operatingHours, setOperatingHours] = useState("00:00 - 00:00");
  const [specialization, setSpecialization] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessLocation2, setBusinessLocation2] = useState("");

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLoungeImage(event.target?.result || "/images/profile.png");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    if (onSave) {
      onSave({
        loungeName,
        operatingHours,
        specialization,
        businessLocation,
        businessLocation2,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-4xl max-w-full">
        <DialogHeader>
          <DialogTitle className="text-3xl">Edit Lounge Profile</DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Image */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={loungeImage}
                alt="Lounge"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="image-upload"
              className="absolute h-8 flex justify-center items-center w-8 bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border border-gray-300 hover:bg-gray-50"
            >
              <span className="text-xl">+</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Lounge Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lounge Name
              </label>
              <input
                type="text"
                value={loungeName}
                onChange={(e) => setLoungeName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="Lounge Name"
              />
            </div>

            {/* Business Email (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={businessEmail}
                readOnly
                disabled
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Business Phone (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone Number
              </label>
              <input
                type="tel"
                value={businessPhone}
                readOnly
                disabled
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="00:00 - 00:00"
              />
            </div>

            {/* Highlight Specialization */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="Enter your Specialization"
              />
            </div>

            {/* Business Location */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Location
              </label>
              <input
                type="text"
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="Enter your Specialization"
              />
            </div>
          </div>

          {/* Map Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Location
            </label>
            <div className="w-full h-40 rounded-md overflow-hidden border border-gray-300">
              <Image
                src="/images/lounge.jfif"
                alt="Map"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8">
          <div className="w-full flex justify-center">
            <Button onClick={handleSave} className="w-full max-w-xs">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
