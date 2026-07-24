"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Edit from "@/components/icons/Edit";
import { useAuthMe } from "@/lib/hooks/queries/useQueries";
import { useAuthContext } from "@/lib/context/AuthProvider";

const PersonalInfoModal = ({
  open,
  setOpen,
  onEditEmail,
  onEditPhone,
  onSave,
}) => {

  const { data: authMeData } = useAuthMe();

  const authContext = useAuthContext();
  const user = authMeData?.user || authMeData || authContext?.user || {};
  console.log("🚀 ~ PersonalInfoModal ~ user:", user)

  const nameVal = user?.firstName + " " + user?.lastName || "";
  const emailVal = user?.email || "";
  const phoneVal = user?.phoneNumber || user?.phone || "";
  const rawRole = user?.role || user?.roleName || "lounge_manager";

  const [fullName, setFullName] = useState(nameVal);

  useEffect(() => {
    if (nameVal) {
      setFullName(nameVal);
    }
  }, [nameVal]);

  const formatRole = (roleStr) => {
    if (!roleStr) return "Lounge Manager";
    return roleStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl">Personal Information</DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              className="w-full mt-2 rounded-md border px-4 py-3"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <div className="w-full mt-2 rounded-md bg-gray-100 px-4 py-3 text-gray-500 capitalize">
              {formatRole(rawRole)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <div className="relative mt-2">
              <input
                readOnly
                type="email"
                className="w-full rounded-md border px-4 py-3 pr-10 bg-gray-100 text-gray-600"
                value={emailVal}
                placeholder="No email provided"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => {
                  if (onEditEmail) onEditEmail();
                }}
                aria-label="Edit email"
              >
                <Edit />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <div className="relative mt-2">
              <input
                readOnly
                className="w-full rounded-md border px-4 py-3 pr-10 bg-gray-100 text-gray-600"
                value={phoneVal}
                placeholder="No phone number provided"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => {
                  if (onEditPhone) onEditPhone();
                }}
                aria-label="Edit phone"
              >
                <Edit />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
                  if (onSave) onSave({ fullName });
                  if (onSave) onSave({ fullName });
                  setOpen(false);
                }}
                className="w-full max-w-xl"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInfoModal;

