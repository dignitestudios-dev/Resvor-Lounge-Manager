"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { updateBartenderPasswordSchema } from "@/lib/schema/bartender/bartenderSchema";
import { useUpdateBartenderPassword } from "@/lib/hooks/mutations/BartenderMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const FieldError = ({ touched, error }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

const UpdatePasswordModal = ({ isOpen, onOpenChange, bartenderId }) => {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const { mutate: updatePassword, isPending } = useUpdateBartenderPassword();

  const formik = useFormik({
    initialValues: { currentPassword: "", newPassword: "" },
    validationSchema: updateBartenderPasswordSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, { resetForm }) => {
      updatePassword(
        {
          id: bartenderId,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          onSuccess: () => {
            SuccessToast("Password updated successfully.");
            resetForm();
            onOpenChange(false);
          },
          onError: (error) => {
            ErrorToast(
              error?.response?.data?.message || "Failed to update password."
            );
          },
        }
      );
    },
  });

  // Reset form when modal closes
  const handleOpenChange = (open) => {
    if (!open) formik.resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Update Password
          </DialogTitle>
          <DialogDescription>
            <form
              onSubmit={formik.handleSubmit}
              className="mt-4 space-y-4"
              noValidate
            >
              {/* Current Password */}
              <div className="w-full flex flex-col gap-1">
                <Label className="text-base text-black">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="● ● ● ● ● ● ● ●"
                    type={showCurrentPw ? "text" : "password"}
                    className={`h-14 pr-10 ${
                      formik.touched.currentPassword &&
                      formik.errors.currentPassword
                        ? "border-red-500"
                        : ""
                    }`}
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                  >
                    {!showCurrentPw ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <FieldError
                  touched={formik.touched.currentPassword}
                  error={formik.errors.currentPassword}
                />
              </div>

              {/* New Password */}
              <div className="w-full flex flex-col gap-1">
                <Label className="text-base text-black">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    placeholder="● ● ● ● ● ● ● ●"
                    type={showNewPw ? "text" : "password"}
                    className={`h-14 pr-10 ${
                      formik.touched.newPassword && formik.errors.newPassword
                        ? "border-red-500"
                        : ""
                    }`}
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowNewPw(!showNewPw)}
                  >
                    {!showNewPw ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <FieldError
                  touched={formik.touched.newPassword}
                  error={formik.errors.newPassword}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending || !formik.isValid || !formik.dirty}
                className="w-full h-14 text-lg text-white bg-blue-900 hover:bg-blue-800"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePasswordModal;
