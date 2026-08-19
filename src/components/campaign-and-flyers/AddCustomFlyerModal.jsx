"use client";
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash2, RefreshCw } from "lucide-react";
import SendInvitationForm from "./SendInvitationForm";
import ConfirmPopup from "./ConfirmPopup";
import { useRouter } from "next/navigation";
import { ErrorToast } from "@/components/ui/toaster";

const FolderUploadIcon = () => (
  <svg
    width="28"
    height="29"
    viewBox="0 0 28 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    {/* Folder Outline */}
    <path
      d="M3 7.5C3 5.84315 4.34315 4.5 6 4.5H10.2C11.1017 4.5 11.9566 4.90842 12.5256 5.61214L13.6744 7.03072C14.2434 7.73444 15.0983 8.14286 16 8.14286H22C23.6569 8.14286 25 9.48601 25 11.1429V21.5C25 23.1569 23.6569 24.5 22 24.5H6C4.34315 24.5 3 23.1569 3 21.5V7.5Z"
      stroke="#959393"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Tray */}
    <path
      d="M10.5 19.5V20.5C10.5 21.0523 10.9477 21.5 11.5 21.5H16.5C17.0523 21.5 17.5 21.0523 17.5 20.5V19.5"
      stroke="#959393"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Up Arrow */}
    <path
      d="M14 13V19M14 13L11.5 15.5M14 13L16.5 15.5"
      stroke="#959393"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const AddCustomFlyerModal = ({ isOpen, onOpenChange }) => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [flyerImagePreview, setFlyerImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Subsequent flow triggers
  const [openInvForm, setOpenInvForm] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);

  const handleFileProcess = (file) => {
    if (!file) return;

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type);
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);

    // Reject GIFs, documents, videos, WebP, SVGs, and other non-JPEG/PNG formats
    if (!isAllowedType || !isAllowedExt) {
      const errorText = "Only JPEG and PNG images are allowed (GIFs, documents, and videos are not supported).";
      setErrorMessage(errorText);
      ErrorToast(errorText);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setErrorMessage("");
    setImageFile(file);
    setFlyerImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setImageFile(null);
    setFlyerImagePreview(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage("Please upload an image before proceeding.");
      ErrorToast("Please upload an image.");
      return;
    }

    onOpenChange(false);
    setOpenInvForm(true);
  };

  const handleSendInvitation = () => {
    setOpenInvForm(false);
    setConfirmPopup(true);
  };

  const handleModalClose = (open) => {
    if (!open) {
      setImageFile(null);
      setFlyerImagePreview(null);
      setErrorMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[461px] w-[95%] p-6 sm:p-8 rounded-[12px] bg-white border-0 shadow-2xl overflow-hidden gap-0"
        >
          {/* Header with Title and Close Button */}
          <div className="flex items-center justify-between pb-6">
            <DialogTitle className="text-[28px] leading-[34px] font-bold tracking-[-0.018em] text-[#181818] capitalize font-sans">
              Add Custom Flyer
            </DialogTitle>
            <DialogClose className="text-[#181818] hover:opacity-70 transition-opacity p-1 cursor-pointer focus:outline-none">
              <X className="w-6 h-6 stroke-[2]" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <DialogDescription asChild>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Hidden file input strictly allowing .jpg, .jpeg, .png */}
              <input
                ref={fileInputRef}
                id="customFlyerFileInput"
                type="file"
                accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Upload Dropzone & Preview */}
              <div>
                {flyerImagePreview ? (
                  /* Expanded Flyer Preview Container */
                  <div className="relative w-full h-[220px] rounded-[12px] border-[0.8px] border-[#BEBEBE] bg-gray-50/80 p-3 flex flex-col items-center justify-between group overflow-hidden shadow-inner">
                    {/* Top Action Controls */}
                    <div className="flex items-center justify-between w-full z-10">
                      {/* Change Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change image"
                        className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-black border border-gray-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Change
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title="Remove image"
                        className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-red-50 text-red-600 hover:text-red-700 border border-gray-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    {/* Centered Large Image Preview */}
                    <div className="flex-1 flex items-center justify-center my-1 w-full overflow-hidden">
                      <img
                        src={flyerImagePreview}
                        alt="Flyer Preview"
                        className="max-h-[145px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-gray-200/80 bg-white"
                      />
                    </div>

                    {/* Bottom Metadata Bar */}
                    <div className="flex items-center justify-between w-full px-2 pt-1 border-t border-gray-200/60 text-xs">
                      <p className="text-[12px] font-medium text-[#181818] truncate max-w-[240px]">
                        {imageFile?.name}
                      </p>
                      <p className="text-[11px] text-gray-500 shrink-0 font-medium">
                        {(imageFile?.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard Upload Dropzone matching Figma CSS */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative w-full h-[130px] rounded-[12px] border-[0.8px] bg-white flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                      errorMessage
                        ? "border-red-500 ring-1 ring-red-500"
                        : isDragging
                        ? "border-[#010067] bg-[#f4f4ff]"
                        : "border-[#BEBEBE] hover:border-gray-400 hover:bg-gray-50/50"
                    }`}
                  >
                    <FolderUploadIcon />
                    <p className="text-[12px] leading-[15px] text-[#181818] text-center select-none font-sans">
                      <span className="font-semibold">choose file</span> to upload
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <p className="text-red-500 text-[12px] font-medium mt-1.5">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                className="w-full h-[44px] rounded-[12px] bg-gradient text-white text-[13px] leading-[16px] font-bold text-center capitalize hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                Add
              </Button>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Step 2: Send Invitation Form */}
      <SendInvitationForm
        isOpen={openInvForm}
        onOpenChange={setOpenInvForm}
        onSendInvitation={handleSendInvitation}
        image={imageFile}
        additionalInfo=""
      />

      {/* Step 3: Confirmation Popup */}
      <ConfirmPopup
        isOpen={confirmPopup}
        onOpenChange={(open) => {
          setConfirmPopup(open);
          if (!open) {
            router.push("/dashboard/campaign-and-flyers/history");
          }
        }}
      />
    </>
  );
};

export default AddCustomFlyerModal;
