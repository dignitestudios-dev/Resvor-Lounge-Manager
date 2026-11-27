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
import {
  clamp,
  getImageDisplayRect,
  getVisibleImageBounds,
  getInitialCropBox,
  clampCropBoxToBounds,
  moveCropBox,
  resizeCropBox,
  cropBoxToNaturalPixels,
} from "@/lib/utils/interactiveCropGeometry";

const RESIZE_HANDLES = [
  { id: "nw", cursor: "nwse-resize", className: "-top-1.5 -left-1.5 w-3.5 h-3.5 rounded-sm" },
  { id: "n", cursor: "ns-resize", className: "-top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 rounded-full" },
  { id: "ne", cursor: "nesw-resize", className: "-top-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm" },
  { id: "e", cursor: "ew-resize", className: "top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 rounded-full" },
  { id: "se", cursor: "nwse-resize", className: "-bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm" },
  { id: "s", cursor: "ns-resize", className: "-bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 rounded-full" },
  { id: "sw", cursor: "nesw-resize", className: "-bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-sm" },
  { id: "w", cursor: "ew-resize", className: "top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-6 rounded-full" },
];

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
  targetWidth,
  targetHeight,
  aspect = 1,
  allowResize = false,
  allowOriginal = false,
  title = "Crop Profile Picture",
  description = "Drag to center your face in the square area. Use zoom to frame it properly.",
  showCircularPreview = true,
  previewLabel = "Square (1:1)",
}) {
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const effectiveAspect = aspect && aspect !== "free" ? aspect : null;
  const isFreeform = allowResize && !effectiveAspect;
  const outputWidth = isFreeform && croppedAreaPixels ? croppedAreaPixels.width : (targetWidth ?? targetSize);
  const outputHeight = isFreeform && croppedAreaPixels ? croppedAreaPixels.height : (targetHeight ?? targetSize);
  const rawPreviewRatio = isFreeform && croppedAreaPixels && croppedAreaPixels.height > 0
    ? croppedAreaPixels.width / croppedAreaPixels.height
    : (effectiveAspect || 1);
  const previewRatio = clamp(rawPreviewRatio, 0.4, 3);
  const previewBoxWidth = 140;
  const previewBoxHeight = 88;
  const previewCanvasWidth = 240;
  const previewCanvasHeight = Math.max(1, Math.round(240 / previewRatio));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [internalSrc, setInternalSrc] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Optional crop mode: when allowOriginal=true, starts in "preview" (full original image without crop)
  const [isCropModeActive, setIsCropModeActive] = useState(!allowOriginal);

  // Interactive resizable cropper state (used when allowResize = true)
  const cropContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const dragStateRef = useRef(null);

  const roundCanvasRef = useRef(null);
  const squareCanvasRef = useRef(null);

  // Manage image source and file validation
  useEffect(() => {
    // Reset transient cropper states when modal closes or image source changes
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCropBox(null);
    setCroppedAreaPixels(null);
    setImageElement(null);
    setErrorMessage("");
    setIsSaving(false);
    setIsCropModeActive(!allowOriginal);

    if (!open) {
      setInternalSrc(null);
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

      let active = true;
      const url = URL.createObjectURL(imageFile);
      setInternalSrc(url);

      const img = new Image();
      const handleLoad = () => {
        if (!active) return;
        setImageElement(img);
      };
      const handleError = () => {
        if (!active) return;
        setErrorMessage("Unable to load selected image.");
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;

      if (img.complete && img.naturalWidth > 0) {
        handleLoad();
      }

      return () => {
        active = false;
        URL.revokeObjectURL(url);
      };
    } else if (externalSrc) {
      let active = true;
      setInternalSrc(externalSrc);

      const img = new Image();
      if (!externalSrc.startsWith("data:") && !externalSrc.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
      }
      const handleLoad = () => {
        if (!active) return;
        setImageElement(img);
      };
      const handleError = () => {
        if (!active) return;
        setErrorMessage("Unable to load image.");
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = externalSrc;

      if (img.complete && img.naturalWidth > 0) {
        handleLoad();
      }

      return () => {
        active = false;
      };
    } else {
      setInternalSrc(null);
    }
  }, [open, imageFile, externalSrc]);

  // Measure interactive cropper container size when open & allowResize
  useEffect(() => {
    if (!open || !allowResize) return;
    const el = cropContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const width = rect.width || el.clientWidth || el.offsetWidth || 0;
      const height = rect.height || el.clientHeight || el.offsetHeight || 0;
      if (width > 0 && height > 0) {
        setContainerSize((prev) => {
          if (Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5) {
            return prev;
          }
          return { width, height };
        });
      }
    };

    updateSize();
    // Schedule a frame check in case Radix Dialog layout finishes slightly after mount
    const rafId = requestAnimationFrame(updateSize);
    const timerId = setTimeout(updateSize, 100);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateSize);
      observer.observe(el);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [open, allowResize, internalSrc, imageElement]);

  // Initialize or update cropBox and croppedAreaPixels when image, container, zoom, or pan change
  useEffect(() => {
    if (!open || !allowResize || !imageElement || !containerSize.width || !containerSize.height) return;

    const imgRect = getImageDisplayRect(
      containerSize.width,
      containerSize.height,
      imageElement.naturalWidth,
      imageElement.naturalHeight,
      zoom,
      pan
    );
    const bounds = getVisibleImageBounds(containerSize.width, containerSize.height, imgRect);

    if (!cropBox) {
      const initialBox = getInitialCropBox(bounds, effectiveAspect, 1);
      setCropBox(initialBox);
      const initialPixels = cropBoxToNaturalPixels(
        initialBox,
        imgRect,
        imageElement.naturalWidth,
        imageElement.naturalHeight
      );
      if (initialPixels) setCroppedAreaPixels(initialPixels);
      return;
    }

    // While dragging/resizing, do not re-clamp to avoid feedback loop jitter
    if (dragStateRef.current) return;

    const clamped = clampCropBoxToBounds(cropBox, bounds, effectiveAspect);

    if (
      Math.abs(clamped.x - cropBox.x) > 0.5 ||
      Math.abs(clamped.y - cropBox.y) > 0.5 ||
      Math.abs(clamped.width - cropBox.width) > 0.5 ||
      Math.abs(clamped.height - cropBox.height) > 0.5
    ) {
      setCropBox(clamped);
      return;
    }

    const pixels = cropBoxToNaturalPixels(
      clamped,
      imgRect,
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );
    if (pixels) setCroppedAreaPixels(pixels);
  }, [open, allowResize, imageElement, containerSize, cropBox, zoom, pan, effectiveAspect]);

  // Pointer drag / resize / pan listeners for allowResize mode
  useEffect(() => {
    if (!allowResize) return;

    const handlePointerMove = (e) => {
      const state = dragStateRef.current;
      if (!state) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (state.mode === "move") {
        const nextBox = moveCropBox(state.startBox, dx, dy, state.bounds);
        setCropBox(nextBox);
        if (state.imgRect && imageElement) {
          const pixels = cropBoxToNaturalPixels(
            nextBox,
            state.imgRect,
            imageElement.naturalWidth,
            imageElement.naturalHeight
          );
          if (pixels) setCroppedAreaPixels(pixels);
        }
      } else if (state.mode === "resize") {
        const nextBox = resizeCropBox(state.startBox, state.handle, dx, dy, state.bounds, effectiveAspect);
        setCropBox(nextBox);
        if (state.imgRect && imageElement) {
          const pixels = cropBoxToNaturalPixels(
            nextBox,
            state.imgRect,
            imageElement.naturalWidth,
            imageElement.naturalHeight
          );
          if (pixels) setCroppedAreaPixels(pixels);
        }
      } else if (state.mode === "pan") {
        const nextPanX = clamp(state.startPan.x + dx, state.minPanX, state.maxPanX);
        const nextPanY = clamp(state.startPan.y + dy, state.minPanY, state.maxPanY);
        setPan({ x: nextPanX, y: nextPanY });
      }
    };

    const handlePointerUp = () => {
      if (dragStateRef.current) {
        dragStateRef.current = null;
        setIsInteracting(false);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [allowResize, effectiveAspect, imageElement]);

  const startInteractiveAction = (e, mode, handle = null) => {
    if (!allowResize || isSaving || !imageElement || !cropBox) return;
    e.preventDefault();
    e.stopPropagation();

    const imgRect = getImageDisplayRect(
      containerSize.width,
      containerSize.height,
      imageElement.naturalWidth,
      imageElement.naturalHeight,
      zoom,
      pan
    );
    const bounds = getVisibleImageBounds(containerSize.width, containerSize.height, imgRect);

    // Compute pan limits so the image cannot be dragged away from the container/cropBox
    const overflowX = Math.max(0, (imgRect.width - containerSize.width) / 2 + 12);
    const overflowY = Math.max(0, (imgRect.height - containerSize.height) / 2 + 12);

    dragStateRef.current = {
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
      startPan: { ...pan },
      bounds,
      imgRect,
      minPanX: -overflowX,
      maxPanX: overflowX,
      minPanY: -overflowY,
      maxPanY: overflowY,
    };
    setIsInteracting(true);
  };

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
        outputWidth,
        outputHeight,
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

  const handleUseOriginal = async () => {
    if (!internalSrc) {
      setErrorMessage("No image available to save.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (imageFile) {
        // Use the original File object without modifying its dimensions or quality
        const previewUrl = internalSrc;
        if (onCropSave) {
          await onCropSave(imageFile, previewUrl);
        }
      } else if (externalSrc) {
        if (onCropSave) {
          await onCropSave(null, externalSrc);
        }
      }

      onClose();
    } catch (err) {
      console.error("Error using original image:", err);
      setErrorMessage(
        err.message || "An error occurred saving the original image."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const interactiveImgRect =
    allowResize && imageElement && containerSize.width > 0 && containerSize.height > 0
      ? getImageDisplayRect(
        containerSize.width,
        containerSize.height,
        imageElement.naturalWidth,
        imageElement.naturalHeight,
        zoom,
        pan
      )
      : null;

  const handleReset = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setPan({ x: 0, y: 0 });
    if (allowResize && imageElement && containerSize.width > 0 && containerSize.height > 0) {
      const resetImgRect = getImageDisplayRect(
        containerSize.width,
        containerSize.height,
        imageElement.naturalWidth,
        imageElement.naturalHeight,
        1,
        { x: 0, y: 0 }
      );
      const resetBounds = getVisibleImageBounds(
        containerSize.width,
        containerSize.height,
        resetImgRect
      );
      setCropBox(getInitialCropBox(resetBounds, effectiveAspect, 1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden flex flex-col h-[90vh] max-h-[760px]">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <CropIcon className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        </DialogHeader>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mx-6 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-3 min-h-0 space-y-3">
          {/* Main Cropper Container */}
          <div
            ref={cropContainerRef}
            onPointerDown={(e) => {
              if (allowResize && isCropModeActive && zoom > 1) startInteractiveAction(e, "pan");
            }}
            className={`relative w-full flex-1 min-h-[220px] bg-gray-900 rounded-xl overflow-hidden shadow-inner select-none touch-none shrink-0 ${allowResize && isCropModeActive && zoom > 1 ? (isInteracting ? "cursor-grabbing" : "cursor-grab") : ""
              }`}
          >
            {internalSrc ? (
              allowResize ? (
                <>
                  {!imageElement && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70 z-0">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  )}

                  {interactiveImgRect && (
                    <img
                      src={internalSrc}
                      alt="Crop target"
                      draggable={false}
                      className="absolute max-w-none pointer-events-none select-none"
                      style={{
                        left: `${interactiveImgRect.left}px`,
                        top: `${interactiveImgRect.top}px`,
                        width: `${interactiveImgRect.width}px`,
                        height: `${interactiveImgRect.height}px`,
                      }}
                    />
                  )}

                  {isCropModeActive && cropBox && (
                    <div
                      data-testid="interactive-crop-box"
                      onPointerDown={(e) => startInteractiveAction(e, "move")}
                      className="absolute border-2 border-white cursor-move select-none"
                      style={{
                        left: `${cropBox.x}px`,
                        top: `${cropBox.y}px`,
                        width: `${cropBox.width}px`,
                        height: `${cropBox.height}px`,
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                      }}
                    >
                      {/* Rule-of-thirds grid */}
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-r border-b border-white/30" />
                        <div className="border-b border-white/30" />
                        <div className="border-r border-white/30" />
                        <div className="border-r border-white/30" />
                        <div />
                      </div>

                      {/* 8 Corner & Edge Resize Handles */}
                      {RESIZE_HANDLES.map((h) => (
                        <div
                          key={h.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Resize crop ${h.id}`}
                          data-handle={h.id}
                          onPointerDown={(e) => startInteractiveAction(e, "resize", h.id)}
                          style={{ cursor: h.cursor }}
                          className={`absolute z-10 bg-white border-2 border-primary shadow-sm hover:scale-110 active:scale-110 select-none touch-none transition-transform ${h.className}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Cropper
                  image={internalSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onCropComplete={onCropCompleteCallback}
                  onZoomChange={setZoom}
                  minZoom={1}
                  maxZoom={3}
                  zoomSpeed={1}
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm">No image available to crop</p>
              </div>
            )}
          </div>

          {/* Controls & Zoom Slider (shown in crop mode) */}
          {(!allowOriginal || isCropModeActive) && (
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
                  onClick={handleReset}
                  disabled={
                    isSaving ||
                    (!allowResize && zoom === 1 && crop.x === 0 && crop.y === 0)
                  }
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs font-medium flex items-center gap-1 shrink-0"
                  title="Reset Position and Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Preview Section (shown in crop mode) */}
          {(!allowOriginal || isCropModeActive) && (
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Live Preview
                </h4>
                <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  Output: {outputWidth} × {outputHeight} px
                </span>
              </div>

              <div className="flex items-center justify-around gap-4 pt-1">
                {/* Circular Avatar Preview */}
                {showCircularPreview && (
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
                )}

                {/* Rectangular / Square Preview */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-32 h-20 rounded-xl overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-100 flex items-center justify-center p-1 relative"
                  >
                    <canvas
                      ref={squareCanvasRef}
                      width={previewCanvasWidth}
                      height={previewCanvasHeight}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium text-center">
                    {previewLabel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {allowOriginal && (
              <>
                {isCropModeActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCropModeActive(false);
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    disabled={isSaving}
                    className="cursor-pointer text-gray-700 hover:bg-gray-100 border-gray-300 text-xs sm:text-sm font-medium w-full sm:w-auto"
                  >
                    View Original
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCropModeActive(true)}
                    disabled={isSaving || !internalSrc}
                    className="cursor-pointer text-primary border-primary/40 hover:bg-primary/5 hover:border-primary text-xs sm:text-sm font-semibold flex items-center gap-1.5 w-full sm:w-auto"
                  >
                    <CropIcon className="w-4 h-4" />
                    Crop Image
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleUseOriginal}
                  disabled={isSaving || !internalSrc}
                  className="bg-gray-900 hover:bg-black text-white cursor-pointer min-w-32 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Use Original Image</span>
                  )}
                </Button>
              </>
            )}

            {(!allowOriginal || isCropModeActive) && (
              <Button
                type="button"
                onClick={handleSaveCrop}
                disabled={isSaving || !internalSrc || !croppedAreaPixels}
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer min-w-32 flex items-center justify-center gap-2 w-full sm:w-auto"
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
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

