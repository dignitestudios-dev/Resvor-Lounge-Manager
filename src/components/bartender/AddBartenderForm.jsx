"use client";
import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import AccountCreationPopup from "./AccountCreationPopup";
import EmailSentPopUp from "./EmailSentPopUp";
import ProfileUpdateModal from "./ProfileUpdateModal";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import Edit2 from "../icons/Edit2";
import { ErrorToast } from "@/components/ui/toaster";
import {
  useCreateBartender,
  useUpdateBartender,
} from "@/lib/hooks/mutations/BartenderMutations";
import {
  createBartenderSchema,
  editBartenderSchema,
} from "@/lib/schema/bartender/bartenderSchema";
import { useFormik } from "formik";
import { useState } from "react";
import { phoneFormatter, phoneToE164 } from "@/lib/utils";
import PhoneInput from "../auth/PhoneInput";

const stripCountryCode = (phone) => {
  if (!phone) return "";
  if (phone.startsWith("+1")) {
    return phone.slice(2).replace(/\D/g, "");
  }
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return cleaned.slice(1);
  }
  return cleaned;
};


// ─── Helper: inline error message ────────────────────────────────────────────
const FieldError = ({ touched, error }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────
const AddBartenderForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  showTrigger = true,
}) => {
  const fileInputRef = useRef(null);

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Holds form values temporarily until "Send Mail" is clicked
  const [pendingCreateData, setPendingCreateData] = useState(null);

  // Modal triggers
  const [emailPopup, setEmailPopup] = useState(false);
  const [accountPopup, setAccountPopup] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);

  const { mutate: createBartender, isPending: isCreating } = useCreateBartender();
  const { mutate: updateBartender, isPending: isUpdating } = useUpdateBartender();
  const isPending = isUpdating; // isCreating handled separately in AccountCreationPopup

  // ── Formik ──────────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: isEdit
      ? {
        profileImage: null,
        fullName: data?.fullName || "",
        email: data?.email || "",
        phoneNumber: stripCountryCode(data?.phoneNumber) || "",
        address: data?.address || "",
      }
      : {
        profileImage: null,
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: "",
      },
    validationSchema: isEdit ? editBartenderSchema : createBartenderSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values) => {
      if (isEdit) {
        // ── Update ──────────────────────────────────────────────────────────
        if (!data?._id) {
          ErrorToast("Bartender ID missing.");
          return;
        }
        updateBartender(
          {
            id: data._id,
            fullName: values.fullName,
            email: values.email,
            phoneNumber: phoneToE164(values.phoneNumber),
            address: values.address,
            profileImage: values.profileImage,
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              setUpdateProfile(true);
            },
            onError: (error) => {
              ErrorToast(
                error?.response?.data?.message || "Failed to update bartender."
              );
            },
          }
        );
      } else {
        // ── Create: store data and open confirmation popup first ─────────────
        setPendingCreateData(values);
        onOpenChange(false);
        setAccountPopup(true);
      }
    },
  });

  // Reset form + preview when dialog closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setProfileImagePreview(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Populate image preview when editing
  useEffect(() => {
    if (isEdit && data?.profileImage) {
      // profileImage is an object from API: { location: "url", ... }
      const url =
        typeof data.profileImage === "string"
          ? data.profileImage
          : data.profileImage?.location;
      setProfileImagePreview(url || null);
    }
  }, [isEdit, data, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("profileImage", file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Called when user clicks "Send Mail to Bartender" in AccountCreationPopup
  const handleSendMail = () => {
    if (!pendingCreateData) return;
    createBartender(
      {
        fullName: pendingCreateData.fullName,
        email: pendingCreateData.email,
        password: pendingCreateData.password,
        phoneNumber: phoneToE164(pendingCreateData.phoneNumber),
        address: pendingCreateData.address,
        profileImage: pendingCreateData.profileImage,
      },
      {
        onSuccess: () => {
          setAccountPopup(false);
          setPendingCreateData(null);
          setEmailPopup(true);
        },
        onError: (error) => {
          ErrorToast(
            error?.response?.data?.message || "Failed to create bartender."
          );
        },
      }
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger>
            {isEdit ? (
              <Button className={"w-14 h-14"}>
                <Edit2 className="scale-150 cursor-pointer" />
              </Button>
            ) : (
              <Button className={" border-2 h-12 text-[14px] px-6"}>
                Add New Worker
              </Button>
            )}
          </DialogTrigger>
        )}

        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"text-3xl font-bold"}>
              {isEdit ? "Update Worker" : "Add New Worker"}
            </DialogTitle>

            <DialogDescription>
              <form
                onSubmit={formik.handleSubmit}
                className="mt-4 space-y-4"
                noValidate
              >
                {/* ── Profile Image ── */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="profileImage"
                    className={"cursor-pointer flex items-center gap-7"}
                  >
                    <div
                      className="w-20 h-20 rounded-full bg-center bg-cover flex justify-center items-center bg-gray-200 flex-shrink-0"
                      style={{
                        backgroundImage: profileImagePreview
                          ? `url(${profileImagePreview})`
                          : "none",
                      }}
                    >
                      {!profileImagePreview && (
                        <Camera className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                    <p className="text-primary font-semibold">
                      {isEdit ? "Update Worker Image" : "Add Worker Image"}{" "}
                      <span className="text-primary/30">(Optional)</span>
                    </p>
                    <Input
                      id="profileImage"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                    />
                  </Label>
                  <FieldError
                    touched={formik.touched.profileImage}
                    error={formik.errors.profileImage}
                  />
                </div>

                {/* ── Full Name ── */}
                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name"
                    className={`h-14 ${formik.touched.fullName && formik.errors.fullName
                      ? "border-red-500"
                      : ""
                      }`}
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FieldError
                    touched={formik.touched.fullName}
                    error={formik.errors.fullName}
                  />
                </div>

                {/* ── Email ── */}
                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    className={`h-14 ${formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                      }`}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FieldError
                    touched={formik.touched.email}
                    error={formik.errors.email}
                  />
                </div>

                {/* ── Phone Number ── */}
                <div className="w-full flex flex-col gap-1">
                  <PhoneInput
                    variant="light"
                    label={"Phone Number"}
                    value={phoneFormatter(formik.values.phoneNumber)}
                    id={"phoneNumber"}
                    name={"phoneNumber"}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.phoneNumber}
                    touched={formik.touched.phoneNumber}
                    autoComplete="off"
                  />
                </div>

                {/* ── Address ── */}
                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    className={`h-14 ${formik.touched.address && formik.errors.address
                      ? "border-red-500"
                      : ""
                      }`}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FieldError
                    touched={formik.touched.address}
                    error={formik.errors.address}
                  />
                </div>

                {/* ── Password (Create only) ── */}
                {!isEdit && (
                  <>
                    <div className="w-full flex flex-col gap-1">
                      <Label className={"text-base text-black"}>Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          placeholder="● ● ● ● ● ● ● ●"
                          type={showPassword ? "text" : "password"}
                          className={`h-14 pr-10 ${formik.touched.password && formik.errors.password
                            ? "border-red-500"
                            : ""
                            }`}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {!showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <FieldError
                        touched={formik.touched.password}
                        error={formik.errors.password}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <Label className={"text-base text-black"}>
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="● ● ● ● ● ● ● ●"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`h-14 pr-10 ${formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                            ? "border-red-500"
                            : ""
                            }`}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {!showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <FieldError
                        touched={formik.touched.confirmPassword}
                        error={formik.errors.confirmPassword}
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isPending || !formik.isValid || !formik.dirty}
                  className={
                    "w-full h-14 text-lg text-white bg-blue-900 hover:bg-blue-800"
                  }
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Account Created – API fires on Send Mail click */}
      <AccountCreationPopup
        isOpen={accountPopup}
        onOpenChange={setAccountPopup}
        onSendMail={handleSendMail}
        isLoading={isCreating}
      />

      {/* Email Sent */}
      <EmailSentPopUp isOpen={emailPopup} onOpenChange={setEmailPopup} />

      {/* Profile Update Success */}
      <ProfileUpdateModal open={updateProfile} setOpen={setUpdateProfile} />
    </>
  );
};

export default AddBartenderForm;
