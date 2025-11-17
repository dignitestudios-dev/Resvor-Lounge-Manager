"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ChangePasswordModal = ({ open, setOpen, onRequestOTP, onUpdate }) => {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit() {
    setError("");
    if (!current || !password || !confirm) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      setError("New password and confirm password do not match.");
      return;
    }

    // Prefer to request OTP flow from parent; if not provided, fallback to onUpdate
    if (onRequestOTP) {
      onRequestOTP({ current, password });
    } else if (onUpdate) {
      onUpdate({ current, password });
    }
  }

  function renderPasswordField(
    label,
    value,
    setValue,
    show,
    setShow,
    placeholder
  ) {
    return (
      <div>
        <label className="block text-sm font-medium">{label}</label>
        <div className="relative mt-2">
          <input
            type={show ? "text" : "password"}
            className="w-full rounded-md border px-4 py-3 pr-10"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <AiOutlineEyeInvisible size={18} />
            ) : (
              <AiOutlineEye size={18} />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-4xl">Change Password</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            You must enter current password in order to update password.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {renderPasswordField(
            "Current Password",
            current,
            setCurrent,
            showCurrent,
            setShowCurrent,
            "Enter password here"
          )}

          {renderPasswordField(
            "New Password",
            password,
            setPassword,
            showPassword,
            setShowPassword,
            "Enter new password here"
          )}

          {renderPasswordField(
            "Confirm Password",
            confirm,
            setConfirm,
            showConfirm,
            setShowConfirm,
            "Re enter password here"
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button onClick={handleSubmit} className="w-full max-w-xl">
                Update
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
