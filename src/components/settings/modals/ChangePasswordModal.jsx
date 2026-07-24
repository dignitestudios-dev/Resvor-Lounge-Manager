"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuthInput from "@/components/auth/AuthInput";
import { changePasswordValues } from "@/lib/init/changePasswordValues";
import { changePasswordSchema } from "@/lib/schema/settings/changePasswordSchema";
import { useChangePassword } from "@/lib/hooks/mutations/AuthMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const ChangePasswordModal = ({ open, setOpen, onUpdate }) => {
  const changePasswordMutation = useChangePassword();

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: changePasswordValues,
    validationSchema: changePasswordSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const data = {
          password: values.currentPassword,
          newPassword: values.password,
          role: 'lounge_manager'
        };

        const response = await changePasswordMutation.mutateAsync(data);
        SuccessToast(response?.message || "Password updated successfully.");

        resetForm();
        setOpen(false);

        if (onUpdate) {
          onUpdate(response);
        }
      } catch (error) {
        if (error?.code === "NO_INTERNET") {
          ErrorToast(error.message);
        } else {
          ErrorToast(
            error?.response?.data?.message ||
            "An error occurred while updating password."
          );
        }
      }
    },
  });

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-4xl">Change Password</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            You must enter current password in order to update password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthInput
            label="Current Password"
            placeholder="Enter password here"
            type="password"
            id="currentPassword"
            name="currentPassword"
            showToggle={true}
            variant="light"
            value={values.currentPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors?.currentPassword}
            touched={touched?.currentPassword}
          />

          <AuthInput
            label="New Password"
            placeholder="Enter new password here"
            type="password"
            id="password"
            name="password"
            showToggle={true}
            variant="light"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors?.password}
            touched={touched?.password}
          />

          <AuthInput
            label="Confirm Password"
            placeholder="Re enter password here"
            type="password"
            id="cPassword"
            name="cPassword"
            showToggle={true}
            variant="light"
            value={values.cPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors?.cPassword}
            touched={touched?.cPassword}
          />

          <div className="mt-8 pt-4">
            <DialogFooter>
              <div className="w-full flex justify-center">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full max-w-xl flex items-center justify-center gap-2"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
