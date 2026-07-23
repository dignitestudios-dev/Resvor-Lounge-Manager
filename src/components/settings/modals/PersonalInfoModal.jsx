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
import { Loader2 } from "lucide-react";

const PersonalInfoModal = ({
  open,
  setOpen,
  onEditEmail,
  onEditPhone,
  onSave,
}) => {
  const { data: authData, isLoading, refetch } = useAuthMe();
  const user = authData?.user;

  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  useEffect(() => {
    if (user) {
      // const name = [user.fullName, user.lastName].filter(Boolean).join(" ");
      setFullName(user?.fullName);
    }
  }, [user]);

  const roleDisplay = user?.role
    ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Lounge Manager";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl">Personal Information</DialogTitle>
        </DialogHeader>

        {isLoading && !user ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                className="w-full mt-2 rounded-md border px-4 py-3"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Role</label>
              <div className="w-full mt-2 rounded-md bg-gray-100 px-4 py-3 text-gray-500 capitalize">
                {roleDisplay}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Email Address</label>
              <div className="relative mt-2">
                <input
                  readOnly
                  type="email"
                  className="w-full rounded-md border px-4 py-3 pr-10 bg-gray-100 text-gray-600"
                  value={user?.email || ""}
                  placeholder="Email Address"
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
                  value={user?.phoneNumber || ""}
                  placeholder="Phone Number"
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
        )}

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
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

