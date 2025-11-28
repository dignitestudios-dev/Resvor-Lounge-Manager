"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { IoIosArrowForward } from "react-icons/io";

const PrivacyPolicy = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
          <p>Privacy Policy</p>
          <IoIosArrowForward size={24} />
        </button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl max-w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
          <DialogDescription className="mt-2 text-base text-gray-600">
            This privacy policy explains how we collect and use your
            information.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <h3 className="font-semibold">What We Collect</h3>
            <p className="text-sm text-gray-700 mt-2">
              We may collect personal information such as name, email, and usage
              data to improve our services.
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
              <li>Account information (name, email)</li>
              <li>Usage metrics and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold">How We Use Data</h3>
            <p className="text-sm text-gray-700 mt-2">
              Data is used to provide, maintain, and improve our services,
              personalize user experience, and for security purposes.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">Your Rights</h3>
            <p className="text-sm text-gray-700 mt-2">
              You can request access to, correction or deletion of your personal
              data. Contact support for any requests.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
