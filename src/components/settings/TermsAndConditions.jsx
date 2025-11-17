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

const TermsAndConditions = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
          <p>Terms & Conditions</p>
          <IoIosArrowForward size={24} />
        </button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl max-w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms & Conditions</DialogTitle>
          <DialogDescription className="mt-2 text-base text-gray-600">
            Please read these terms and conditions carefully before using our
            service.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <h3 className="font-semibold">1. Acceptance of Terms</h3>
            <p className="text-sm text-gray-700 mt-2">
              By accessing and using our services, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">2. Use of Service</h3>
            <p className="text-sm text-gray-700 mt-2">
              You agree not to misuse the service. Prohibited actions include
              but are not limited to: hacking, spamming, or transmitting
              malicious code.
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
              <li>Do not reverse-engineer the service.</li>
              <li>Do not attempt to access other users' accounts.</li>
              <li>Follow applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold">3. Intellectual Property</h3>
            <p className="text-sm text-gray-700 mt-2">
              All content, features, and functionality are and will remain the
              exclusive property of the company.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">4. Limitation of Liability</h3>
            <p className="text-sm text-gray-700 mt-2">
              In no event shall the company be liable for any indirect,
              incidental, special, consequential or exemplary damages.
            </p>
          </section>
        </div>

        <DialogFooter className="mt-6">
          <div className="w-full flex justify-end">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;
