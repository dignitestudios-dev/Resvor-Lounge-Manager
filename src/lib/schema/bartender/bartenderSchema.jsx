import * as Yup from "yup";

// ─── Shared regex ────────────────────────────────────────────────────────────
// No special characters / symbols – allows letters, digits, spaces, hyphens, apostrophes
const NO_SPECIAL_CHARS = /^[A-Za-z0-9\s\-'.]+$/;

// ─── Create Bartender Schema ─────────────────────────────────────────────────
export const createBartenderSchema = Yup.object({
  profileImage: Yup.mixed()
    .nullable()
    .test("fileType", "Only JPG, JPEG, PNG files are allowed", (value) => {
      if (!value) return true; // optional
      return ["image/jpeg", "image/jpg", "image/png"].includes(value.type);
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    }),

  fullName: Yup.string()
    .required("Full name is required.")
    .min(1, "Full name must be at least 1 character.")
    .max(100, "Full name cannot exceed 100 characters.")

    // Not empty after trim
    .test(
      "not-empty-after-trim",
      "Full name cannot be empty or only spaces.",
      (value) => value?.trim().length > 0
    )

    // No leading spaces
    .test(
      "no-leading-space",
      "Full name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true)
    )

    // No multiple consecutive spaces
    .test(
      "no-multiple-spaces",
      "Full name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true)
    )

    // Only allowed characters:
    // Unicode letters, spaces, apostrophes, hyphens
    .matches(
      /^[\p{L}' -]+$/u,
      "Full name can only contain letters, spaces, hyphens (-), and apostrophes (')."
    )

    // Prevent numbers
    .test("no-numbers", "Full name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true
    )

    // Prevent HTML/script tags
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true
    )

    // Sentence Case / Title Case validation
    .test(
      "sentence-case",
      "Each word must start with a capital letter.",
      (value) =>
        value
          ? value
            .trim()
            .split(" ")
            .every((word) => /^[A-ZÀ-Ÿ][\p{L}'-]*$/u.test(word))
          : true
    ),

  email: Yup.string()
    .required("Email address is required")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false
    )
    .test(
      "no-spaces",
      "Email cannot contain spaces.",
      (value) =>
        value ? value.trim() === value && !/\s/.test(value) : false
    )
    .matches(
      /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format."
    ),

  phoneNumber: Yup.string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Phone number is required."),

  address: Yup.string()
    .required("Address is required")
    .test(
      "not-empty-after-trim",
      "Address cannot be empty or just spaces.",
      (value) => value?.trim().length > 0
    )
    .test(
      "no-leading-space",
      "Address cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true)
    )
    .min(5, "Address must be at least 5 characters long")
    .max(200, "Address must not exceed 200 characters"),

  password: Yup.string()
    .required("Password is required")
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must include at least one uppercase letter")
    .matches(/[a-z]/, "Password must include at least one lowercase letter")
    .matches(/\d/, "Password must include at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must include at least one special character"
    ),

  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

// ─── Edit Bartender Schema (no password fields) ───────────────────────────────
export const editBartenderSchema = Yup.object({
  profileImage: Yup.mixed()
    .nullable()
    .test("fileType", "Only JPG, JPEG, PNG files are allowed", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/jpg", "image/png"].includes(value.type);
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    }),

  fullName: Yup.string()
    .required("Full name is required.")
    .min(1, "Full name must be at least 1 character.")
    .max(100, "Full name cannot exceed 100 characters.")

    // Not empty after trim
    .test(
      "not-empty-after-trim",
      "Full name cannot be empty or only spaces.",
      (value) => value?.trim().length > 0
    )

    // No leading spaces
    .test(
      "no-leading-space",
      "Full name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true)
    )

    // No multiple consecutive spaces
    .test(
      "no-multiple-spaces",
      "Full name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true)
    )

    // Only allowed characters:
    // Unicode letters, spaces, apostrophes, hyphens
    .matches(
      /^[\p{L}' -]+$/u,
      "Full name can only contain letters, spaces, hyphens (-), and apostrophes (')."
    )

    // Prevent numbers
    .test("no-numbers", "Full name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true
    )

    // Prevent HTML/script tags
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true
    )

    // Sentence Case / Title Case validation
    .test(
      "sentence-case",
      "Each word must start with a capital letter.",
      (value) =>
        value
          ? value
            .trim()
            .split(" ")
            .every((word) => /^[A-ZÀ-Ÿ][\p{L}'-]*$/u.test(word))
          : true
    ),

  email: Yup.string()
    .required("Email address is required")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false
    )
    .test(
      "no-spaces",
      "Email cannot contain spaces.",
      (value) =>
        value ? value.trim() === value && !/\s/.test(value) : false
    )
    .matches(
      /^[A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format."
    ),

  phoneNumber: Yup.string()
    .transform((value) => (value ? value.replace(/\D/g, "") : ""))
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Phone number is required."),

  address: Yup.string()
    .required("Address is required")
    .test(
      "not-empty-after-trim",
      "Address cannot be empty or just spaces.",
      (value) => value?.trim().length > 0
    )
    .test(
      "no-leading-space",
      "Address cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true)
    )
    .min(5, "Address must be at least 5 characters long")
    .max(200, "Address must not exceed 200 characters"),
});

// ─── Update Password Schema ───────────────────────────────────────────────────
export const updateBartenderPasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),

  newPassword: Yup.string()
    .required("New password is required")
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must include at least one uppercase letter")
    .matches(/[a-z]/, "Password must include at least one lowercase letter")
    .matches(/\d/, "Password must include at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must include at least one special character"
    ),
});
