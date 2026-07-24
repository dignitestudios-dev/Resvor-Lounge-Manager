"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
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

      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-500">
            Effective Date: October 1, 2025
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4 text-gray-700 text-sm md:text-base leading-relaxed">
          <p className="font-semibold">
            Effective Date: October 1, 2025
          </p>

          <p>
            Lladner Business Solutions LLC ("Lladner," "we," "our," or "us")
            respects your privacy and is committed to protecting your personal
            information. This Privacy Policy ("Policy") explains how we collect,
            use, and safeguard your data when you access our website at{" "}
            <span className="text-indigo-400">www.lladner.com</span>, use the{" "}
            <span className="font-semibold">ResVor web application</span> or
            engage with any of our other online platforms, services, or web
            applications (collectively, the "Services").
          </p>

          <p>
            By using the ResVor web application or any of our Services, you
            agree to the practices outlined in this Policy. If we make
            significant changes to how we use your information, we will update
            this Policy and post a revised version on our web application.
            Continued use of our Services after updates are published will
            indicate your acceptance of those changes. If you have any questions
            about this Privacy Policy, please contact us at:{" "}
            <span className="text-indigo-400">privacy@lladner.com</span>.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-6 mb-2">
            Information We Collect
          </h2>

          <p>
            To use the ResVor web application or other Services, you may be
            asked to register and provide personal details such as your name,
            email address, and other profile information (e.g., location,
            preferences, or date of birth). Additional details you choose to
            share will help us improve your experience but are not mandatory.
          </p>

          <p>
            We do not knowingly collect information from individuals under the
            age of 16. If we learn that a child under 16 has registered for our
            Services, we will promptly delete their information. If you suspect
            that we may have collected data from a minor, please notify us at{" "}
            <span className="text-indigo-400">privacy@lladner.com</span>.
          </p>

          <p>
            We may also automatically collect technical details such as your IP
            address, browser type, operating system, pages you visit, features
            you use, and the referring website. This information is used to
            monitor system performance, improve functionality, and analyze user
            trends.
          </p>

          <p>
            When inviting others to access your ResVor web application, you may
            provide us with their contact details (e.g., email address or phone
            number). While we store this information to deliver invitations and
            messages, we will not sell or share your guests' contact information
            without permission.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
