"use client";

import React, { useState } from "react";
import PersonalInfoModal from "./modals/PersonalInfoModal";
import ChangeNumberModal from "./modals/ChangeNumberModal";
import OTPModal from "./modals/OTPModal";
import AddNumberModal from "./modals/AddNumberModal";
import AddEmailModal from "./modals/AddEmailModal";
import SuccessModal from "./modals/SuccessModal";
import ChangeEmailModal from "./modals/ChangeEmailModal";
import { IoIosArrowForward } from "react-icons/io";

const ProfileFlow = ({
  onSavePersonal = () => console.log("save personal (parent)"),
  onStartChangeNumber = () => console.log("start change number (parent)"),
  onVerifyNumber = () => console.log("verify number (parent)"),
  onAddNewNumber = () => console.log("add new number (parent)"),
  onNumberUpdated = () => console.log("number updated (parent)"),
  onStartChangeEmail = () => console.log("start change email (parent)"),
  onVerifyEmail = () => console.log("verify email (parent)"),
  onAddNewEmail = () => console.log("add new email (parent)"),
  onEmailUpdated = () => console.log("email updated (parent)"),
}) => {
  const [openPersonal, setOpenPersonal] = useState(false);
  const [openChangeNumber, setOpenChangeNumber] = useState(false);
  const [openOTP, setOpenOTP] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState(null); // 'phone' | 'email'
  const [openAddNumber, setOpenAddNumber] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Updated!");
  const [successMessage, setSuccessMessage] = useState(
    "Your information has been updated successfully."
  );
  const [openChangeEmail, setOpenChangeEmail] = useState(false);
  const [openAddEmail, setOpenAddEmail] = useState(false);

  return (
    <>
      <div>
        <button
          className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
          onClick={() => setOpenPersonal(true)}
        >
          <p>Personal Information</p>
          <IoIosArrowForward size={24} />
        </button>
      </div>

      <PersonalInfoModal
        open={openPersonal}
        setOpen={setOpenPersonal}
        onEditPhone={() => {
          if (onStartChangeNumber) onStartChangeNumber();
          setOpenPersonal(false);
          setOpenChangeNumber(true);
        }}
        onEditEmail={() => {
          if (onStartChangeEmail) onStartChangeEmail();
          setOpenPersonal(false);
          setOpenChangeEmail(true);
        }}
        onSave={() => {
          if (onSavePersonal) onSavePersonal();
          setOpenPersonal(false);
        }}
      />

      <ChangeNumberModal
        open={openChangeNumber}
        setOpen={setOpenChangeNumber}
        onNext={() => {
          // start OTP for phone change
          setOtpPurpose("phone");
          setOpenChangeNumber(false);
          setOpenOTP(true);
        }}
      />

      <OTPModal
        open={openOTP}
        setOpen={setOpenOTP}
        onVerify={(code) => {
          // route verification based on purpose
          if (otpPurpose === "email") {
            if (onVerifyEmail) onVerifyEmail(code);
            setOpenOTP(false);
            setOpenAddEmail(true);
          } else {
            if (onVerifyNumber) onVerifyNumber(code);
            setOpenOTP(false);
            setOpenAddNumber(true);
          }
          // reset purpose
          setOtpPurpose(null);
        }}
      />

      <AddNumberModal
        open={openAddNumber}
        setOpen={setOpenAddNumber}
        onUpdate={() => {
          if (onAddNewNumber) onAddNewNumber();
          if (onNumberUpdated) onNumberUpdated();
          // show tailored success for number
          setSuccessTitle("Number Updated!");
          setSuccessMessage("Your number has been updated successfully.");
          setOpenAddNumber(false);
          setOpenSuccess(true);
        }}
      />

      <ChangeEmailModal
        open={openChangeEmail}
        setOpen={setOpenChangeEmail}
        onNext={() => {
          // start OTP for email change
          setOtpPurpose("email");
          setOpenChangeEmail(false);
          setOpenOTP(true);
        }}
      />

      <AddEmailModal
        open={openAddEmail}
        setOpen={setOpenAddEmail}
        onUpdate={() => {
          if (onAddNewEmail) onAddNewEmail();
          if (onEmailUpdated) onEmailUpdated();
          // show tailored success for email
          setSuccessTitle("Email Updated!");
          setSuccessMessage("Your email has been updated successfully.");
          setOpenAddEmail(false);
          setOpenSuccess(true);
        }}
      />

      <SuccessModal
        open={openSuccess}
        setOpen={setOpenSuccess}
        title={successTitle}
        message={successMessage}
      />
    </>
  );
};

export default ProfileFlow;
