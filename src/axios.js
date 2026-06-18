import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { ErrorToast } from "./components/ui/toaster";

// Proxy configuration - similar to Vite setup
export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "/api" // Use Next.js rewrites proxy in development
    : "https://api-dev.resvor.com"; // Use direct URL in production


async function getDeviceFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  console.log(result.visitorId); // Unique device ID
  return result.visitorId;
}

const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // Enable automatic HTTP-only cookie handling
  headers: {
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

instance.interceptors.request.use(async (request) => {
  // Internet check
  if (!navigator.onLine) {
    return Promise.reject({
      code: "NO_INTERNET",
      message: "No internet connection",
    });
  }

  request.withCredentials = true;

  let fingerprint = "unknown-device";

  // Prevent hanging
  try {
    fingerprint = await Promise.race([
      getDeviceFingerprint(),

      new Promise((resolve) =>
        setTimeout(() => resolve("unknown-device"), 3000),
      ),
    ]);
  } catch (e) {
    console.log("Fingerprint failed");
  }

  const isFormData = request.data instanceof FormData;

  request.headers = {
    ...request.headers,
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),
    devicemodel: fingerprint,
    deviceuniqueid: fingerprint,
  };

  return request;
});

instance.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.config.url, {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Request error:", error.config?.url, {
      status: error.response?.status,
      message: error.message,
    });

    if (error.code === "ECONNABORTED") {
      ErrorToast("Your internet connection is slow. Please try again.");
    }

    if (error.response && error.response.status === 401) {
      ErrorToast("Session expired. Please relogin");
    }

    return Promise.reject(error);
  },
);

export default instance;
