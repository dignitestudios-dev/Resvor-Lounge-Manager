"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import { editFloorPlanSchema } from "@/lib/schema/profile/editFloorPlanSchema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const EditFloorPlanModal = ({
  open,
  setOpen,
  onEditChange,
  isEdit,
  lounge,
  isLoading,
  onSave = () => console.log("save profile (parent)"),
}) => {
  const [floorPlanImage, setFloorPlanImage] = useState(
    lounge?.floorPlan?.image?.location || "/images/floor-plan.jpg"
  );
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      floorPlanFile: null,
      regularTables: lounge?.floorPlan?.regularTables || "",
      vipTables: lounge?.floorPlan?.vipTables || "",
    },
    validationSchema: editFloorPlanSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      if (onSave) {
        onSave({
          floorPlanFile: values.floorPlanFile,
          regularTables: values.regularTables,
          vipTables: values.vipTables,
        });
      }
      if (isEdit) {
        onEditChange(false);
      }
      if (!isLoading) {
        setOpen(false);
      }
    },
  });

  const { values, handleBlur, handleChange, handleSubmit, errors, touched, setFieldValue, setFieldTouched } = formik;

  React.useEffect(() => {
    if (lounge && open) {
      formik.setValues({
        floorPlanFile: null,
        regularTables: lounge.floorPlan?.regularTables || "",
        vipTables: lounge.floorPlan?.vipTables || "",
      });
      setFloorPlanImage(lounge.floorPlan?.image?.location || "/images/floor-plan.jpg");
    }
  }, [lounge, open]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("floorPlanFile", file);
      setFieldTouched("floorPlanFile", true, false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFloorPlanImage(event.target?.result || "/images/floor-plan.jpg");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSave() {
    handleSubmit();
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
            {touched.floorPlanFile && errors.floorPlanFile && (
              <p className="text-red-600 text-xs mt-1">
                {errors.floorPlanFile}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regular Tables
            </label>
            <input
              type="number"
              name="regularTables"
              value={values.regularTables}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-md border ${errors.regularTables && touched.regularTables ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}`}
              placeholder="Total Number of Tables"
            />
            {errors.regularTables && touched.regularTables && (
              <p className="text-red-600 text-[12px] mt-1">
                {errors.regularTables}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIP Tables
            </label>
            <input
              type="number"
              name="vipTables"
              value={values.vipTables}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-md border ${errors.vipTables && touched.vipTables ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}`}
              placeholder="Total Number of VIP Tables"
            />
            {errors.vipTables && touched.vipTables && (
              <p className="text-red-600 text-[12px] mt-1">
                {errors.vipTables}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-8">
          <div className="w-full flex justify-center">
            <Button onClick={handleSave} disabled={isLoading} className="w-full max-w-xs flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFloorPlanModal;
