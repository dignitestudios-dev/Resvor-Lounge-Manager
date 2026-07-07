import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { ErrorToast } from "./components/ui/toaster";
import Cookies from "js-cookie";

// Proxy configuration - similar to Vite setup
// export const baseUrl =
//   process.env.NODE_ENV === "development"
//     ? "/api" // Use Next.js rewrites proxy in development
//     : "https://api-dev.resvor.com"; // Use direct URL in production

export const baseUrl = "https://api-staging.resvor.com";
// export const baseUrl = "https://api-dev.resvor.com";

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
  timeout: 200000,
});

instance.interceptors.request.use(async (request) => {
  // Internet check
  if (!navigator.onLine) {
    console.log("Network Error");
    return Promise.reject({
      code: "NO_INTERNET",
      message: "No internet connection",
    });
  }

  request.withCredentials = true;

  const token = Cookies.get("token") || Cookies.get("authorization");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

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

    const token =
      response.data?.token ||
      response.data?.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.accessToken ||
      response.data?.authorization ||
      response.data?.data?.authorization;
    if (token) {
      Cookies.set("token", token, { expires: 7, path: "/" });
      Cookies.set("authorization", token, { expires: 7, path: "/" });
    }

    if (response.config.url?.endsWith("/auth/logout")) {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("authorization", { path: "/" });
      Cookies.remove("sessionType", { path: "/" });
      Cookies.remove("onboardingStep", { path: "/" });
      Cookies.remove("user", { path: "/" });
    }

    return response;
  },
  (error) => {
    console.error("❌ Request error:", error.config?.url, {
      status: error.response?.status,
      message: error.message,
    });
    const isAuthRoute = window.location.pathname.startsWith("/auth/login");

    if (error.code === "ECONNABORTED") {
      ErrorToast("Your internet connection is slow. Please try again.");
    }

    if (error?.response?.status === 401 && !isAuthRoute) {
      const hasCookie = Cookies.get("token") || Cookies.get("authorization");
      Cookies.remove("token", { path: "/" });
      Cookies.remove("authorization", { path: "/" });
      Cookies.remove("sessionType", { path: "/" });
      Cookies.remove("onboardingStep", { path: "/" });
      Cookies.remove("user", { path: "/" });

      if (hasCookie) {
        ErrorToast("Session expired. Please log in again.");
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
