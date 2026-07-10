"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ViewServiceModal = ({
  isOpen,
  onOpenChange,
  service,
}) => {
  const images = service?.images || [];

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (images.length) {
      setSelectedImage(images[0].location);
    } else {
      setSelectedImage("/images/service.jpg");
    }
  }, [service]);

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">        {/* Header */}
        <DialogHeader className="border-b bg-white px-6 py-5">
          <DialogTitle className="text-3xl font-bold text-slate-900">
            {service.serviceName || service.name}
          </DialogTitle>
        </DialogHeader>

        {/* Top Section */}
        <div className="grid gap-8 p-6 md:grid-cols-2">
          {/* LEFT */}
          <div>
            {/* Main Image */}
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-gray-100 shadow-sm">
              <img
                src={selectedImage}
                alt={service.serviceName || service.name}
                className="h-full w-full object-contain transition duration-300"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image) => (
                  <button
                    key={image._id}
                    onClick={() => setSelectedImage(image.location)}
                    className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === image.location
                        ? " border-indigo-600"
                        : "border-gray-200 hover:border-indigo-400"
                    }`}
                  >
                    <img
                      src={image.location}
                      alt={image.filename}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Price */}
            <div className="rounded-2xl  p-6 text-white border">
              <p className="text-sm uppercase tracking-widest  text-gray-500">
                Price
              </p>

              <h2 className="mt-2 text-4xl font-bold text-slate-800">
                ${(Number(service.price) / 100).toFixed(2)}
              </h2>
 
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              {service.category && (
                <div className="rounded-xl  bg-white p-4 ">
                  <p className="text-xs uppercase text-gray-500">
                    Category
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {service.category}
                  </p>
                </div>
              )}

              {service.duration && (
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-gray-500">
                    Duration
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    {service.duration}
                  </p>
                </div>
              )}

              <div className="col-span-2 rounded-xl border bg-white p-4 ">
                <p className="text-xs uppercase text-gray-500">
                  Created At
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {new Date(service.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
       {/* Description */}
<div className="border-t bg-slate-50 px-6 py-6">
  <h3 className="mb-4 text-xl font-semibold text-slate-900">
    Description
  </h3>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="whitespace-pre-line break-words leading-8 text-slate-600">
      {service.description || "No description available."}
    </p>
  </div>
</div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewServiceModal;