"use client";
import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
// Adjust this path to wherever your schema file actually lives
import { serviceSchema } from "@/lib/schema/services/servicesSchema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Upload } from "lucide-react";
import ConfirmPopup from "./ConfirmPopup";
import Edit2 from "../icons/Edit2";
import {
  useAddServiceMutation,
  useUpdateServiceMutation,
} from "@/lib/hooks/mutations/ServiceMutations";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorToast } from "../ui/toaster";

const BASE_IMAGE_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads`
    : "/uploads";

const AddServiceForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
  showTrigger = true,
}) => {
  const [serviceImages, setServiceImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const fileRef = useRef(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
    description: "",
  });

  // Track frontend validation errors
  const [errors, setErrors] = useState({});

  const { mutate: addService, isPending: adding } = useAddServiceMutation();
  const { mutate: updateService, isPending: updating } = useUpdateServiceMutation();
  const isPending = adding || updating;
  const queryClient = useQueryClient();

  const normalizeImages = (svc) => {
    if (!svc || !Array.isArray(svc.images)) return [];

    return svc.images.map((img, i) => {
      const resolvedUrl =
        img.url ||
        img.imageUrl ||
        img.secure_url ||
        img.location ||
        img.path ||
        img.src ||
        img.key ||
        (img.filename ? `${BASE_IMAGE_URL}/${img.filename}` : "");

      return {
        id: img._id || img.id || `existing-${i}`,
        url: resolvedUrl,
        name: img.filename || img.name || `image-${i}`,
        file: null,
        isExisting: true,
      };
    });
  };

  useEffect(() => {
    setErrors({});
    if (isEdit && data) {
      setFormData({
        serviceName: data.name || data.serviceName || "",
        price:
  data?.price !== undefined && data?.price !== null
    ? (Number(data.price) / 100).toString()
    : "",
        description: data.description || "",
      });
      setServiceImages(normalizeImages(data));
      setDeletedImageIds([]);
    } else {
      setFormData({
        serviceName: "",
        price: "",
        description: "",
      });
      setServiceImages([]);
      setDeletedImageIds([]);
    }
  }, [isEdit, data, isOpen]);

const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "price") {
    if (value === "" || Number(value) <= 1000) {
      setFormData((prev) => ({
        ...prev,
        price: value,
      }));
    }
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleImageChange = async (e) => {
  const selectedFiles = Array.from(e.target.files || []);
  if (!selectedFiles.length) return;

  const remainingSlots = 5 - serviceImages.length;
  if (remainingSlots <= 0) {
    e.target.value = "";
    return;
  }

  const validFiles = [];

  for (const file of selectedFiles.slice(0, remainingSlots)) {
    // Check file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      const errorMsg = "Only JPEG and PNG formats are allowed";
      ErrorToast(errorMsg);
      continue;
    }

    // Check file size (10MB limit)
   // Check file size (5MB limit)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

if (file.size > MAX_FILE_SIZE) {
  ErrorToast("File size must not exceed 5 MB");
  continue;
}
    // Check image resolution (215x215)
    // const isValidResolution = await validateImageResolution(file);
    // if (!isValidResolution) {
    //   const errorMsg = "Image resolution must be at least 215x215";
    //   ErrorToast(errorMsg);
    //   continue;
    // }

    validFiles.push(file);
  }

  if (!validFiles.length) {
    e.target.value = "";
    return;
  }

  const readFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({
          id: `${Date.now()}-${Math.random()}`,
          file,
          url: event.target.result,
          name: file.name,
          isExisting: false,
        });
      };
      reader.readAsDataURL(file);
    });

  const newImages = await Promise.all(validFiles.map(readFile));
  setServiceImages((prev) => [...prev, ...newImages]);

  if (errors.serviceImages) {
    setErrors((prev) => ({ ...prev, serviceImages: "" }));
  }

  e.target.value = "";
};

  const deleteImage = (index) => {
    setServiceImages((prev) => {
      const target = prev[index];
      if (target?.isExisting && target.file === null) {
        setDeletedImageIds((ids) =>
          ids.includes(target.id) ? ids : [...ids, target.id]
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  };

 const replaceImage = (index, e) => {
  const file = e.target.files?.[0];
  if (!file) return;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    ErrorToast("Only JPEG and PNG formats are allowed");
    e.target.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    ErrorToast("File size must not exceed 10 MB");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    setServiceImages((prev) => {
      const updated = [...prev];
      const target = updated[index];

      if (target?.isExisting) {
        setDeletedImageIds((ids) =>
          ids.includes(target.id) ? ids : [...ids, target.id]
        );
      }

      updated[index] = {
        ...target,
        file,
        url: event.target.result,
        name: file.name,
        isExisting: false,
      };

      return updated;
    });
  };

  reader.readAsDataURL(file);
  e.target.value = "";
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data block matching the structure expected by your external schema
   const validationData = {
  serviceName: formData.serviceName,
  price: formData.price === "" ? undefined : Number(formData.price),
  description: formData.description,
  serviceImages,
};
    try {
      // Execute the imported serviceSchema with your isEdit flag
      await serviceSchema(isEdit).validate(validationData, { abortEarly: false });
      setErrors({});
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return; // Stop execution if validation fails
    }

    const priceInCents = Math.round(Number(formData.price) * 100);


    const payload = new FormData();
    payload.append("name", formData.serviceName);
payload.append("price", priceInCents);
    payload.append("description", formData.description);

    serviceImages.forEach((img) => {
      if (img.file) {
        payload.append("serviceImages", img.file);
      }
    });

    if (isEdit) {
      deletedImageIds.forEach((id) => {
        payload.append("deleteImages", id);
      });
    }

    const resetForm = () => {
      setFormData({
        serviceName: "",
        price: "",
        description: "",
      });
      setServiceImages([]);
      setDeletedImageIds([]);
      setErrors({});
    };

    const onSuccess = (res) => {
      queryClient.invalidateQueries(["services"]);
      onOpenChange(false);
      setConfirmPopup(true);
      resetForm();
    };

    const onError = (err) => {
      console.log("🚀 ~ onError ~ err:", err)
      ErrorToast(err.response.data.message);
    };

    if (isEdit && data?._id) {
      updateService({ serviceId: data._id, payload }, { onSuccess, onError });
    } else {
      addService(payload, { onSuccess, onError });
    }
  };

  

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger>
            {isEdit ? (
              <Button className={"w-14! h-14!"}>
                <Edit2 className="scale-150 cursor-pointer" />
              </Button>
            ) : (
              <Button className={"border-2 h-12 text-[14px] px-6"}>
                Add New Service
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isEdit ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription asChild>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Service Name */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Service Name
                  </Label>
                  <Input
                    name="serviceName"
                    placeholder="Enter service name"
                    className={`h-12 ${errors.serviceName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    maxlength={100}
                  />
                  {errors.serviceName && (
                    <span className="text-xs text-red-500">{errors.serviceName}</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Price
                  </Label>
                <Input
  name="price"
  type="number"
  min="0"
  max="1000"
  step="0.01"
  placeholder="0.00"
  className={`h-12 ${
    errors.price
      ? "border-red-500 focus-visible:ring-red-500"
      : ""
  }`}
  value={formData.price}
  onChange={handleInputChange}
/>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Description
                  </Label>
                 <Textarea
  name="description"
  placeholder="Describe your service"
  className={`min-h-[100px] w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden ${
    errors.description
      ? "border-red-500 focus-visible:ring-red-500"
      : ""
  }`}
  value={formData.description}
  onChange={handleInputChange}
  maxLength={250}
/>
                  {errors.description && (
                    <span className="text-xs text-red-500 ">{errors.description}</span>
                  )}
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-black">
                    Service Images{" "}
                    <span className="text-gray-400 text-xs">
                      ({serviceImages.length}/5)
                    </span>
                  </Label>

                  {serviceImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {serviceImages.map((img, index) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-20 h-20 rounded-lg object-cover border bg-gray-100"
                            onError={(e) => {
                              console.warn("Failed to load image. Object was:", img);
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/service.jpg";
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => deleteImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm hover:bg-red-600"
                          >
                            ×
                          </button>

                          <label className="absolute inset-0 rounded-lg bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => replaceImage(index, e)}
                            />
                            <span className="text-white text-xs font-medium">
                              Replace
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {serviceImages.length < 5 ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50 transition ${errors.serviceImages ? "border-red-500" : ""}`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Choose file to upload
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-red-500 text-sm">
                      Maximum 5 images allowed
                    </div>
                  )}

                  <Input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {errors.serviceImages && (
                    <span className="text-xs text-red-500 mt-1">{errors.serviceImages}</span>
                  )}
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 text-lg"
                >
                  {isPending ? "Saving..." : isEdit ? "Update" : "Save"}
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <ConfirmPopup
        isOpen={confirmPopup}
        onOpenChange={setConfirmPopup}
        isEdit={isEdit}
      />
    </>
  );
};

export default AddServiceForm;