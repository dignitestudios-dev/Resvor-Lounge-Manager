import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]+$/;
  return re.test(phone);
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateWithName = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US");
};

export const formatTime = (isoString, format) => {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return { error: "Invalid ISO date" };

  const pad = (num) => String(num).padStart(2, "0");

  // 24-hour format
  const hours24 = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const time24 = `${hours24}:${minutes}`;

  // 12-hour format
  const hours12 = pad(date.getHours() % 12 || 12);
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const time12 = `${hours12}:${minutes} ${ampm}`;

  return format === "12" ? time12 : time24;
};

export const formatTime12 = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const hours12 = pad(hours % 12 || 12);
  const ampm = hours >= 12 ? "PM" : "AM";

  return `${hours12}:${minutes} ${ampm}`;
};

// String utilities
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

// Number utilities
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (num, fractionDigits = 2) => {
  return num
    ? num > 0
      ? `+${num?.toFixed(fractionDigits)}%`
      : `${num?.toFixed(fractionDigits)}%`
    : "0%";
};

export const handleError = (error, customMessage) => {
  console.log(error);
  toast.error(
    error?.message ||
    error?.response?.data?.message ||
    customMessage ||
    "Something went wrong",
  );
};

export const handleSuccess = (message, customMessage) => {
  toast.success(message || customMessage || "Operation successful");
};

// export const phoneFormatter = (input) => {
//   if (typeof input !== "string") {
//     return ""; // or return input if you want to keep original value
//   }

//   let cleaned;
//   cleaned = input.replace(/\D/g, ""); // Remove all non-numeric characters

//   if (cleaned.length === 11) {
//     cleaned = cleaned.substring(1);
//   }
//   if (cleaned.length > 3 && cleaned.length <= 6) {
//     return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
//   } else if (cleaned.length > 6) {
//     return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
//       6,
//       10
//     )}`;
//   } else if (cleaned.length > 0) {
//     return `(${cleaned}`;
//   }

//   return cleaned;
// };

export const phoneFormatter = (input) => {
  if (typeof input !== "string") {
    return ""; // or return input if you want to keep original value
  }

  let cleaned;
  cleaned = input.replace(/\D/g, ""); // Remove all non-numeric characters

  if (cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length > 3 && cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length > 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10,
    )}`;
  } else if (cleaned.length > 0) {
    return `(${cleaned}`;
  }

  return cleaned;
};

export const processSignup = (data, router) => {
  if (data?.success) {
    router.push("/app/dashboard");
    return;
  }
};

export const processLogin = (data, router) => {
  if (data?.success) {
    router.push("/app/dashboard");
    return;
  }
};

export const processError = (error) => {
  if (error?.response?.data?.message) {
    ErrorToast(error?.response?.data?.message);
    return;
  } else {
    ErrorToast("Something went wrong");
  }
};



export const phoneToE164 = (formattedPhone, countryCode = "+1") => {
  const digits = formattedPhone.replace(/\D/g, ""); // Strip all non-numeric chars
  // Remove leading 0 if present (e.g. 03001234567 → 3001234567)
  const normalized = digits.startsWith("0") ? digits.slice(1) : digits;
  return `${countryCode}${normalized}`;
};

export const cleanPhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/[\s\-()]/g, "");
};

export const formatPhoneNumber = (input) => {
  if (typeof input !== "string") return "";

  // Clean all characters except digits and '+'
  let cleaned = input.replace(/[^\d+]/g, "");

  // Ensure we don't have multiple '+' signs, only a single one at the start
  if (cleaned.includes("+")) {
    cleaned = "+" + cleaned.replace(/\+/g, "");
  }

  const hasPlus = cleaned.startsWith("+");
  const digitsOnly = hasPlus ? cleaned.slice(1) : cleaned;

  if (digitsOnly.length === 0) {
    return hasPlus ? "+" : "";
  }

  // Progressively format
  if (digitsOnly.length <= 3) {
    return `${hasPlus ? "+" : ""}${digitsOnly}`;
  }

  // If it's a US format (starts with 1 and has up to 11 digits)
  if (digitsOnly.startsWith("1") && digitsOnly.length <= 11) {
    const cc = "1";
    const rest = digitsOnly.slice(1);
    if (rest.length === 0) {
      return `${hasPlus ? "+" : ""}1`;
    } else if (rest.length <= 3) {
      return `${hasPlus ? "+" : ""}1 (${rest}`;
    } else if (rest.length <= 6) {
      return `${hasPlus ? "+" : ""}1 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
    } else {
      return `${hasPlus ? "+" : ""}1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
    }
  }

  // If it has more than 10 digits (non-US country code)
  if (digitsOnly.length > 10) {
    const ccLength = digitsOnly.length - 10;
    const cc = digitsOnly.slice(0, ccLength);
    const rest = digitsOnly.slice(ccLength);
    if (rest.length === 0) {
      return `${hasPlus ? "+" : ""}${cc}`;
    } else if (rest.length <= 3) {
      return `${hasPlus ? "+" : ""}${cc} (${rest}`;
    } else if (rest.length <= 6) {
      return `${hasPlus ? "+" : ""}${cc} (${rest.slice(0, 3)}) ${rest.slice(3)}`;
    } else {
      return `${hasPlus ? "+" : ""}${cc} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
    }
  }

  // Standard 10-digit formatting: (XXX) XXX-XXXX
  if (digitsOnly.length <= 6) {
    return `${hasPlus ? "+" : ""}(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  } else {
    return `${hasPlus ? "+" : ""}(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  }
};

export const handleFormattedOperatingHoursChange = (e) => {
  let digits = e.target.value.replace(/\D/g, "").slice(0, 8);

  let startHour = digits.slice(0, 2);
  let startMin = digits.slice(2, 4);
  let endHour = digits.slice(4, 6);
  let endMin = digits.slice(6, 8);

  if (startHour && Number(startHour) > 23) return;
  if (startMin && Number(startMin) > 59) return;
  if (endHour && Number(endHour) > 23) return;
  if (endMin && Number(endMin) > 59) return;

  let formatted = "";

  if (digits.length >= 1) formatted += startHour;
  if (digits.length >= 3) formatted += ":" + startMin;
  if (digits.length >= 5) formatted += " - " + endHour;
  if (digits.length >= 7) formatted += ":" + endMin;

  setFieldValue("operatingHours", formatted);
};

export const handleOperatingHoursChange = (e) => {
  let value = e.target.value;

  // Remove everything except numbers
  const digits = value.replace(/\D/g, "").slice(0, 8);

  let formatted = "";

  // First time
  if (digits.length > 0) {
    formatted += digits.slice(0, 2);
  }

  // First colon
  if (digits.length >= 3) {
    formatted += ":" + digits.slice(2, 4);
  }

  // Separator
  if (digits.length >= 5) {
    formatted += " - " + digits.slice(4, 6);
  }

  // Second colon
  if (digits.length >= 7) {
    formatted += ":" + digits.slice(6, 8);
  }

  setFieldValue("operatingHours", formatted);
};

export const validateImageResolution = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.onload = () => {
        if (img.width >= 215 && img.height >= 215) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
  });
};

export function updateAuthCache(queryClient, patch) {
  queryClient.setQueryData(["auth-me"], (old) => {
    const updated = {
      ...(old ?? {}),
      ...patch,

      // Deep merge user
      user:
        patch.user !== undefined
          ? {
            ...(old?.user ?? {}),
            ...(patch.user ?? {}),
          }
          : old?.user,
    };

    if (typeof window !== "undefined") {
      if (updated.sessionType !== undefined) {
        Cookies.set("sessionType", updated.sessionType, { expires: 7, path: "/" });
      }
      if (updated.onboardingStep !== undefined) {
        Cookies.set("onboardingStep", updated.onboardingStep, { expires: 7, path: "/" });
      }
      if (updated.user !== undefined) {
        Cookies.set("user", JSON.stringify(updated.user), { expires: 7, path: "/" });
      }
    }

    return updated;
  });
}

export const getBookingStatusStyles = (status) => {
  switch (status) {
    case "awaiting_payment":
      return " text-yellow-800";

    case "confirmed":
      return " text-green-700";

    case "failed":
      return " text-red-700";

    case "cancelled":
      return " text-gray-700";

    case "rejected":
      return " text-rose-700";

    case "completed":
      return " text-blue-700";

    default:
      return " text-slate-700";
  }
};


const utils = {
  validateEmail,
  validatePhone,
  storage,
  formatDate,
  formatDateWithName,
  formatDateTime,
  formatTime,
  formatTime12,
  capitalize,
  truncate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  handleError,
  handleSuccess,
  phoneFormatter,
  cleanPhoneNumber,
  formatPhoneNumber,
};

export default utils;
