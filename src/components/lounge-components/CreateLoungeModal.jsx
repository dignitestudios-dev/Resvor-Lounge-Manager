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
import { Plus, Upload, ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query";

import AddServicesAndPackages from "./../onBoarding/Servicespackages";
import AuthInput from "./../auth/AuthInput";
import PhoneInput from "./../auth/PhoneInput";
import TimeRangeInput from "../auth/TimeRangeInput";
import LoungeTags from "./../onBoarding/LoungeTags";
import { ErrorToast } from "../ui/toaster";
import { useCreateLounge } from "@/lib/hooks/mutations/OnBoardingMutations";
import {
  phoneFormatter,
  updateAuthCache,
  validateImageResolution,
} from "@/lib/utils";

import { personalDetailsSchema } from "@/lib/schema/onboarding/personalDetailsSchema";
import { personalDetailsRemainingSchema } from "@/lib/schema/onboarding/personalDetailsRemainingSchema";
import { floorPlanSetupSchema } from "@/lib/schema/onboarding/floorPlanSetupSchema";

import { personalDetailsValues } from "@/lib/init/personalDetailsValues";
import { personalDetailsRemainingValues } from "@/lib/init/personalDetailsRemainingValues";
import { floorPlanSetupValues } from "@/lib/init/floorPlanSetupValues";

const TOTAL_STEPS = 3;

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-2 mb-4">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
      const step = i + 1;
      const active = step === currentStep;
      const done = step < currentStep;
      return (
        <div
          key={step}
          className={`h-2 rounded-full transition-all ${active
            ? "w-8 bg-black"
            : done
              ? "w-8 bg-black/50"
              : "w-8 bg-gray-200"
            }`}
        />
      );
    })}
  </div>
);

const AddLocationModal = ({ open, setOpen, handleNext = () => { } }) => {
  const [step, setStep] = useState(1);
  const [combinedData, setCombinedData] = useState({});
  const [imageError, setImageError] = useState("");

  const queryClient = useQueryClient();
  const createLoungeMutation = useCreateLounge();

  // ── Step 1: Personal / Business details ─────────────────────────────────
  const step1Formik = useFormik({
    initialValues: personalDetailsValues,
    validationSchema: personalDetailsSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setCombinedData((prev) => ({ ...prev, ...values, operatingHours }));
        setStep(2);
      } catch (error) {
        if (error.code === "NO_INTERNET") {
          ErrorToast(error.message);
        } else {
          ErrorToast(
            error.response?.data?.message ||
            "An error occurred. Please try again.",
          );
        }
      }
    },
  });

  const {
    values: v1,
    handleBlur: handleBlur1,
    handleChange: handleChange1,
    handleSubmit: handleSubmit1,
    errors: errors1,
    touched: touched1,
    setFieldValue: setFieldValue1,
  } = step1Formik;

  const handleFileChange = async (e) => {
    const file = e.currentTarget.files?.[0];
    setImageError("");

    if (file) {
      // Check file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        const errorMsg = "Only JPEG and PNG formats are allowed";
        setImageError(errorMsg);
        ErrorToast(errorMsg);
        return;
      }

      // Check file size (10MB)
      if (file.size > 11 * 1024 * 1024) {
        const errorMsg = "File size must not exceed 10MB";
        setImageError(errorMsg);
        ErrorToast(errorMsg);
        return;
      }

      // Check image resolution (215x215)
      const isValidResolution = await validateImageResolution(file);
      if (!isValidResolution) {
        const errorMsg = "Image resolution must be at least 215x215";
        setImageError(errorMsg);
        ErrorToast(errorMsg);
        return;
      }

      setFieldValue1("userImage", file);
    }
  };

  const formatTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const operatingHours =
    v1.openingTime && v1.closingTime
      ? `${formatTo12Hour(v1.openingTime)} - ${formatTo12Hour(v1.closingTime)}`
      : "";

  // ── Step 2: Remaining personal/lounge details ────────────────────────────
  const step2Formik = useFormik({
    initialValues: personalDetailsRemainingValues(combinedData),
    validationSchema: personalDetailsRemainingSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setCombinedData((prev) => ({ ...prev, ...values }));
        setStep(3);
      } catch (error) {
        if (error.code === "NO_INTERNET") {
          ErrorToast(error.message);
        } else {
          ErrorToast(
            error.response?.data?.message ||
            "An error occurred. Please try again.",
          );
        }
      }
    },
  });

  const {
    values: v2,
    handleBlur: handleBlur2,
    handleChange: handleChange2,
    handleSubmit: handleSubmit2,
    errors: errors2,
    touched: touched2,
    setFieldValue: setFieldValue2,
  } = step2Formik;

  const handleMultipleImagesChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const existingImages = v2.images || [];

    // Max 5 images validation
    if (existingImages.length + selectedFiles.length > 5) {
      ErrorToast("Maximum 5 images are allowed");
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      // File type validation
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        ErrorToast(`${file.name}: Only JPEG and PNG formats are allowed`);
        continue;
      }

      // File size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        ErrorToast(`${file.name}: File size must not exceed 10MB`);
        continue;
      }

      // Resolution validation
      const isValidResolution = await validateImageResolution(file);

      if (!isValidResolution) {
        ErrorToast(`${file.name}: Image resolution must be at least 215x215`);
        continue;
      }

      validFiles.push(file);
    }

    // Merge previous + new images
    setFieldValue2("images", [...existingImages, ...validFiles]);

    // Reset input value so same image can be selected again
    e.target.value = "";
  };

  // ── Step 3: Floor plan setup ─────────────────────────────────────────────
  const step3Formik = useFormik({
    initialValues: floorPlanSetupValues(combinedData),
    validationSchema: floorPlanSetupSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const finalValues = { ...combinedData, ...values };

        // Submit combined data to API
        const response = await createLoungeMutation.mutateAsync(finalValues);

        queryClient.invalidateQueries(["lounges"]);

        setOpen(false);
        handleNext(finalValues);
        // Reset to step 1 for next time the modal opens
        setStep(1);
      } catch (error) {
        console.log("error==> 44", error);
        if (error.code === "NO_INTERNET") {
          ErrorToast(error.message);
        } else {
          ErrorToast(
            error.response?.data?.message ||
            "An error occurred. Please try again.",
          );
        }
      }
    },
  });

  const {
    values: v3,
    handleBlur: handleBlur3,
    handleSubmit: handleSubmit3,
    errors: errors3,
    touched: touched3,
    setFieldValue: setFieldValue3,
  } = step3Formik;

  const handleTablesChange = (e) => {
    const { name, value } = e.target;
    // Keep digits only
    let sanitizedValue = value.replace(/\D/g, "");
    // Restrict max value
    if (Number(sanitizedValue) > 999) {
      sanitizedValue = "999";
    }
    setFieldValue3(name, sanitizedValue);
  };

  const handleFloorPlanChange = async (e) => {
    const file = e.currentTarget.files?.[0];

    if (file) {
      // JPEG/PNG validation
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        ErrorToast("Only JPEG and PNG formats are allowed");
        return;
      }

      // 10MB validation
      if (file.size > 10 * 1024 * 1024) {
        ErrorToast("File size must not exceed 10MB");
        return;
      }

      // Resolution validation
      const isValidResolution = await validateImageResolution(file);

      if (!isValidResolution) {
        ErrorToast("Image resolution must be at least 215x215");
        return;
      }

      setFieldValue3("floorPlan", file);

      // Reset input
      e.target.value = "";
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-4xl max-w-full">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <DialogTitle className="text-3xl">Add New Lounge</DialogTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Step {step} of {TOTAL_STEPS}
          </p>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        {/* ── STEP 1: Personal / Business Details ─────────────────────────── */}
        {step === 1 && (
          <div className="mt-6">
            <form onSubmit={handleSubmit1}>
              <div className="space-y-6">
                {/* Business Logo */}

                <div>
                  <div className="flex  items-center gap-2">


                    {/* Circular upload area */}
                    <label className="relative md:w-[100px] md:h-[100px] w-[80px] h-[80px] rounded-full cursor-pointer group">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                      />

                      {v1.userImage ? (
                        /* Show uploaded image */
                        <>
                          <img
                            src={
                              typeof v1.userImage === "string"
                                ? v1.userImage
                                : URL.createObjectURL(v1.userImage)
                            }
                            alt="business logo"
                            className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        /* Empty state — dashed circle with + */
                        <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 bg-gray-50 group-hover:border-gray-400 group-hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-1">
                          <svg className="w-7 h-7 text-gray-400 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label className="text-[14px] font-[500] text-black">
                      Business Logo
                    </label>


                  </div>
                  {/* Errors */}
                  {imageError && (
                    <p className="text-red-600 text-xs">{imageError}</p>
                  )}
                  {touched1.userImage && errors1.userImage && (
                    <p className="text-red-600 text-xs">{errors1.userImage}</p>
                  )}
                </div>


                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <AuthInput
                      variant="light"
                      label="Lounge Name"
                      placeholder="Enter your lounge name"
                      type="text"
                      name="name"
                      value={v1.name}
                      onChange={handleChange1}
                      onBlur={handleBlur1}
                      error={errors1?.name}
                      touched={touched1?.name}
                    />
                  </div>
                  <div className="w-full">
                    <AuthInput
                      variant="light"
                      label={"Business Email"}
                      text={"email"}
                      placeholder={"Enter your email address"}
                      type={"email"}
                      id={"email"}
                      name={"email"}
                      maxLength={60}
                      value={v1.email}
                      onChange={handleChange1}
                      onBlur={handleBlur1}
                      error={errors1?.email}
                      touched={touched1?.email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <PhoneInput
                      variant="light"
                      label={"Business Phone Number"}
                      id={"phone"}
                      name={"phone"}
                      value={phoneFormatter(v1.phone)}
                      onChange={handleChange1}
                      onBlur={handleBlur1}
                      error={errors1?.phone}
                      touched={touched1?.phone}
                    />
                  </div>
                  <div className="w-full">
                    <TimeRangeInput
                      variant="light"
                      label="Operating Hours"
                      startName="openingTime"
                      endName="closingTime"
                      startValue={v1.openingTime}
                      endValue={v1.closingTime}
                      onChange={handleChange1}
                      onBlur={handleBlur1}
                      error={errors1.openingTime || errors1.closingTime}
                      touched={touched1.openingTime || touched1.closingTime}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="w-full">
                    <AuthInput
                      variant="light"
                      label={"Highlight Offers"}
                      text={"offers"}
                      placeholder={"Enter your Offers"}
                      type={"text"}
                      id={"offers"}
                      name={"offers"}
                      maxLength={250}
                      value={v1.offers}
                      onChange={handleChange1}
                      onBlur={handleBlur1}
                      error={errors1?.offers}
                      touched={touched1?.offers}
                    />
                  </div>
                </div>

                <div>
                  <LoungeTags
                    variant="light"
                    label="Lounge Tags"
                    value={v1.loungeTags}
                    onChange={(tags) => setFieldValue1("loungeTags", tags)}
                    placeholder="Type tag and press Enter..."
                    error={errors1?.loungeTags}
                    touched={touched1?.loungeTags}
                  />
                </div>

                <div>
                  <AuthInput
                    variant="light"
                    label={"Business Location"}
                    text={"location"}
                    placeholder={"Enter your Location"}
                    type={"text"}
                    id={"location"}
                    name={"location"}
                    maxLength={100}
                    value={v1.location}
                    onChange={handleChange1}
                    onBlur={handleBlur1}
                    error={errors1?.location}
                    touched={touched1?.location}
                  />
                </div>

                <div>
                  <img
                    src={"/images/mapImg.png"}
                    alt="map"
                    className="mt-1 rounded-xl w-full h-40 object-cover"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-[500] text-black block mb-2">
                    Select Your Role
                  </label>
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="lounge_manager"
                        checked={v1.role === "lounge_manager"}
                        onChange={(e) => setFieldValue1("role", e.target.value)}
                      />
                      <span className="text-gray-700">Lounge Manager</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="promoter"
                        checked={v1.role === "promoter"}
                        onChange={(e) => setFieldValue1("role", e.target.value)}
                      />
                      <span className="text-gray-700">Promoter</span>
                    </label>
                  </div>
                  {touched1.role && errors1.role && (
                    <p className="text-red-600 text-xs mt-1">{errors1.role}</p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-8">
                <div className="w-full flex justify-center">
                  <Button type="submit" className="w-full max-w-xs">
                    Next
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        )}

        {/* ── STEP 2: Specialization, Services, Images, Description ───────── */}
        {step === 2 && (
          <div className="mt-6">
            <form onSubmit={handleSubmit2}>
              <div className="space-y-6">
                <div>
                  <label className="text-[14px] font-medium text-black block mb-1">
                    Lounge Specialization
                  </label>
                  <textarea
                    name="specialization"
                    id="specialization"
                    value={v2.specialization}
                    onChange={handleChange2}
                    onBlur={handleBlur2}
                    placeholder="Enter Lounge Specialization"
                    className="w-full h-20 rounded-[12px] border-2 border-gray-300 bg-white/10 placeholder:text-gray-400 text-black p-3"
                  />
                  {touched2.specialization && errors2.specialization && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors2.specialization}
                    </p>
                  )}
                </div>

                <AddServicesAndPackages
                  variant="light"
                  services={v2.services}
                  onChange={(updatedServices) =>
                    setFieldValue2("services", updatedServices)
                  }
                  errors={errors2}
                  touched={touched2}
                />

                <div>
                  <label className="text-[14px] font-medium text-black block mb-1">
                    Upload Lounge Images
                  </label>
                  <div className="w-full h-[70px] rounded-[12px] border-2 border-dashed border-gray-300 bg-white/10 flex items-center justify-center relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handleMultipleImagesChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center text-black/70 flex flex-col items-center gap-2">
                      <Upload />
                      <p>choose file to upload</p>
                    </div>
                  </div>
                  {v2.images && v2.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {v2.images.map((f, i) => (
                        <div key={i} className="relative">
                          <img
                            src={
                              typeof f === "string" ? f : URL.createObjectURL(f)
                            }
                            alt={`img-${i}`}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = v2.images.filter(
                                (_, index) => index !== i,
                              );
                              setFieldValue2("images", updatedImages);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {touched2.images && errors2.images && (
                    <p className="text-red-600 text-xs mt-1.5">
                      {errors2.images}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[14px] font-medium text-black block mb-1">
                    Lounge Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={v2.description}
                    onChange={handleChange2}
                    onBlur={handleBlur2}
                    placeholder="Describe your business"
                    className="w-full h-20 rounded-[12px] border-2 border-gray-300 bg-white/10 placeholder:text-gray-400 text-black p-3"
                  />
                  {touched2.description && errors2.description && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors2.description}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-8">
                <div className="w-full flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="w-full max-w-xs"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="w-full max-w-xs">
                    Next
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        )}

        {/* ── STEP 3: Floor Plan, Tables ────────────────────────────────────── */}
        {step === 3 && (
          <div className="mt-6">
            <form onSubmit={handleSubmit3}>
              <div className="space-y-6">
                {/* Floor Plan Upload */}
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-black block">
                    Upload Floor Plan
                  </label>

                  <div className="relative w-full h-[220px] rounded-[20px] overflow-hidden border-2 border-dashed border-gray-300 bg-white/10">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFloorPlanChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />

                    {v3.floorPlan ? (
                      <>
                        <img
                          src={
                            typeof v3.floorPlan === "string"
                              ? v3.floorPlan
                              : URL.createObjectURL(v3.floorPlan)
                          }
                          alt="Floor Plan Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center text-white z-10">
                          <div className="text-2xl mb-2">+</div>
                          <p className="underline text-sm">
                            Click to change floor plan
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-black/70">
                        <div className="text-2xl mb-2">+</div>
                        <p className="underline">Upload Floor Plan</p>
                      </div>
                    )}
                  </div>

                  {touched3.floorPlan && errors3.floorPlan && (
                    <p className="text-red-600 text-xs">{errors3.floorPlan}</p>
                  )}
                </div>

                {/* Regular Tables */}
                <div>
                  <AuthInput
                    variant="light"
                    label={"Regular Tables"}
                    text={"regularTables"}
                    placeholder={"Enter number of tables"}
                    type={"text"}
                    id={"regularTables"}
                    name={"regularTables"}
                    value={v3.regularTables}
                    onChange={handleTablesChange}
                    onBlur={handleBlur3}
                    error={errors3?.regularTables}
                    touched={touched3?.regularTables}
                    maxLength={3}
                  />
                </div>

                {/* VIP Tables */}
                <div>
                  <AuthInput
                    variant="light"
                    label={"VIP Tables"}
                    text={"vipTables"}
                    placeholder={"Enter number of VIP tables"}
                    type={"text"}
                    id={"vipTables"}
                    name={"vipTables"}
                    value={v3.vipTables}
                    onChange={handleTablesChange}
                    onBlur={handleBlur3}
                    error={errors3?.vipTables}
                    touched={touched3?.vipTables}
                    maxLength={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <div className="w-full flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="w-full max-w-xs"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-full max-w-xs"
                    disabled={createLoungeMutation.isPending}
                  >
                    {createLoungeMutation.isPending
                      ? "Submitting..."
                      : "Submit"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationModal;
