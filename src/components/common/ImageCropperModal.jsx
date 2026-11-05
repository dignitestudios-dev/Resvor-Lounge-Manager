"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crop as CropIcon,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  getCroppedImg,
  validateProfileImage,
} from "@/lib/utils/cropImage";

/**
 * ImageCropperModal
 *
 * Provides a square (1:1) cropping modal for profile pictures with:
 * - Drag/pan adjustment to center the face
 * - Zoom slider & quick zoom buttons (+ / - / reset)
 * - Live circular and square previews
 * - 500x500px high-resolution export
 * - Support for JPG, JPEG, PNG, and WEBP formats
 * - Inline validation & error states
 */
export default function ImageCropperModal({
  open,
  onClose,
  imageFile,
  imageSrc: externalSrc,
  onCropSave,
  targetSize = 500,
  title = "Crop Profile Picture",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [internalSrc, setInternalSrc] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roundCanvasRef = useRef(null);
  const squareCanvasRef = useRef(null);

  // Manage image source and file validation
  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setErrorMessage("");
      setIsSaving(false);
      return;
    }

    if (imageFile) {
      // Validate file before proceeding
      const validation = validateProfileImage(imageFile);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid image file.");
        setInternalSrc(null);
        return;
      }

      const url = URL.createObjectURL(imageFile);
      setInternalSrc(url);
      setErrorMessage("");

      const img = new Image();
      img.onload = () => setImageElement(img);
      img.onerror = () => setErrorMessage("Unable to load selected image.");
      img.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (externalSrc) {
      setInternalSrc(externalSrc);
      setErrorMessage("");

      const img = new Image();
      if (!externalSrc.startsWith("data:") && !externalSrc.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => setImageElement(img);
      img.onerror = () => setErrorMessage("Unable to load image.");
      img.src = externalSrc;
    }
  }, [open, imageFile, externalSrc]);

  // Live preview rendering to canvases whenever crop coordinates or zoom changes
  useEffect(() => {
    if (!croppedAreaPixels || !imageElement) return;

    const renderToCanvas = (canvas) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // If source format is jpeg/jpg, fill white canvas
      const mime = imageFile?.type || "image/jpeg";
      if (mime === "image/jpeg" || mime === "image/jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    renderToCanvas(roundCanvasRef.current);
    renderToCanvas(squareCanvasRef.current);
  }, [croppedAreaPixels, imageElement, imageFile]);

  const onCropCompleteCallback = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleZoomChange = (newZoom) => {
    setZoom(Math.min(3, Math.max(1, newZoom)));
  };

  const handleSaveCrop = async () => {
    if (!internalSrc || !croppedAreaPixels) {
      setErrorMessage("Please position your image inside the crop frame.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const mimeType = imageFile?.type || "image/jpeg";
      const fileName = imageFile?.name || "profile-picture.jpg";

      const croppedResult = await getCroppedImg(
        internalSrc,
        croppedAreaPixels,
        targetSize,
        targetSize,
        mimeType,
        fileName
      );

      if (onCropSave) {
        await onCropSave(croppedResult.file, croppedResult.previewUrl);
      }

      onClose();
    } catch (err) {
      console.error("Crop error:", err);
      setErrorMessage(
        err.message || "An error occurred while cropping. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <CropIcon className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Drag to center your face in the square area. Use zoom to frame it
            properly.
          </p>
        </DialogHeader>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto space-y-4">
          {/* Main Cropper Container */}
          <div className="relative w-full h-72 sm:h-80 bg-gray-900 rounded-xl overflow-hidden shadow-inner">
            {internalSrc ? (
              <Cropper
                image={internalSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={onCropCompleteCallback}
                onZoomChange={setZoom}
                minZoom={1}
                maxZoom={3}
                zoomSpeed={1}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm">No image available to crop</p>
              </div>
            )}
          </div>

          {/* Controls & Zoom Slider */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Zoom & Frame
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.15)}
                disabled={zoom <= 1 || isSaving}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                disabled={isSaving}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Zoom level"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.15)}
                disabled={zoom >= 3 || isSaving}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                }}
                disabled={isSaving || (zoom === 1 && crop.x === 0 && crop.y === 0)}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs font-medium flex items-center gap-1 shrink-0"
                title="Reset Position and Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Live Preview
              </h4>
              <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                Output: {targetSize} × {targetSize} px
              </span>
            </div>

            <div className="flex items-center justify-around gap-4 pt-1">
              {/* Circular Avatar Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/60 shadow-sm bg-gray-100 relative">
                  <canvas
                    ref={roundCanvasRef}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] text-gray-500 font-medium text-center">
                  Circular Avatar
                </span>
              </div>

              {/* Square (1:1) Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-100 relative">
                  <canvas
                    ref={squareCanvasRef}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] text-gray-500 font-medium text-center">
                  Square (1:1)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveCrop}
            disabled={isSaving || !internalSrc || !croppedAreaPixels}
            className="bg-primary hover:bg-primary/90 text-white cursor-pointer min-w-32 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CropIcon className="w-4 h-4" />
                <span>Save & Crop</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

