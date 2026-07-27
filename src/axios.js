import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { ErrorToast } from "./components/ui/toaster";
import Cookies from "js-cookie";

// Proxy configuration - similar to Vite setup
// export const baseUrl =
//   process.env.NODE_ENV === "development"
//     ? "/api" // Use Next.js rewrites proxy in development
//     : "https://api-dev.resvor.com"; // Use direct URL in production

// export const baseUrl = "https://api-staging.resvor.com";
export const baseUrl = "https://api-dev.resvor.com";

async function getDeviceFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  console.log(result.visitorId); // Unique device ID
  return result.visitorId;
}

const instance = axios.create({
  baseURL: baseUrl,
  // withCredentials: true, // Enable automatic HTTP-only cookie handling
  headers: {
    Accept: "application/json",
  },
  timeout: 200000,
});

instance.interceptors.request.use(async (request) => {
  // Internet check — reject with a proper Error so axios and React Query handle it correctly
  if (!navigator.onLine) {
    const noInternetError = new Error("No internet connection. Please check your network and try again.");
    noInternetError.code = "NO_INTERNET";
    return Promise.reject(noInternetError);
  }


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

    // ── Handle no-internet / network errors first ──
    // Catches: NO_INTERNET (from request interceptor), ERR_NETWORK (axios native when DNS/TCP fails)
    if (error.code === "NO_INTERNET" || error.code === "ERR_NETWORK" || error.message === "Network Error") {
      // ErrorToast("No internet connection. Please check your network and try again.");
      return Promise.reject(error);
    }

    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data.error)) {
        const messages = data.error.map((err) => err.message).filter(Boolean);
        if (messages.length > 0) {
          data.message = messages.join(", ");
        }
      } else if (
        data.error &&
        typeof data.error === "object" &&
        data.error.message
      ) {
        data.message = data.error.message;
      } else if (data.error && typeof data.error === "string") {
        data.message = data.error;
      }
    }
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
