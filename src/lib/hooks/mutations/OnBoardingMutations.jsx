import { useMutation } from "@tanstack/react-query";
import {
  submitCreateLounge,
  submitSignUp,
  submitVerifyEmail,
  submitVerifyMobileNumber,
} from "../api/Post";

export const useSignUp = () =>
  useMutation({
    mutationFn: submitSignUp,
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: submitVerifyEmail,
  });

export const useVerifyMobileNumber = () =>
  useMutation({
    mutationFn: submitVerifyMobileNumber,
  });

export const useCreateLounge = () =>
  useMutation({
    mutationFn: submitCreateLounge,
  });
