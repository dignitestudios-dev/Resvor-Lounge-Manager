import * as Yup from "yup";

export const editProfileSchema = Yup.object({
  loungeName: Yup.string()
    .required("Lounge name is required")
    .test(
      "not-empty-after-trim",
      "Lounge name cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .test(
      "no-leading-space",
      "Lounge name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "not-only-numbers",
      "Lounge name cannot contain only numbers.",
      (value) => (value ? !/^\d+$/.test(value.trim()) : true),
    )
    .test(
      "not-only-special-characters",
      "Lounge name cannot contain only special characters.",
      (value) => (value ? !/^[^A-Za-z0-9]+$/.test(value.trim()) : true),
    )
    .test(
      "must-contain-letter",
      "Lounge name must contain at least one letter.",
      (value) => (value ? /[A-Za-z]/.test(value.trim()) : true),
    )
    .min(3, "Lounge name must be at least 3 characters long")
    .max(100, "Lounge name must not exceed 100 characters"),

  openingTime: Yup.string().required("Opening time is required"),
  closingTime: Yup.string().required("Closing time is required"),

  specialization: Yup.string()
    .required("Specialization is required")
    .test(
      "not-empty-after-trim",
      "Specialization cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .min(10, "Specialization must be at least 10 characters long")
    .max(250, "Specialization must not exceed 250 characters"),

  businessLocation: Yup.string()
    .required("Business location is required")
    .test(
      "not-empty-after-trim",
      "Location cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .max(100, "Location must not exceed 100 characters"),

  logoFile: Yup.mixed()
    .nullable()
    .test("fileType", "Only JPG, JPEG, PNG files are allowed", (value) => {
      if (!value) return true; // optional during edit
      return ["image/jpeg", "image/png"].includes(value.type);
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true; // optional during edit
      return value.size <= 5 * 1024 * 1024;
    }),
});
