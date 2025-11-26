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
import { Plus } from "lucide-react";

const AddLocationModal = ({
  open,
  setOpen,
  onSave = () => console.log("save profile (parent)"),
  handleNext,
}) => {
  const [loungeLogo, setLoungeLogo] = useState("/images/profile.png");
  const [loungeName, setLoungeName] = useState("Mike Smith");
  const [businessEmail, setBusinessEmail] = useState("designer@gmail.com");
  const [businessPhone, setBusinessPhone] = useState("+1 462 849 558");
  const [operatingHours, setOperatingHours] = useState("00:00 - 00:00");
  const [specialization, setSpecialization] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessLocation2, setBusinessLocation2] = useState("");
  const [loungeImages, setLoungeImages] = useState([]);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setLoungeImages(files);
  };

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLoungeLogo(event.target?.result || "/images/profile.png");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    setOpen(false);
    handleNext(true);
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
          <DialogTitle className="text-3xl">Add New Location</DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Image */}
          <div className="flex items-center xl:w-[500px] lg:w-[400px] md:w-[500px] w-[320px]">
            <div className="md:w-[80px] w-[60px] md:h-[80px] h-[60px] rounded-full  overflow-hidden text-black">
              <label
                htmlFor="profilePic"
                className="w-20 h-20 rounded-full border-2 border-dashed border-black flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <Plus className="text-black" />
              </label>
            </div>
            <div className="pl-2 ">
              <p>
                <span className="relative capitalize underline pl-4">
                  Business Logo
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer -left-24"
                  />
                </span>
              </p>
            </div>
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
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
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
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300"
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
                src="/images/mapImg.png"
                alt="Map"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-8 items-start">
          <div>
            <label className="text-[14px] font-[500] text-black block mb-2">
              Upload Images
            </label>
            <div className="w-[180px] h-[100px] rounded-[12px] border-2 border-dashed border-white/30 flex items-center justify-center relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="text-center text-black/70">
                Choose file to upload
              </div>
            </div>
            {loungeImages.length > 0 && (
              <div className="flex gap-2 mt-2">
                {loungeImages.map((f, i) => (
                  <img
                    key={i}
                    src={typeof f === "string" ? f : URL.createObjectURL(f)}
                    alt={`img-${i}`}
                    className="w-16 h-12 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[14px] font-[500] text-black block mb-2">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Describe your business"
              className="w-full h-[100px] rounded-[12px] border-2 border-black/20 bg-white/10 placeholder:text-gray-400 text-[#E6E6F0] p-3"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="text-[14px] font-[500] text-black block mb-2">
            Select Your Role
          </label>
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="lounge_manager"
                // checked={values.role === "lounge_manager"}
                // onChange={(e) => setFieldValue("role", e.target.value)}
              />
              <span className="text-gray-700">Lounge Manager</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="promoter"
                // checked={values.role === "promoter"}
                // onChange={(e) => setFieldValue("role", e.target.value)}
              />
              <span className="text-gray-700">Promoter</span>
            </label>
          </div>
        </div>

        <DialogFooter className="mt-8">
          <div className="w-full flex justify-center">
            <Button onClick={handleSave} className="w-full max-w-xs">
              Next
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationModal;
