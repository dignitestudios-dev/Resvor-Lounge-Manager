import * as Yup from "yup";

export const userDetailsSchema = Yup.object({
  name: Yup.string()
    .required("First name is required.")
    .test(
      "not-empty-after-trim",
      "First name cannot be empty or just spaces.",
      (value) => value?.trim().length > 0,
    )
    .test(
      "no-leading-space",
      "First name cannot start with a space.",
      (value) => (value ? !value.startsWith(" ") : true),
    )
    .test(
      "no-multiple-spaces",
      "First name cannot contain multiple spaces.",
      (value) => (value ? !/ {2,}/.test(value) : true),
    )
    .test("no-numbers", "First name cannot contain numbers.", (value) =>
      value ? !/\d/.test(value) : true,
    )
    .test(
      "first-letter-uppercase",
      "First letter must be uppercase.",
      (value) => (value ? /^[A-Z]/.test(value.trim()) : true),
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
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format."),

  number: Yup.string()
    .transform((value) => value.replace(/\D/g, "")) // Remove all non-numeric chars
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits.")
    .required("Please enter your phone number"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(50, "Password must not exceed 50 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one @ special character.",
    )
    .matches(/^[^\s]*$/, "Password should not contain spaces.")
    .trim()
    .required("Please enter your password"),
  cPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  acceptedPolicy: Yup.boolean()
    .required("You must accept the Terms & Conditions and Privacy Policy")
    .oneOf([true], "You must accept the Terms & Conditions and Privacy Policy"),
});
