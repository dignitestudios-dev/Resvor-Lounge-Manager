
import * as Yup from "yup";

// ─── Create Bartender Schema ─────────────────────────────────────────────
export const createBartenderSchema = Yup.object({
  profileImage: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, and WEBP files are allowed",
      (value) => {
        if (!value) return true;
        return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(value.type);
      }
    )
    .test(
      "fileSize",
      "File size must be less than 5MB",
      (value) => !value || value.size <= 5 * 1024 * 1024
    ),

  fullName: Yup.string()
    .trim()
    .required("Full name is required.")
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  jobTitle: Yup.string()
    .trim()
    .required("Job Title is required.")
    .min(2, "Job Title must be at least 2 characters.")
    .max(100, "Job Title cannot exceed 100 characters."),

  email: Yup.string()
    .trim()
    .email("Invalid email format.")
    .required("Email address is required."),

  phoneNumber: Yup.string()
  .required("Phone number is required.")
  .test(
    "valid-phone",
    "Phone number must be exactly 10 digits.",
    (value) => {
      if (!value) return false;

      const digits = value.replace(/\D/g, "");

      // Allow 10 digits or 11 digits with US country code (1)
      return (
        digits.length === 10 ||
        (digits.length === 11 && digits.startsWith("1"))
      );
    }
  ),

  address: Yup.string()
    .trim()
    .required("Address is required.")
    .min(5, "Address must be at least 5 characters.")
    .max(200, "Address cannot exceed 200 characters."),

  password: Yup.string()
    .required("Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .matches(/[A-Z]/, "Password must include an uppercase letter.")
    .matches(/[a-z]/, "Password must include a lowercase letter.")
    .matches(/[0-9]/, "Password must include a number.")
    .matches(/[^A-Za-z0-9]/, "Password must include a special character."),

  confirmPassword: Yup.string()
    .required("Please confirm your password.")
    .oneOf([Yup.ref("password")], "Passwords do not match."),
});

// ─── Edit Bartender Schema ───────────────────────────────────────────────
export const editBartenderSchema = Yup.object({
  profileImage: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, and WEBP files are allowed",
      (value) => {
        if (!value || value === "remove") return true;
        return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(value.type);
      }
    )
    .test(
      "fileSize",
      "File size must be less than 5MB",
      (value) => !value || value === "remove" || value.size <= 5 * 1024 * 1024
    ),

  jobTitle: Yup.string()
    .trim()
    .required("Job Title is required.")
    .min(2, "Job Title must be at least 2 characters.")
    .max(100, "Job Title cannot exceed 100 characters."),

  address: Yup.string()
    .trim()
    .required("Address is required.")
    .min(5, "Address must be at least 5 characters.")
    .max(200, "Address cannot exceed 200 characters."),
});

// ─── Update Password Schema ──────────────────────────────────────────────
export const updateBartenderPasswordSchema = Yup.object({
  currentPassword: Yup.string()
    .required("Current password is required."),

  newPassword: Yup.string()
    .required("New password is required.")
    .min(8, "Password must be at least 8 characters.")
    .matches(/[A-Z]/, "Password must include an uppercase letter.")
    .matches(/[a-z]/, "Password must include a lowercase letter.")
    .matches(/[0-9]/, "Password must include a number.")
    .matches(/[^A-Za-z0-9]/, "Password must include a special character."),
});
