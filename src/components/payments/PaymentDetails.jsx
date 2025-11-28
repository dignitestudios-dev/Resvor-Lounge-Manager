"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import utils from "@/lib/utils";

const PaymentDetails = ({ isOpen, onOpenChange, data }) => {
  const summary = [
    { label: "Booking", amount: 25 },
    { label: "Food & Drink Package", amount: 200 },
    { label: "Bottle Package", amount: 150 },
    { label: "Platform Fee", amount: 15 },
    { label: "Tax", amount: 10 },
  ];

  const subtotal = summary.reduce((s, i) => s + i.amount, 0);
  const total = subtotal; // static example -- could include other fees

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-5">
            <DialogTitle className={"text-2xl font-bold"}>
              Booking Payment
            </DialogTitle>
          </div>

          <DialogDescription>
            <div className="mt-4 space-y-4">
              <div className="bg-linear-to-b from-[#E8E8FF] to-white p-4 rounded-lg shadow-lg">
                <div className="font-semibold mb-2 text-black text-lg">
                  Payment Summary
                </div>
                <div className="border-t border-gray-300 pt-3 space-y-2">
                  {summary.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-700"
                    >
                      <div>{item.label}</div>
                      <div>{utils.formatCurrency(item.amount)}</div>
                    </div>
                  ))}

                  <div className="flex justify-between text-gray-500 mt-2">
                    <div>Subtotal</div>
                    <div>{utils.formatCurrency(subtotal)}</div>
                  </div>

                  <div className="flex justify-between font-bold mt-3 text-black text-lg">
                    <div>Total</div>
                    <div>{utils.formatCurrency(total)}</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetails;
