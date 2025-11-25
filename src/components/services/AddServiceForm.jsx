"use client";
import React, { useState, useEffect } from "react";
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

const AddServiceForm = ({
  isOpen,
  onOpenChange,
  data = null,
  isEdit = false,
}) => {
  const [serviceImage, setServiceImage] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
    description: "",
  });

  // Pre-populate form data when editing
  useEffect(() => {
    if (isEdit && data) {
      setFormData({
        serviceName: data.serviceName || "",
        price: data.price || "",
        description: data.description || "",
      });
      setServiceImage(data.serviceImage || null);
    } else {
      setFormData({
        serviceName: "",
        price: "",
        description: "",
      });
      setServiceImage(null);
    }
  }, [isEdit, data, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setServiceImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data: ", formData);
    console.log("Is Edit: ", isEdit);
    onOpenChange(false);
    setConfirmPopup(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                    className="h-12"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                  />
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
                    step="0.01"
                    placeholder="$"
                    className="h-12"
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
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium text-black">
                    Service Images{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </Label>

                  <label
                    htmlFor="serviceImage"
                    className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50 transition"
                  >
                    {serviceImage ? (
                      <img
                        src={serviceImage}
                        alt="Service Preview"
                        className="w-40 h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Choose file to upload
                        </span>
                      </>
                    )}
                    <Input
                      id="serviceImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Save Button */}
                <Button type="submit" className="w-full h-12 text-lg">
                  {isEdit ? "Update" : "Save"}
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
