import * as Yup from "yup";

export const verifyEmailSchema = Yup.object({
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^[0-9]{5}$/, "OTP must be exactly 5 digits"),
});
