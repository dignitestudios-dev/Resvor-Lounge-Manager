"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import { editProfileSchema } from "@/lib/schema/profile/editProfileSchema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TimeRangeInput from "../auth/TimeRangeInput";
import { Loader2 } from "lucide-react";

const convert12hTo24h = (time12h) => {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") {
    hours = "00";
  }
  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const convert24hTo12h = (time24h) => {
  if (!time24h) return "";
  let [hours, minutes] = time24h.split(":");
  hours = parseInt(hours, 10);
  const modifier = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${modifier}`;
};

const EditProfileModal = ({
  open,
  setOpen,
  lounge,
  isLoading,
  onSave = () => console.log("save profile (parent)"),
}) => {
  const [loungeImage, setLoungeImage] = useState(lounge?.logo?.location || "/images/lounge.jfif");
  const [businessEmail, setBusinessEmail] = useState(lounge?.businessEmail || "");
  const [businessPhone, setBusinessPhone] = useState(lounge?.businessPhone || "");

  const formik = useFormik({
    initialValues: {
      loungeName: lounge?.name || "",
      openingTime: lounge?.operatingHours?.open ? convert12hTo24h(lounge.operatingHours.open) : "",
      closingTime: lounge?.operatingHours?.close ? convert12hTo24h(lounge.operatingHours.close) : "",
      specialization: lounge?.specialization || "",
      businessLocation: lounge?.location?.address || "",
      businessLocation2: "",
      logoFile: null,
    },
    validationSchema: editProfileSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      const open12h = convert24hTo12h(values.openingTime);
      const close12h = convert24hTo12h(values.closingTime);
      const formattedHours = open12h && close12h ? `${open12h} - ${close12h}` : "";

      onSave({
        loungeName: values.loungeName,
        operatingHours: formattedHours,
        specialization: values.specialization,
        businessLocation: values.businessLocation,
        businessLocation2: values.businessLocation2,
        logoFile: values.logoFile,
      });
    },
  });

  const { values, handleBlur, handleChange, handleSubmit, errors, touched, setFieldValue, setFieldTouched } = formik;

  React.useEffect(() => {
    if (lounge && open) {
      formik.setValues({
        loungeName: lounge.name || "",
        openingTime: lounge.operatingHours?.open ? convert12hTo24h(lounge.operatingHours.open) : "",
        closingTime: lounge.operatingHours?.close ? convert12hTo24h(lounge.operatingHours.close) : "",
        specialization: lounge.specialization || "",
        businessLocation: lounge.location?.address || "",
        businessLocation2: "",
        logoFile: null,
      });
      setLoungeImage(lounge.logo?.location || "/images/lounge.jfif");
      setBusinessEmail(lounge.businessEmail || "");
      setBusinessPhone(lounge.businessPhone || "");
    }
  }, [lounge, open]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("logoFile", file);
      setFieldTouched("logoFile", true, false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLoungeImage(event.target?.result || "/images/profile.png");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    handleSubmit();
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
            {touched.logoFile && errors.logoFile && (
              <p className="text-red-600 text-xs mt-1">
                {errors.logoFile}
              </p>
            )}
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
                name="loungeName"
                value={values.loungeName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 rounded-md border ${errors.loungeName && touched.loungeName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}`}
                placeholder="Lounge Name"
              />
              {errors.loungeName && touched.loungeName && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.loungeName}
                </p>
              )}
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
                className="w-full px-3 py-3  rounded-md border border-gray-300 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Operating Hours */}
            <div>
              <TimeRangeInput
                label="Operating Hours"
                startName="openingTime"
                endName="closingTime"
                startValue={values.openingTime}
                endValue={values.closingTime}
                onChange={(e) => {
                  handleChange(e);
                  setFieldTouched(e.target.name, true, false);
                }}
                onBlur={handleBlur}
                error={errors.openingTime || errors.closingTime}
                touched={touched.openingTime || touched.closingTime}
                variant="light"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={values.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 rounded-md border ${errors.specialization && touched.specialization ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}`}
                placeholder="Enter your Specialization"
              />
              {errors.specialization && touched.specialization && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Location
              </label>
              <input
                type="text"
                name="businessLocation"
                value={values.businessLocation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 rounded-md border ${errors.businessLocation && touched.businessLocation ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}`}
                placeholder="Enter your Business Location"
              />
              {errors.businessLocation && touched.businessLocation && (
                <p className="text-red-600 text-[12px] mt-1">
                  {errors.businessLocation}
                </p>
              )}
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
            <Button onClick={handleSave} disabled={isLoading} className="w-full max-w-xs flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
