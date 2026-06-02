import * as Yup from "yup";

export const personalDetailsRemainingSchema = Yup.object({
  // From PersonalDetails (preserved validation)
  userImage: Yup.mixed()
    .required("Business logo is required")
    .test("fileType", "Only JPG, JPEG, PNG files are allowed", (value) => {
      if (!value) return false;
      return ["image/jpeg", "image/png"].includes(value.type);
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return false;
      return value.size <= 5 * 1024 * 1024;
    }),

  name: Yup.string()
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
    .min(3, "Lounge name must be at least 3 characters long")
    .max(50, "Lounge name must not exceed 50 characters"),

  email: Yup.string()
    .required("Business email is required")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false,
    )
    .test(
      "no-internal-or-trailing-space",
      "Email cannot contain spaces.",
      (value) => (value ? value.trim() === value && !/\s/.test(value) : false),
    )
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format."),

  phone: Yup.string()
    .transform((value) => value.replace(/\D/g, ""))
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Business phone number is required"),

  operatingHours: Yup.string()
    .required("Operating hours are required")
    .test(
      "not-empty-after-trim",
      "Operating hours cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .max(30, "Operating hours must not exceed 30 characters"),

  location: Yup.string()
    .required("Business location is required")
    .test(
      "not-empty-after-trim",
      "Location cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .max(100, "Location must not exceed 100 characters"),

  offers: Yup.string().max(60, "Offers must not exceed 60 characters"),

  role: Yup.string()
    .required("Role is required")
    .oneOf(["lounge_manager", "promoter"], "Invalid role selection"),

  // From PersonalDetailsRemaining (new validation)
  specialization: Yup.string()
    .required("Lounge specialization is required")
    .test(
      "not-empty-after-trim",
      "Specialization cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .min(10, "Specialization must be at least 10 characters long")
    .max(500, "Specialization must not exceed 500 characters"),

  images: Yup.array()
    .of(
      Yup.mixed().test(
        "fileType",
        "Only JPG, JPEG, PNG files are allowed",
        (value) => {
          if (!value) return true;
          return ["image/jpeg", "image/png"].includes(value.type);
        },
      ),
    )
    .min(1, "At least one lounge image is required")
    .max(5, "You can upload a maximum of 5 images"),

  description: Yup.string()
    .required("Lounge description is required")
    .test(
      "not-empty-after-trim",
      "Description cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .min(20, "Description must be at least 20 characters long")
    .max(500, "Description must not exceed 500 characters"),
});
