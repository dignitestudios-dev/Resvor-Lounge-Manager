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
      setSelectedImage(images[0].location || images[0].url || images[0].src);
    } else {
      setSelectedImage("/images/service.jpg");
    }
  }, [service]);

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl p-0 w-full">
        {/* Header */}
        <DialogHeader className=" bg-white px-6 py-5">
          {/* <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900 break-words break-all">
            {service.serviceName || service.name}
          </DialogTitle> */}
        </DialogHeader>

        {/* Top Section */}
        <div className="grid gap-6 p-6 md:grid-cols-1">
          {/* LEFT */}
          <div className="w-full min-w-0 overflow-hidden flex flex-col">
            {/* Main Image */}
            <div className="w-full h-64 md:h-72 overflow-hidden rounded-2xl border bg-slate-100 shadow-sm flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt={service.serviceName || service.name}
                className="h-full w-full object-contain transition duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/service.jpg";
                }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2.5 flex-wrap w-full max-w-full">
                {images.map((image, index) => {
                  const imgUrl = image.location || image.url || image.src;
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={image._id || image.id || index}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all bg-slate-50 flex items-center justify-center p-0.5 ${isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-indigo-400"
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={image.filename || `service-img-${index}`}
                        className="h-full w-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/service.jpg";
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          {/* Price */}
          <div className="rounded-2xl p-5 bg-slate-50 border">
            <p className="text-xs uppercase font-semibold tracking-wider text-gray-500">
              Price
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-800 break-words break-all">
              ${(Number(service.price) / 100).toFixed(2)}
            </h2>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            {service.category && (
              <div className="rounded-xl border bg-white p-4 min-w-0">
                <p className="text-xs uppercase text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-semibold text-slate-800 break-words break-all">
                  {service.category}
                </p>
              </div>
            )}

            {service.duration && (
              <div className="rounded-xl border bg-white p-4 min-w-0">
                <p className="text-xs uppercase text-gray-500">
                  Duration
                </p>

                <p className="mt-1 font-semibold text-slate-800 break-words break-all">
                  {service.duration}
                </p>
              </div>
            )}

            <div className="col-span-2 rounded-xl border bg-white p-4 min-w-0">
              <p className="text-xs uppercase text-gray-500">
                Created At
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

        </div>

        <div className="p-6 ">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">
            Service Name
          </h3>
          <p className="whitespace-pre-wrap break-words break-all leading-relaxed text-slate-600 text-sm">
            {service.serviceName || service.name}
          </p>
        </div>

        {/* Description */}
        <div className="border-t bg-slate-50 px-6 py-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">
            Description
          </h3>

          <div className="rounded-xl border bg-white p-5 shadow-sm min-w-0">
            <p className="whitespace-pre-wrap break-words break-all leading-relaxed text-slate-600 text-sm">
              {service.description || "No description available."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewServiceModal;