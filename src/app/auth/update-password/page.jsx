"use client";
import { useLogin } from "../../../lib/hooks/api/Post";
import { useFormik } from "formik";
import AuthInput from "../../../components/auth/AuthInput";
import AuthButton from "../../../components/auth/AuthButton";
import { useState, useEffect } from "react";
import AuthSuccessModal from "../../../components/auth/AuthSuccessModal";
import { useRouter } from "next/navigation";
import { updatePasswordSchema } from "@/lib/schema/authentication/loginSchema";
import { useUpdatePassword } from "@/lib/hooks/mutations/AuthMutations";

const UpdatePassword = () => {
  const router = useRouter();
  const [requestSendModal, setRequestSendModal] = useState(false);

  const updatePasswordMutation = useUpdatePassword();
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    setResetToken(token);
  }, []);

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: { password: "", confPassword: "" },
      validationSchema: updatePasswordSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        try {
          const data = {
            password: values?.password,
            resetToken,
          };

          const response = await updatePasswordMutation.mutateAsync(data);
          setRequestSendModal(true);
        } catch (error) {
          if (error.code === "NO_INTERNET") {
            ErrorToast(error.message);
          } else {
            ErrorToast(
              error.response?.data?.message ||
                "An error occurred. Please try again.",
            );
          }
        }
      },
    });
  return (
    <div className="grid lg:grid-cols-1 grid-cols-1 w-full text-white">
      <div className="flex flex-col justify-center items-center h-auto ">
        <div>
          <img
            src={"/images/forgotLogo.png"}
            alt="logo"
            className="w-[220px]"
          />
        </div>
        <div className="mt-4 py-4 space-y-3 xxl:w-[400px] xxl:ml-12 text-center">
          <p className=" xxl:text-[48px] text-[32px] font-[600] capitalize">
            create new password
          </p>
          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] font-[400] ">
            Enter a strong, secure password to update your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[360px] md:w-[550px] w-[320px] mt-4">
            <div className=" w-full">
              <AuthInput
                label={"Password"}
                text={"Password"}
                placeholder={"Enter password here"}
                type={"password"}
                id={"password"}
                name={"password"}
                showToggle={true}
                maxLength={250}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors?.password}
                touched={touched?.password}
              />
            </div>
            <div className=" w-full">
              <AuthInput
                label={"Confirm Password"}
                text={"Password"}
                placeholder={"Re-enter password here"}
                type={"password"}
                id={"confPassword"}
                name={"confPassword"}
                showToggle={true}
                maxLength={250}
                value={values.confPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors?.confPassword}
                touched={touched?.confPassword}
              />
            </div>
          </div>
          <div className="xxl:w-[650px] w-[360px] mt-6 mb-4">
            <AuthButton
              text={"Update"}
              loading={updatePasswordMutation.isPending}
              disabled={updatePasswordMutation.isPending}
            />
          </div>
        </form>
      </div>
      {requestSendModal && (
        <AuthSuccessModal
          isOpen={requestSendModal}
          onClick={() => {
            setRequestSendModal(false);
            router.push("/auth/login");
          }}
          title="Password Reset Successful"
          description="You can now log in with your new password."
        />
      )}
    </div>
  );
};

export default UpdatePassword;
