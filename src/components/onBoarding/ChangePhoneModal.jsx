"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PhoneInput from "@/components/auth/PhoneInput";
import { phoneFormatter, phoneToE164, updateAuthCache } from "@/lib/utils";
import { useUpdatePhoneNumber } from "@/lib/hooks/mutations/OnBoardingMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

const ChangePhoneModal = ({ isOpen, onOpenChange, currentPhone, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const updatePhoneMutation = useUpdatePhoneNumber();

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const digits = phoneNumber.replace(/\D/g, "");
    if (!digits || digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const formattedPhone = phoneToE164(phoneNumber, "+1");

    try {
      const response = await updatePhoneMutation.mutateAsync({
        phoneNumber: formattedPhone,
      });

      const resData = response?.data;

      // Update cookies with returned token & user if present
      if (resData?.token) {
        Cookies.set("token", resData.token, { expires: 7, path: "/" });
        Cookies.set("authorization", resData.token, { expires: 7, path: "/" });
      }
      if (resData?.tokenType) {
        Cookies.set("sessionType", resData.tokenType, { expires: 7, path: "/" });
      }
      if (resData?.onboardingStep) {
        Cookies.set("onboardingStep", resData.onboardingStep, { expires: 7, path: "/" });
      }
      if (resData?.user) {
        Cookies.set("user", JSON.stringify(resData.user), { expires: 7, path: "/" });
      }

      // Update TanStack Query auth cache
      updateAuthCache(queryClient, {
        sessionType: resData?.tokenType || "registration_token",
        onboardingStep: resData?.onboardingStep || "verify_mobile",
        user: resData?.user || { phoneNumber: formattedPhone },
      });

      SuccessToast(response?.message || "Phone number updated successfully");
      setPhoneNumber("");
      setError("");
      onOpenChange(false);
      onSuccess?.(resData?.user?.phoneNumber || formattedPhone);
    } catch (err) {
      if (err?.code === "NO_INTERNET") {
        ErrorToast(err.message);
      } else {
        const msg =
          err?.response?.data?.message ||
          "Failed to update phone number. Please try again.";
        setError(msg);
        ErrorToast(msg);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!updatePhoneMutation.isPending) {
          if (!open) {
            setPhoneNumber("");
            setError("");
          }
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border-none">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Change Phone Number
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Enter your new phone number. A new one-time verification code will be sent to this number.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <PhoneInput
            variant="light"
            label="New Phone Number"
            id="newPhoneNumber"
            name="newPhoneNumber"
            value={phoneFormatter(phoneNumber)}
            onChange={handlePhoneChange}
            error={error}
            touched={!!error}
            autoComplete="tel"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={updatePhoneMutation.isPending}
              className="w-1/2 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePhoneMutation.isPending || !phoneNumber}
              className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {updatePhoneMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Number"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePhoneModal;
