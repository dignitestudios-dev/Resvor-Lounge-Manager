"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiEdit2 } from "react-icons/fi";
import Edit from "@/components/icons/Edit";

const PersonalInfoModal = ({
  open,
  setOpen,
  onEditEmail,
  onEditPhone,
  onSave,
}) => {
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
              defaultValue="Mike Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <div className="w-full mt-2 rounded-md bg-gray-100 px-4 py-3 text-gray-500">
              Lounge Manager
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <div className="relative mt-2">
              <input
                readOnly
                type="email"
                className="w-full rounded-md border px-4 py-3 pr-10 bg-gray-100 text-gray-600"
                defaultValue="designer@gmail.com"
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
                defaultValue="+1 462 849 558"
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
                  if (onSave) onSave();
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
