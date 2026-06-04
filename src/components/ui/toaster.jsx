import { toast } from "react-hot-toast";

let toastId = null;

export const SuccessToast = (msg) => {
  if (toastId) toast.dismiss(toastId);
  toastId = toast.success(msg, {
    className: "toast-slide",
  });
};

export const ErrorToast = (msg) => {
  if (toastId) toast.dismiss(toastId);
  toastId = toast.error(msg, {
    className: "toast-slide",
  });
};

export const WarningToast = (msg) => {
  if (toastId) toast.dismiss(toastId);
  toastId = toast(msg, {
    className: "toast-slide",
  });
};
