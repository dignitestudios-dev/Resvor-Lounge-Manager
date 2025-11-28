"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EditFloorPlanModal = ({
  open,
  setOpen,
  onEditChange,
  isEdit,
  onSave = () => console.log("save profile (parent)"),
}) => {
  const [floorPlanImage, setFloorPlanImage] = useState(
    "/images/floor-plan.jpg"
  );
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFloorPlanImage(event.target?.result || "/images/floor-plan.jpg");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    if (isEdit) {
      console.log("Editing floor plan...");
      onEditChange(false);
    } else {
      if (onSave) {
        // call on save and pass data
      }
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-xl max-w-full">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {isEdit ? "Edit Floor Plan" : "Add Floor Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Floor Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Plan
            </label>
            <div
              className="w-full rounded-md overflow-hidden border border-gray-300 cursor-pointer"
              onClick={() => fileInputRef.current?.click()} // trigger file input
            >
              <Image
                src={floorPlanImage}
                alt="Map"
                width={400}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regular Tables
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Total Number of Tables"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIP Tables
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Total Number of VIP Tables"
            />
          </div>
        </div>

        <DialogFooter className="mt-8">
          <div className="w-full flex justify-center">
            <Button onClick={handleSave} className="w-full max-w-xs">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFloorPlanModal;
