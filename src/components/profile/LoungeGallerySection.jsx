"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Eye,
  Plus,
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import AddGalleryImagesModal from "./AddGalleryImagesModal";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateLounge } from "@/lib/hooks/mutations/LoungeMutations";

const MAX_IMAGES = 20;

/**
 * Extracts a unique image identifier (_id, id, or url).
 */
const getImageId = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img._id || img.id || img.location || img.url || "";
};

/**
 * Extracts the image display URL.
 */
const getImageUrl = (img) => {
  if (!img) return "/images/lounge.jfif";
  if (typeof img === "string") return img;
  return img.url || img.location || "/images/lounge.jfif";
};

/**
 * LoungeGallerySection
 *
 * Implements full lounge gallery image management:
 * - Displays current images as thumbnails (3-4 columns)
 * - Remove action: calls PATCH /lounges with deleteImages: [imageId]
 * - Upload action: calls PATCH /lounges with multipart images: [files]
 * - Lightbox modal for full resolution previews
 */
const LoungeGallerySection = ({ activeLounge }) => {
  const queryClient = useQueryClient();
  const updateLoungeMutation = useUpdateLounge();

  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Local images state for optimistic UI updates
  const [localImages, setLocalImages] = useState(
    Array.isArray(activeLounge?.images) ? activeLounge.images : []
  );

  // Sync with activeLounge when query refreshes
  useEffect(() => {
    if (Array.isArray(activeLounge?.images)) {
      setLocalImages(activeLounge.images);
    }
  }, [activeLounge?.images]);

  const totalImages = localImages.length;
  const isMaxReached = totalImages >= MAX_IMAGES;
  const isPending = updateLoungeMutation.isPending;

  // ─── Handle Upload (PATCH /lounges with field name "images") ────────────────
  const handleUploadImages = async (newFiles) => {
    try {
      await updateLoungeMutation.mutateAsync({
        images: newFiles,
      });

      await queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
      await queryClient.invalidateQueries({ queryKey: ["lounges-list"] });

      SuccessToast("Gallery images uploaded successfully!");
      setOpenUploadModal(false);
    } catch (error) {
      console.error("Gallery upload error:", error);
      ErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload gallery images. Please try again."
      );
    }
  };

  // ─── Handle Remove (PATCH /lounges with deleteImages: [imageId]) ────────────
  const handleConfirmRemove = async () => {
    if (!imageToDelete) return;
    const targetId = getImageId(imageToDelete);

    try {
      setDeletingImageId(targetId);

      await updateLoungeMutation.mutateAsync({
        deleteImages: [targetId],
      });

      // Optimistically remove from local state
      setLocalImages((prev) => prev.filter((img) => getImageId(img) !== targetId));

      await queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
      await queryClient.invalidateQueries({ queryKey: ["lounges-list"] });

      SuccessToast("Image removed from gallery.");
      setImageToDelete(null);
    } catch (error) {
      console.error("Gallery remove error:", error);
      ErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to remove image. Please try again."
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-gray-900">Lounge Gallery</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isMaxReached
                  ? "bg-amber-100 text-amber-800"
                  : totalImages > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {totalImages} / {MAX_IMAGES} Images
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Showcase your lounge atmosphere, booths, bar, and events to visitors.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setOpenUploadModal(true)}
          disabled={isMaxReached || isPending}
          className="h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          title={isMaxReached ? "Maximum 20 images limit reached" : "Upload new gallery images"}
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Images</span>
        </Button>
      </div>

      {/* Gallery Grid */}
      {totalImages > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-1">
          {localImages.map((img, index) => {
            const imgId = getImageId(img) || `img_${index}`;
            const imgUrl = getImageUrl(img);
            const isDeletingThis = deletingImageId === imgId;

            return (
              <div
                key={imgId}
                className="group relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail image */}
                <img
                  src={imgUrl}
                  alt={`Lounge gallery photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/images/lounge.jfif";
                  }}
                />

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                  <div className="flex justify-end">
                    {/* Delete action button */}
                    <button
                      type="button"
                      onClick={() => setImageToDelete(img)}
                      disabled={isPending}
                      className="w-8 h-8 rounded-full bg-red-600/95 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                      title="Remove image"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white/90">
                      Photo {index + 1}
                    </span>
                    {/* View full-size button */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: imgUrl, index })}
                      className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-xs text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="View full-size"
                      aria-label="View full-size"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Deleting Spinner Overlay */}
                {isDeletingThis && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
                    <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                    <span className="text-xs font-medium">Removing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            No gallery images uploaded yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4 leading-relaxed">
            Upload photos of your venue, floor plan, VIP areas, or food and drinks
            to show guests what makes your lounge unique.
          </p>
          <Button
            type="button"
            onClick={() => setOpenUploadModal(true)}
            className="h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Images Now</span>
          </Button>
        </div>
      )}

      {/* Upload Images Modal */}
      <AddGalleryImagesModal
        open={openUploadModal}
        setOpen={setOpenUploadModal}
        currentCount={totalImages}
        isLoading={isPending}
        onUpload={handleUploadImages}
      />

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={Boolean(imageToDelete)}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Remove Gallery Image
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to remove this photo from your lounge gallery?
              This will call the server and delete it permanently.
            </DialogDescription>
          </DialogHeader>

          {imageToDelete && (
            <div className="my-3 rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-gray-100 flex items-center justify-center">
              <img
                src={getImageUrl(imageToDelete)}
                alt="Selected image preview"
                className="max-h-48 w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageToDelete(null)}
              disabled={Boolean(deletingImageId)}
              className="h-10 px-4 text-xs font-medium rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={Boolean(deletingImageId)}
              className="h-10 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {deletingImageId ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox / Full-size Preview Modal */}
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-3xl p-3 bg-black/95 border-none text-white overflow-hidden">
          <div className="flex items-center justify-between p-2">
            <span className="text-xs font-medium text-gray-300">
              {previewImage ? `Photo ${(previewImage.index ?? 0) + 1} of ${totalImages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {previewImage && (
            <div className="flex items-center justify-center max-h-[75vh] overflow-hidden rounded-lg">
              <img
                src={previewImage.url}
                alt="Full resolution preview"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LoungeGallerySection;
