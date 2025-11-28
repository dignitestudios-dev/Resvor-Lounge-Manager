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

const AddEmailModal = ({ open, setOpen, onUpdate }) => {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-4xl text-center">Add New Email</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 text-center">
            Please enter your new email address.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <label className="block text-sm font-medium">Email Address</label>
          <input
            type="email"
            className="w-full mt-2 rounded-md border px-4 py-3"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
                  if (onUpdate) onUpdate({ email });
                }}
                className="w-full max-w-xl"
              >
                Update
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmailModal;
