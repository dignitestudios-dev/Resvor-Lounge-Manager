import axios from "axios";

/**
 * Configured API Base URL.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.resvor.com";

/**
 * Normalizes a phone number to E.164 format.
 */
export const formatPhoneToE164 = (formattedPhone, countryCode = "+1") => {
  if (!formattedPhone) return "";
  const digits = String(formattedPhone).replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("0") ? digits.slice(1) : digits;
  return `${countryCode}${normalized}`;
};

/**
 * Returns the universal public guestbook URL.
 * Never includes lounge IDs, manager IDs, tokens, or event IDs.
 */
export const getPublicGuestbookUrl = () => {
  if (process.env.NEXT_PUBLIC_GUESTBOOK_URL) {
    return process.env.NEXT_PUBLIC_GUESTBOOK_URL;
  }
  if (process.env.PUBLIC_GUESTBOOK_URL) {
    return process.env.PUBLIC_GUESTBOOK_URL;
  }

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL ||
    process.env.PUBLIC_WEB_URL;

  if (webUrl) {
    return `${webUrl.replace(/\/+$/, "")}/guestbook-entry`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/guestbook-entry`;
  }

  return "https://www.resvor.com/guestbook-entry";
};

/**
 * Dedicated public axios instance.
 * Completely decoupled from auth tokens and session expiration interceptors.
 */
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 45000,
});

publicApiClient.interceptors.request.use((config) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const error = new Error("No internet connection. Please check your network and try again.");
    error.code = "NO_INTERNET";
    return Promise.reject(error);
  }
  return config;
});

/**
 * Fetch active lounges for public guestbook.
 * GET /guestbook/public/lounges
 */
export const getPublicGuestbookLounges = async () => {
  const response = await publicApiClient.get("/guestbook/public/lounges");
  return response.data;
};

/**
 * Submit a public guestbook entry.
 * POST /guestbook/public
 * Uses multipart/form-data with browser boundary.
 */
export const createPublicGuestbookEntry = async (formData) => {
  const response = await publicApiClient.post("/guestbook/public", formData);
  return response.data;
};

/**
 * Serializes guestbook form values into a FormData instance.
 * Ensures fields adhere strictly to the backend API requirements.
 */
export const buildPublicGuestbookFormData = (values = {}) => {
  const formData = new FormData();

  if (values.loungeId) {
    formData.append("loungeId", values.loungeId);
  }

  if (typeof values.firstName === "string" && values.firstName.trim()) {
    formData.append("firstName", values.firstName.trim());
  }

  if (typeof values.lastName === "string" && values.lastName.trim()) {
    formData.append("lastName", values.lastName.trim());
  }

  if (typeof values.email === "string" && values.email.trim()) {
    formData.append("email", values.email.trim());
  }

  if (typeof values.company === "string" && values.company.trim()) {
    formData.append("company", values.company.trim());
  }

  if (typeof values.title === "string" && values.title.trim()) {
    formData.append("title", values.title.trim());
  }

  if (typeof values.website === "string" && values.website.trim()) {
    formData.append("website", values.website.trim());
  }

  if (typeof values.nickname === "string" && values.nickname.trim()) {
    formData.append("nickname", values.nickname.trim());
  }

  const street = values.address?.street?.trim() || "";
  const city = values.address?.city?.trim() || "";
  const state = values.address?.state?.trim() || "";
  const zip = values.address?.zip?.trim() || "";

  if (street || city || state || zip) {
    formData.append(
      "address",
      JSON.stringify({
        ...(street ? { street } : {}),
        ...(city ? { city } : {}),
        ...(state ? { state } : {}),
        ...(zip ? { zip } : {}),
        country: "United States",
      })
    );
  }

  const facebook = values.socialNetwork?.facebook?.trim() || "";
  const twitter = values.socialNetwork?.twitter?.trim() || "";
  const linkedin = values.socialNetwork?.linkedin?.trim() || "";
  const instagram = values.socialNetwork?.instagram?.trim() || "";

  if (facebook || twitter || linkedin || instagram) {
    formData.append(
      "socialNetwork",
      JSON.stringify({
        ...(facebook ? { facebook } : {}),
        ...(twitter ? { twitter } : {}),
        ...(linkedin ? { linkedin } : {}),
        ...(instagram ? { instagram } : {}),
      })
    );
  }

  if (typeof values.phoneNumber === "string" && values.phoneNumber.trim()) {
    const raw = values.phoneNumber.trim();
    const formatted = raw.startsWith("+") ? raw : formatPhoneToE164(raw);
    formData.append("phoneNumber", formatted);
  }

  if (
    values.birthMonth !== undefined &&
    values.birthMonth !== null &&
    String(values.birthMonth).trim() !== ""
  ) {
    formData.append("birthMonth", String(values.birthMonth));
  }

  if (typeof values.details === "string" && values.details.trim()) {
    formData.append("details", values.details.trim());
  }

  const specialDates = Array.isArray(values.specialDates)
    ? values.specialDates.filter(
        (item) => item?.title?.trim() && item?.date?.trim()
      ).map((item) => ({
        title: item.title.trim(),
        date: item.date.trim(),
      }))
    : [];

  formData.append("specialDates", JSON.stringify(specialDates));

  if (values.photo instanceof File || values.photo instanceof Blob) {
    formData.append("photo", values.photo);
  }

  return formData;
};
