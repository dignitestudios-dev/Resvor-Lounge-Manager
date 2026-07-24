import { useMutation } from "@tanstack/react-query";
import {
  submitChangePassword,
  submitForgotPassword,
  submitLogin,
  submitLogout,
  submitResendForgotOtp,
  submitUpdateFcmToken,
  submitUpdatePassword,
  submitVerifyForgotEmail,
} from "../api/Post";

export const useLogin = () => {
  return useMutation({
    mutationFn: submitLogin,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: submitForgotPassword,
  });
};

export const useVerifyForgotEmail = () => {
  return useMutation({
    mutationFn: submitVerifyForgotEmail,
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: submitUpdatePassword,
  });
};

export const useResendForgotOtp = () => {
  return useMutation({
    mutationFn: submitResendForgotOtp,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: submitLogout,
  });
};

export const useUpdateFcmToken = () => {
  return useMutation({
    mutationFn: submitUpdateFcmToken,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: submitChangePassword,
  });
};
