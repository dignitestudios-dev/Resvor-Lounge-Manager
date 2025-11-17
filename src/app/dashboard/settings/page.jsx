"use client";
import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

import NotificationSettings from "@/components/settings/NotificationSettings";
import TermsAndConditions from "@/components/settings/TermsAndConditions";
import PrivacyPolicy from "@/components/settings/PrivacyPolicy";
import ProfileFlow from "@/components/settings/ProfileFlow";
import ChangePasswordModal from "@/components/settings/modals/ChangePasswordModal";
import SuccessModal from "@/components/settings/modals/SuccessModal";
import OTPModal from "@/components/settings/modals/OTPModal";
import Link from "next/link";

const Settings = () => {
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openPasswordOTP, setOpenPasswordOTP] = useState(false);
  const [pendingPassword, setPendingPassword] = useState(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Updated!");
  const [successMessage, setSuccessMessage] = useState(
    "Your information has been updated successfully."
  );

  return (
    <div>
      <h1 className="section-heading">Settings</h1>

      <div className="mt-10 flex-1 bg-white rounded-2xl overflow-y-auto">
        <ProfileFlow />

        <Link
          href={"/dashboard/settings/subscription-plans"}
          className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
        >
          <p>Subscription Plans</p>
          <IoIosArrowForward size={24} />
        </Link>

        {/* Notification Settings opens a dialog */}
        <NotificationSettings />

        <button
          onClick={() => setOpenChangePassword(true)}
          className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
        >
          <p>Change Password</p>
          <IoIosArrowForward size={24} />
        </button>

        <TermsAndConditions />

        <PrivacyPolicy />
      </div>

      <ChangePasswordModal
        open={openChangePassword}
        setOpen={setOpenChangePassword}
        onRequestOTP={(data) => {
          // start OTP verification for password change
          setPendingPassword(data);
          setOpenChangePassword(false);
          setOpenPasswordOTP(true);
        }}
        onUpdate={() => {
          // fallback direct update (same as before)
          setSuccessTitle("Password Updated!");
          setSuccessMessage("Your password has been updated successfully.");
          setOpenChangePassword(false);
          setOpenSuccess(true);
        }}
      />

      <OTPModal
        open={openPasswordOTP}
        setOpen={setOpenPasswordOTP}
        onVerify={(code) => {
          // In a real app we'd send `pendingPassword` + code to the API -> update password
          // For now, treat verification as successful and show the success modal
          setOpenPasswordOTP(false);
          setPendingPassword(null);
          setSuccessTitle("Password Updated!");
          setSuccessMessage("Your password has been updated successfully.");
          setOpenSuccess(true);
        }}
      />

      <SuccessModal
        open={openSuccess}
        setOpen={setOpenSuccess}
        title={successTitle}
        message={successMessage}
      />
    </div>
  );
};

export default Settings;
