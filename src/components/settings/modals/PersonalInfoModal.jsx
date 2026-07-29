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
import { useUpdateLoungeManager } from "@/lib/hooks/mutations/AuthMutations";
import { useQueryClient } from "@tanstack/react-query";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";

const PersonalInfoModal = ({
  open,
  setOpen,
  onEditEmail,
  onEditPhone,
  onSave,
}) => {
  const queryClient = useQueryClient();
  const { data: authMeData } = useAuthMe();

  const authContext = useAuthContext();
  const user = authMeData?.user || authMeData || authContext?.user || {};

  const initialFirstName = user?.firstName || "";
  const initialLastName = user?.lastName || "";
  const initialFullName = `${initialFirstName} ${initialLastName}`.trim();

  const emailVal = user?.email || "";
  const phoneVal = user?.phoneNumber || user?.phone || "";
  const rawRole = user?.role || user?.roleName || "lounge_manager";

  const [fullName, setFullName] = useState(initialFullName);

  const updateLoungeManagerMutation = useUpdateLoungeManager();

  useEffect(() => {
    setFullName(initialFullName);
  }, [initialFullName]);

  const formatRole = (roleStr) => {
    if (!roleStr) return "Lounge Manager";
    return roleStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSave = async () => {
    const loungeManagerId = user?._id || user?.id;

    if (!loungeManagerId) {
      ErrorToast("Lounge Manager ID not found");
      return;
    }

    const trimmed = fullName.trim();
    if (!trimmed) {
      ErrorToast("Please enter a valid name");
      return;
    }

    const nameParts = trimmed.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const res = await updateLoungeManagerMutation.mutateAsync({
        loungeManagerId,
        firstName,
        lastName,
      });

      SuccessToast(res?.message || "Personal information updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });

      if (onSave) onSave({ fullName, firstName, lastName });
      setOpen(false);
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update personal information",
      );
    }
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
              className="w-full mt-2 rounded-md border px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              disabled={updateLoungeManagerMutation.isPending}
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
            </div>
          </div>
        </div>

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={handleSave}
                disabled={updateLoungeManagerMutation.isPending}
                className="w-full max-w-xl"
              >
                {updateLoungeManagerMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInfoModal;

