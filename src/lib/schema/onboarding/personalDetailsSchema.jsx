import * as Yup from "yup";

export const personalDetailsSchema = Yup.object({
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

    // Empty after trim
    .test(
      "not-empty-after-trim",
      "Lounge name cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )

    // No leading space
    .test(
      "no-leading-space",
      "Lounge name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )

    // Prevent only numbers
    .test(
      "not-only-numbers",
      "Lounge name cannot contain only numbers.",
      (value) => (value ? !/^\d+$/.test(value.trim()) : true),
    )

    // Prevent only special characters
    .test(
      "not-only-special-characters",
      "Lounge name cannot contain only special characters.",
      (value) => (value ? !/^[^A-Za-z0-9]+$/.test(value.trim()) : true),
    )

    // Must contain at least one letter
    .test(
      "must-contain-letter",
      "Lounge name must contain at least one letter.",
      (value) => (value ? /[A-Za-z]/.test(value.trim()) : true),
    )

    .min(3, "Lounge name must be at least 3 characters long")

    .max(100, "Lounge name must not exceed 100 characters"),
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
    .matches(
      /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format.",
    ),

  phone: Yup.string()
    .transform((value) => value.replace(/\D/g, ""))
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Business phone number is required"),

  // operatingHours: Yup.string()
  //   .required("Operating hours are required")
  //   .test(
  //     "not-empty-after-trim",
  //     "Operating hours cannot be empty or just spaces.",
  //     (value) => value?.trim().length > 0,
  //   )
  //   .max(30, "Operating hours must not exceed 30 characters"),

  openingTime: Yup.string().required("Opening time is required"),

  closingTime: Yup.string().required("Closing time is required"),
  // .test(
  //   "is-after-opening",
  //   "Closing time must be after opening time",
  //   function (value) {
  //     const { openingTime } = this.parent;

  //     if (!openingTime || !value) return true;

  //     return value > openingTime;
  //   },
  // ),

  location: Yup.string()
    .required("Business location is required")
    .test(
      "not-empty-after-trim",
      "Location cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .max(100, "Location must not exceed 100 characters"),

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
    .max(5, "You can upload a maximum of 5 images"),

  description: Yup.string().max(
    250,
    "Description must not exceed 250 characters",
  ),

  role: Yup.string()
    .required("Role is required")
    .oneOf(["lounge_manager", "promoter"], "Invalid role selection"),

  loungeTags: Yup.array()
    .of(
      Yup.string()
        .min(2, "Each tag must be at least 2 characters")
        .max(25, "Each tag must not exceed 25 characters")
    )
    .min(1, "At least one tag is required")
    .max(10, "Maximum of 10 tags allowed")
    .required("Lounge tags are required"),
});
