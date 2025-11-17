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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import COUNTRY_CODES from "@/lib/countryCodes";

const ChangeNumberModal = ({ open, setOpen, onNext }) => {
  const [country, setCountry] = useState(COUNTRY_CODES[0].code);
  const [number, setNumber] = useState("");
  // show all countries (no search inside dropdown per request)
  const filtered = COUNTRY_CODES;

  function onNumberChange(e) {
    // allow only digits
    const digits = e.target.value.replace(/\D/g, "");
    setNumber(digits);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-4xl">Change Number</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            Please enter your current phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <label className="block text-sm font-medium">Phone Number</label>
          <div className="mt-2 rounded-md border px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select value={country} onValueChange={(v) => setCountry(v)}>
                <SelectTrigger className="min-w-20">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-medium">
                      {
                        (COUNTRY_CODES.find((c) => c.code === country) || {})
                          .short
                      }
                    </span>
                    <span className="ml-auto text-sm text-gray-600">
                      {country}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-auto">
                  {filtered.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <div className="flex items-center w-full">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-medium mr-3">
                          {c.short}
                        </span>
                        <span className="flex-1 text-sm">{c.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="flex-1 border-0 outline-none"
              placeholder="000000000"
              value={number}
              onChange={onNumberChange}
            />
          </div>
        </div>

        <div className="mt-8">
          <DialogFooter>
            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
                  if (onNext) onNext({ country, number });
                }}
                className="w-full max-w-xl"
              >
                Next
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeNumberModal;
