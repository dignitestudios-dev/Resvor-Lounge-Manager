import { useMutation } from "@tanstack/react-query";
import axios from "../../../axios";
import { phoneToE164 } from "@/lib/utils";

// Helper function to convert data URL to File object
const dataURLtoFile = (dataurl, filename) => {
  try {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting data URL to File:", error);
    return null;
  }
};

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

export const submitLogout = async () => {
  const { data } = await axios.post("/auth/logout");
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
  if (payload.operatingHours && typeof payload.operatingHours === "string") {
    const hours = payload.operatingHours.split(" - ");
    if (hours.length === 2) {
      formData.append("operatingHours[open]", hours[0].trim());
      formData.append("operatingHours[close]", hours[1].trim());
    } else {
      formData.append("operatingHours[open]", payload.operatingHours);
      formData.append("operatingHours[close]", payload.operatingHours);
    }
  } else {
    formData.append("operatingHours[open]", "");
    formData.append("operatingHours[close]", "");
  }

  // Location
  formData.append("location[address]", payload.location);
  formData.append("location[coordinates][lat]", 0); // Default or from payload
  formData.append("location[coordinates][lng]", 1); // Default or from payload
  formData.append("regularTables", payload.regularTables);
  formData.append("vipTables", payload.vipTables);

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

  // Lounge Tags
  if (payload.loungeTags && Array.isArray(payload.loungeTags)) {
    payload.loungeTags.forEach((tag) => {
      formData.append("tags", tag);
    });
  }

  // Services
  if (payload.services && Array.isArray(payload.services)) {
    payload.services.forEach((service, serviceIndex) => {
      // Add service basic fields
      formData.append(`services[${serviceIndex}][name]`, service.serviceName);
      formData.append(`services[${serviceIndex}][price]`, service.price);
      formData.append(
        `services[${serviceIndex}][description]`,
        service.description,
      );

      // Add service images
      if (service.images && Array.isArray(service.images)) {
        service.images.forEach((image) => {
          let imageFile = image;

          // Check if image is a File object or data URL string
          if (image instanceof File) {
            imageFile = image;
          } else if (typeof image === "object" && image.url) {
            // Image is an object with url property (base64 data URL)
            imageFile = dataURLtoFile(image.url, image.name);
          }

          // Append image to FormData
          if (imageFile) {
            formData.append(`serviceImages_${serviceIndex}`, imageFile);
          }
        });
      }
    });
  }

  const { data } = await axios.post("/lounges", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const submitUpdateLounge = async (payload) => {
  const formData = new FormData();

  // Basic fields (only add if present in payload)
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.email !== undefined) formData.append("businessEmail", payload.email);
  if (payload.phone !== undefined) formData.append("businessPhone", phoneToE164(payload.phone));
  if (payload.specialization !== undefined) formData.append("specialization", payload.specialization);
  if (payload.description !== undefined) formData.append("description", payload.description);

  // Operating Hours
  if (payload.operatingHours !== undefined) {
    if (payload.operatingHours && typeof payload.operatingHours === "string") {
      const hours = payload.operatingHours.split(" - ");
      if (hours.length === 2) {
        formData.append("operatingHours[open]", hours[0].trim());
        formData.append("operatingHours[close]", hours[1].trim());
      } else {
        formData.append("operatingHours[open]", payload.operatingHours);
        formData.append("operatingHours[close]", payload.operatingHours);
      }
    } else if (payload.operatingHours === null) {
      formData.append("operatingHours[open]", "");
      formData.append("operatingHours[close]", "");
    }
  }

  // Location
  if (payload.location !== undefined) {
    formData.append("location[address]", payload.location);
    formData.append("location[coordinates][lat]", 0);
    formData.append("location[coordinates][lng]", 1);
  }

  // Tables
  if (payload.regularTables !== undefined) formData.append("regularTables", payload.regularTables);
  if (payload.vipTables !== undefined) formData.append("vipTables", payload.vipTables);

  // Logo File
  if (payload.userImage !== undefined && payload.userImage !== null) {
    formData.append("logo", payload.userImage);
  }

  // Images Array (Gallery)
  if (payload.images !== undefined && Array.isArray(payload.images)) {
    payload.images.forEach((image, index) => {
      let imageFile = image;
      if (typeof image === "string" && image.startsWith("data:")) {
        imageFile = dataURLtoFile(image, `gallery_image_${index}.png`);
      }
      if (imageFile) {
        formData.append("images", imageFile);
      }
    });
  }

  // Floor Plan Image
  if (payload.floorPlan !== undefined && payload.floorPlan !== null) {
    formData.append("floorPlanImage", payload.floorPlan);
  }

  // Lounge Tags
  if (payload.loungeTags !== undefined && Array.isArray(payload.loungeTags)) {
    payload.loungeTags.forEach((tag) => {
      formData.append("tags", tag);
    });
  }

  const { data } = await axios.patch("/lounges", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const switchLounge = async (payload) => {
  const { data } = await axios.patch("/lounges/switch", payload);

  return data;
};

export const submitWalletTopup = async (payload) => {
  const { data } = await axios.post("/wallet/topup/intent", payload);
  return data;
};

export const submitCreateCampaign = async (payload) => {
  const formData = new FormData();
  formData.append("channel", payload.channel || "email");
  formData.append("additionalInfo", payload.additionalInfo || "");

  if (payload.recipients && Array.isArray(payload.recipients)) {
    payload.recipients.forEach((email, index) => {
      formData.append(`recipients[${index}]`, email);
    });
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const { data } = await axios.post("/campaigns", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const retryCampaign = async (campaignId) => {
  const { data } = await axios.post(`/campaigns/${campaignId}/retry`);
  return data;
};

export const getCampaigns = async () => {
  const { data } = await axios.get("/campaigns");
  return data;
};

export const getCampaignById = async (campaignId) => {
  const { data } = await axios.get(`/campaigns/${campaignId}`);
  return data;
};

export const submitAddService = async (payload) => {
  const { data } = await axios.post("/lounges/services", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const submitUpdateService = async ({ serviceId, payload }) => {
  const { data } = await axios.patch(
    `/lounges/services/${serviceId}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};