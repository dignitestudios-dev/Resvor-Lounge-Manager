/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import AuthButton from "../auth/AuthButton";
import AuthInput from "../auth/AuthInput";
import PhoneInput from "../auth/PhoneInput";
import { phoneFormatter, phoneToE164, updateAuthCache } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userDetailsValues } from "@/lib/init/signUpValues";
import { userDetailsSchema } from "@/lib/schema/authentication/signupSchema";
import { ErrorToast } from "../ui/toaster";
import { useSignUp } from "@/lib/hooks/mutations/OnBoardingMutations";
import { useUpdateFcmToken } from "@/lib/hooks/mutations/AuthMutations";
import { useQueryClient } from "@tanstack/react-query";
import { requestForToken } from "@/lib/firebase";
import Cookies from "js-cookie";

const CreateAccount = ({ setEmail }) => {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const updateFcmMutation = useUpdateFcmToken();
  const queryClient = useQueryClient();

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: userDetailsValues,
      validationSchema: userDetailsSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        try {
          setEmail(values.email);

          let fcmToken = "";
          try {
            fcmToken = await requestForToken();
            if (fcmToken) {
              Cookies.set("fcmToken", fcmToken, { expires: 365, path: "/" });
              if (typeof window !== "undefined") {
                localStorage.setItem("fcmToken", fcmToken);
              }
            }
          } catch (tokenError) {
            console.error("FCM Token retrieval failed:", tokenError);
          }

          const data = {
            email: values.email,
            password: values.password,
            role: "lounge_manager",
            fullName: values.name,
            phoneNumber: phoneToE164(values.number),
          };

          const response = await signUpMutation.mutateAsync(data);

          if (fcmToken) {
            try {
              await updateFcmMutation.mutateAsync({ fcmToken });
            } catch (fcmUpdateError) {
              console.error("FCM Token update on backend failed:", fcmUpdateError);
            }
          }

          updateAuthCache(queryClient, {
            onboardingStep: response?.data?.onboardingStep,
            user: { email: values.email }, // keep email available downstream
          });
        } catch (error) {
          console.log("🚀 ~ CreateAccount ~39---?> errors:", error);
          if (error.code === "NO_INTERNET") {
            ErrorToast(error.message);
          } else {
            ErrorToast(
              error.response?.data?.message ||
              "An error occurred. Please try again.",
            );
          }
        }

        // Use the loading state to show loading spinner
        // Use the response if you want to perform any specific functionality
        // Otherwise you can just pass a callback that will process everything
      },
    });

  return (
    <div className="flex flex-col justify-center items-center h-auto ">
      <div className="mt-4 xxl:w-[400px] xxl:ml-12 text-center space-y-4">
        <p className="xxl:text-[48px] text-[32px] text-[#E6E6E6] font-semibold capitalize">
          sign up
        </p>
        <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
          Please enter your details to create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px] mt-10">
          <div className=" w-full">
            <AuthInput
              label={"Name"}
              text={"Name"}
              placeholder={"Enter your name"}
              type={"text"}
              id={"name"}
              name={"name"}
              maxLength={100}
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.name}
              touched={touched?.name}
            />
          </div>
          <div className=" w-full">
            <AuthInput
              label={"Email Address"}
              text={"Email address"}
              placeholder={"Enter email address"}
              type={"email"}
              id={"email"}
              name={"email"}
              maxLength={60}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.email}
              touched={touched?.email}
            />
          </div>
          <div>
            <PhoneInput
              label={"Phone Number"}
              value={phoneFormatter(values.number)}
              id={"number"}
              name={"number"}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.number}
              touched={touched.number}
              autoComplete="off"
            />
          </div>
          <div className=" w-full">
            <AuthInput
              label={"Password"}
              text={"Password"}
              placeholder={"Enter password here"}
              type={"password"}
              id={"password"}
              name={"password"}
              showToggle={true}
              maxLength={60}
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
              type={"cPassword"}
              id={"cPassword"}
              name={"cPassword"}
              showToggle={true}
              maxLength={60}
              value={values.cPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors?.cPassword}
              touched={touched?.cPassword}
            />
          </div>
        </div>
        <div className="mt-6 flex items-start gap-2 text-[12px] text-[#CACACA]">
          <input
            type="checkbox"
            checked={values.acceptedPolicy}
            onChange={handleChange}
            onBlur={handleBlur}
            id="acceptedPolicy"
            name="acceptedPolicy"
            className="mt-[2px] h-3 w-3 cursor-pointer accent-indigo-600"
          />

          <span>
            I accept the{" "}
            <span
              className="text-[#E6E6E6] font-semibold cursor-pointer"
              onClick={() => router.push("/auth/terms")}
            >
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span
              className="text-[#E6E6E6] font-semibold cursor-pointer"
              onClick={() => router.push("/auth/privacy")}
            >
              Privacy Policy
            </span>
          </span>
        </div>
        {errors.acceptedPolicy && touched.acceptedPolicy && (
          <p className="text-red-500 text-[11px] font-medium mb-2">
            {errors.acceptedPolicy}
          </p>
        )}
        <div className="mt-1 ">
          <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
            <AuthButton
              text={"Sign Up"}
              disabled={signUpMutation.isPending}
              loading={signUpMutation.isPending}
            />
          </div>
        </div>
      </form>

      <div className="flex items-center justify-center gap-2 ">
        <p className="text-center xxl:text-[26px] text-[15px] leading-[21.6px] text-white">
          Already have an account?
          <span
            className="xxl:text-[26px] text-[14px] font-[600] pl-1 cursor-pointer text-white"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;
