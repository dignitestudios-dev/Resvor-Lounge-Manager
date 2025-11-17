"use client";
import React, { useState } from "react";
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
import { Camera, Eye, EyeOff } from "lucide-react";
import Edit2 from "../icons/Edit2";

const AddBartenderForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  onUpdateSubmit,
  showTrigger = true,
}) => {
  // Pass the data when open from edit to and set in form data state
  // If isEdit is true call edit API else call Create API
  console.log("data to edit", data);
  console.log("Is to Edit: ", isEdit);

  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal triggers
  const [emailPopup, setEmailPopup] = useState(false);
  const [accountPopup, setAccountPopup] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onOpenChange(false);
    setAccountPopup(true);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Call onUpdateSubmit if provided (for bartender requests flow)
    if (isEdit && typeof onUpdateSubmit === "function") {
      onUpdateSubmit();
    } else {
      // Otherwise use the normal flow (profile update popup)
      onOpenChange(false);
      setUpdateProfile(true);
    }
  };

  const handleSendMail = () => {
    console.log("Email sent to bartender");
    setAccountPopup(false);
    setEmailPopup(true);
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
              <Button className={"border-2 h-14 text-lg"}>
                Add New Bartender
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"text-3xl font-bold"}>
              {isEdit ? "Update Bartender" : "Add New Bartender"}
            </DialogTitle>
            <DialogDescription>
              <form
                onSubmit={isEdit ? handleUpdateProfile : handleSubmit}
                className="mt-4 space-y-4"
              >
                <div className="flex gap-6 items-center">
                  <Label
                    htmlFor="profile"
                    className={"cursor-pointer flex items-center gap-7"}
                  >
                    <div
                      className="w-20 h-20 rounded-full bg-center bg-cover flex justify-center items-center bg-gray-200"
                      style={{
                        backgroundImage: profileImage
                          ? `url(${profileImage})`
                          : "none",
                      }}
                    >
                      {!profileImage && (
                        <Camera className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                    <p className="text-primary font-semibold">
                      Add Bartender Image{" "}
                      <span className="text-primary/30"> (Optional)</span>
                    </p>
                    <Input
                      id="profile"
                      type={"file"}
                      className={"hidden"}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Full Name</Label>
                  <Input placeholder="Full Name" className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Email Address
                  </Label>
                  <Input
                    placeholder="email@example.com"
                    type={"email"}
                    className={"h-14"}
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Phone Number</Label>
                  <Input placeholder="+1 234 567 890" className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Address</Label>
                  <Input placeholder="Enter address" className={"h-14"} />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>Password</Label>
                  <div className="relative">
                    <Input
                      placeholder="● ● ● ● ● ● ● ●"
                      type={showPassword ? "text" : "password"}
                      className={"h-14 pr-10"}
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
                </div>

                <div className="w-full flex flex-col gap-1">
                  <Label className={"text-base text-black"}>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="● ● ● ● ● ● ● ●"
                      type={showConfirmPassword ? "text" : "password"}
                      className={"h-14 pr-10"}
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
                </div>

                <Button type="submit" className={"w-full h-14 text-lg text-white bg-blue-900 hover:bg-blue-800"}>
                  {isEdit ? "Update" : "Save"}
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Account Created */}
      <AccountCreationPopup
        isOpen={accountPopup}
        onOpenChange={setAccountPopup}
        onSendMail={handleSendMail}
      />

      {/* Email Sent  */}
      <EmailSentPopUp isOpen={emailPopup} onOpenChange={setEmailPopup} />

      {/* Profile Update Success */}
      <ProfileUpdateModal open={updateProfile} setOpen={setUpdateProfile} />
    </>
  );
};

export default AddBartenderForm;
