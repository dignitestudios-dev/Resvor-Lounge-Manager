import { useMutation } from "@tanstack/react-query";
import axios from "../../../axios";
import { phoneToE164 } from "@/lib/utils";

// Example: Login Mutation
export const submitLogin = async (credentials) => {
  const { data } = await axios.post("/auth/login", credentials);
  return data;
};

export const submitForgotPassword = async (credentials) => {
  const { data } = await axios.post("/auth/forgot", credentials);
  return data;
};

export const submitVerifyForgotEmail = async (credentials) => {
  const { data } = await axios.post("/auth/verify-otp", credentials);
  return data;
};

export const submitUpdatePassword = async (credentials) => {
  const { data } = await axios.post("/auth/update-password", credentials);
  return data;
};

export const submitResendForgotOtp = async (credentials) => {
  const { data } = await axios.post(
    "/auth/email-verification-otp",
    credentials,
  );
  return data;
};

export const submitSignUp = async (payload) => {
  const { data } = await axios.post("/auth/onboarding/register", payload);
  return data;
};

export const submitVerifyEmail = async (credentials) => {
  const { data } = await axios.post(
    "/auth/onboarding/verify-email",
    credentials,
  );
  return data;
};

export const submitVerifyMobileNumber = async (credentials) => {
  const { data } = await axios.post(
    "/auth/onboarding/verify-mobile-number",
    credentials,
  );
  return data;
};

export const submitCreateLounge = async (payload) => {
  // Format combined data into FormData
  const formData = new FormData();

  // Basic fields
  formData.append("name", payload.name);
  formData.append("businessEmail", payload.email);
  formData.append("businessPhone", phoneToE164(payload.phone));
  formData.append("specialization", payload.specialization);
  formData.append("description", payload.description);
  // formData.append("role", payload.role);
  // formData.append("offers", payload.offers);

  // Operating Hours
  formData.append("operatingHours[open]", payload.operatingHours);
  formData.append("operatingHours[close]", payload.operatingHours); // Adjust if needed

  // Location
  formData.append("location[address]", payload.location);
  formData.append("location[coordinates][lat]", 0); // Default or from payload
  formData.append("location[coordinates][lng]", 1); // Default or from payload

  // Logo File
  if (payload.userImage) {
    formData.append("logo", payload.userImage);
  }

  // Images Array
  if (payload.images && Array.isArray(payload.images)) {
    // formData.append(`images`, payload.images[0]);

    payload.images.forEach((image, index) => {
      formData.append(`images`, image);
    });
  }

  // Floor Plan Image
  if (payload.floorPlan) {
    formData.append("floorPlanImage", payload.floorPlan);
  }

  for (let pair of formData.entries()) {
    console.log("formdata--->", pair[0], pair[1]);
  }
  console.log("test", formData instanceof FormData);

  const { data } = await axios.post("/lounges", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
