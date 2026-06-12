import * as Yup from "yup";

export const userDetailsSchema = Yup.object({
  name: Yup.string()
    .required("Full name is required.")
    .min(1, "Full name must be at least 1 character.")
    .max(64, "Full name cannot exceed 64 characters.")

    // Not empty after trim
    .test(
      "not-empty-after-trim",
      "Full name cannot be empty or only spaces.",
      (value) => value?.trim().length > 0,
    )

    // No leading spaces
    .test(
      "no-leading-space",
      "Full name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )

    // No multiple consecutive spaces
    .test(
      "no-multiple-spaces",
      "Full name cannot contain multiple consecutive spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true),
    )

    // Only allowed characters:
    // Unicode letters, spaces, apostrophes, hyphens
    .matches(
      /^[\p{L}' -]+$/u,
      "Full name can only contain letters, spaces, hyphens (-), and apostrophes (').",
    )

    // Prevent numbers
    .test("no-numbers", "Full name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true,
    )

    // Prevent HTML/script tags
    .test("no-html", "HTML or script content is not allowed.", (value) =>
      value ? !/<[^>]*>|<\/[^>]*>/g.test(value) : true,
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
          : true,
    ),
  email: Yup.string()
    .required("Email is required")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false,
    )
    .test(
      "no-internal-or-trailing-space",
      "Email cannot contain spaces.",
      (value) => (value ? value.trim() === value && !/\s/.test(value) : false),
    )
    .matches(
      /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9][A-Za-z0-9._+-]*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
      "Invalid email format.",
    ),
  number: Yup.string()
    .transform((value) => value.replace(/\D/g, "")) // Remove all non-numeric chars
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Phone number is required."),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(50, "Password must not exceed 50 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    )
    .matches(/^[^\s]*$/, "Password should not contain spaces.")
    .trim()
    .required("Password is required."),
  cPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required."),
  acceptedPolicy: Yup.boolean()
    .required("You must accept the Terms & Conditions and Privacy Policy")
    .oneOf([true], "You must accept the Terms & Conditions and Privacy Policy"),
});
