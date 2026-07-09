import * as Yup from "yup";

export const editFloorPlanSchema = Yup.object({
  floorPlanFile: Yup.mixed()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true; // optional during edit
      return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        value.type
      );
    })
    .test(
      "fileSize",
      "Floor plan file size must be less than 10MB",
      (value) => {
        if (!value) return true; // optional during edit
        return value.size <= 10 * 1024 * 1024;
      }
    ),

  regularTables: Yup.number()
    .typeError("Regular tables must be a number")
    .required("Regular tables is required")
    .integer("Must be a whole number")
    .min(1, "Minimum is 1")
    .max(999, "Maximum is 999"),

  vipTables: Yup.number()
    .typeError("VIP tables must be a number")
    .required("VIP tables is required")
    .integer("Must be a whole number")
    .min(1, "Minimum is 1")
    .max(999, "Maximum is 999"),
});
