"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload, X } from "lucide-react";

const AddGalleryImagesModal = ({ open, setOpen, onAdd }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [inputKey, setInputKey] = useState(0);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setGalleryImages((prev) => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });
    // Reset input to allow selecting the same files again
    setInputKey((prev) => prev + 1);
  };

  const handleRemoveImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    console.log("Images added:", galleryImages);
    if (onAdd) {
      onAdd(galleryImages);
    }
    // Reset and close
    setGalleryImages([]);
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Reset images when modal closes
      setGalleryImages([]);
      setInputKey((prev) => prev + 1);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Add Gallery Images
          </DialogTitle>
          <DialogDescription>
            <form className="mt-4 space-y-4">
              {/* Image Upload */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="galleryImages"
                  className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50 transition"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Choose files to upload
                  </span>
                  <Input
                    key={inputKey}
                    id="galleryImages"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Image Previews Grid */}
              {galleryImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Selected Images ({galleryImages.length})
                  </p>
                  <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                    {galleryImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-full h-[100px] bg-cover bg-center rounded-md overflow-hidden border border-gray-200"
                        style={{ backgroundImage: `url(${img})` }}
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleAdd}
                disabled={galleryImages.length === 0}
                className="w-full h-14 text-lg"
              >
                Add Images
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddGalleryImagesModal;
