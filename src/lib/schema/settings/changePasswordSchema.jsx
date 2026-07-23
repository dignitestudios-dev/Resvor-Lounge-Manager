import * as Yup from "yup";

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(60, "Password must not exceed 60 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character.",
    )
    .matches(/^[^\s]*$/, "Password should not contain spaces.")
    .trim()
    .required("New password is required."),
  cPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required."),
});
