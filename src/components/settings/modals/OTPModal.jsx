"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const OTPModal = ({
  open,
  setOpen,
  onVerify,
  label = "Please enter OTP code sent to your Email and Number",
}) => {
  const length = 5;
  const refs = useRef([]);

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      e.target.value = "";
      return;
    }
    // take only first char
    const ch = val.charAt(0);
    e.target.value = ch;
    // move to next
    const next = refs.current[idx + 1];
    if (next) next.focus();
  }

  function handleKeyDown(e, idx) {
    if (e.key === "Backspace" && !e.target.value) {
      const prev = refs.current[idx - 1];
      if (prev) prev.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const chars = paste.split("").slice(0, length);
    chars.forEach((ch, i) => {
      const input = refs.current[i];
      if (input) input.value = ch;
    });
    // focus last filled
    const last = refs.current[Math.min(chars.length, length) - 1];
    if (last) last.focus();
  }

  function collectCode() {
    return refs.current.map((r) => (r ? r.value || "" : "")).join("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-4xl">Verification</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            {label}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex justify-center">
          <div className="flex gap-4" onPaste={handlePaste}>
            {Array.from({ length }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                className="w-14 h-14 rounded-md border text-center"
                maxLength={1}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Didn't receive code?{" "}
          <button className="text-blue-700">Resend now</button>
        </div>

        <div className="mt-6">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
                  if (onVerify) onVerify(collectCode());
                }}
                className="w-full max-w-xl"
              >
                Verify
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
