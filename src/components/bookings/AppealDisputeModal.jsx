"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { ErrorToast } from "@/components/ui/toaster";

const AppealDisputeModal = ({ open, setOpen, onSubmit, isLoading }) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ErrorToast("Please select a valid image file.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setText("");
    handleRemoveImage();
  };

  const handleClose = () => {
    if (isLoading) return;
    resetForm();
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      ErrorToast("Please enter appeal text.");
      return;
    }

    const formData = new FormData();
    formData.append("text", text.trim());
    if (imageFile) {
      formData.append("images", imageFile);
    }

    onSubmit(formData, resetForm);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-8 min-w-[540px] max-w-lg rounded-2xl bg-white shadow-2xl">
        <DialogHeader className="flex flex-col text-left border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Appeal Dispute
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-600">
            Provide an explanation and optional image proof to submit your appeal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Appeal Text */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Appeal Text <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter appeal explanation..."
              className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#012C57] focus:border-transparent placeholder:text-gray-400 font-normal resize-none"
              disabled={isLoading}
              required
            />
          </div>

          {/* Single Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Upload Proof Image <span className="text-xs font-normal text-gray-500">(Single image allowed)</span>
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#012C57] hover:bg-gray-50/50 transition">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Click to upload image</span>
                <span className="text-[11px] text-gray-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Appeal Proof Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-gray-200">
            <div className="w-full flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#012C57] to-[#061523] text-white text-xs font-bold hover:opacity-95 transition disabled:opacity-60 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Appeal"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppealDisputeModal;
