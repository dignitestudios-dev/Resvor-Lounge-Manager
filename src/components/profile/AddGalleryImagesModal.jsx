"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { ErrorToast } from "@/components/ui/toaster";

const MAX_TOTAL_IMAGES = 20;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * AddGalleryImagesModal
 *
 * Handles drag-and-drop or browsing of multiple images with client-side
 * validation (max 20 images total, file size, file types) and previews.
 */
const AddGalleryImagesModal = ({
  open,
  setOpen,
  currentCount = 0,
  isLoading = false,
  onUpload,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const remainingSlots = Math.max(0, MAX_TOTAL_IMAGES - currentCount);

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      if (selectedFiles.length > 0 && !isLoading) {
        const confirmClose = window.confirm(
          "You have unuploaded images. Are you sure you want to close?"
        );
        if (!confirmClose) return;
      }
      handleReset();
    }
    setOpen(newOpen);
  };

  const handleReset = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviews([]);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = (files) => {
    setErrorMsg("");
    if (!files || files.length === 0) return;

    if (remainingSlots <= 0) {
      setErrorMsg("Maximum 20 images limit reached. Remove some existing images first.");
      ErrorToast("Maximum 20 images limit reached.");
      return;
    }

    const validNewFiles = [];
    const validNewPreviews = [];
    const currentSelectedCount = selectedFiles.length;
    const availableSlots = remainingSlots - currentSelectedCount;

    if (availableSlots <= 0) {
      setErrorMsg(`You can only select up to ${remainingSlots} images in total.`);
      ErrorToast(`Cannot select more than ${remainingSlots} images.`);
      return;
    }

    let oversizedCount = 0;
    let invalidTypeCount = 0;
    let slotsExceeded = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check type
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidTypeCount++;
        continue;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedCount++;
        continue;
      }

      // Check slot limit
      if (validNewFiles.length >= availableSlots) {
        slotsExceeded = true;
        break;
      }

      // Prevent duplicate file additions
      const isDuplicate = selectedFiles.some(
        (sf) => sf.name === file.name && sf.size === file.size
      );
      if (isDuplicate) continue;

      validNewFiles.push(file);
      validNewPreviews.push({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: formatBytes(file.size),
      });
    }

    if (invalidTypeCount > 0) {
      setErrorMsg("Only JPG, JPEG, PNG, and WEBP image files are allowed.");
    } else if (oversizedCount > 0) {
      setErrorMsg(`Some files exceeded the maximum size of ${MAX_FILE_SIZE_MB}MB and were skipped.`);
    } else if (slotsExceeded) {
      setErrorMsg(`Selection trimmed to stay within the 20 images lounge limit.`);
    }

    if (validNewFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validNewFiles]);
      setPreviews((prev) => [...prev, ...validNewPreviews]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  const handleRemoveSingle = (index) => {
    URL.revokeObjectURL(previews[index]?.url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || isLoading) return;
    if (onUpload) {
      await onUpload(selectedFiles);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Upload Gallery Images
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Add photos to your lounge gallery. You can add up to{" "}
                <span className="font-semibold text-primary">{remainingSlots}</span>{" "}
                more {remainingSlots === 1 ? "image" : "images"} (Max {MAX_TOTAL_IMAGES} total).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${
              isDragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-gray-300 hover:border-primary/60 hover:bg-gray-50/60"
            } ${remainingSlots <= 0 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Drag & drop images here, or{" "}
              <span className="text-primary underline">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, JPEG, PNG, WEBP (Max {MAX_FILE_SIZE_MB}MB each)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading || remainingSlots <= 0}
            />
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Selected Previews */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">
                  Ready to upload ({previews.length})
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700 underline cursor-pointer"
                  disabled={isLoading}
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto p-1">
                {previews.map((item, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient & Name Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2 opacity-90">
                      <p className="text-[11px] text-white truncate font-medium">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-300">{item.size}</p>
                    </div>

                    {/* Remove single file */}
                    {!isLoading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSingle(index);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="h-11 px-5 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || isLoading}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading {selectedFiles.length} {selectedFiles.length === 1 ? "Image" : "Images"}...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Images</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGalleryImagesModal;
