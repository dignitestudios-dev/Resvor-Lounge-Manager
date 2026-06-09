"use client";
import {
  useForgotPassword,
  useLogin,
} from "../../../lib/hooks/mutations/AuthMutations";
import { processLogin } from "../../../lib/utils";
import { useFormik } from "formik";
import AuthInput from "../../../components/auth/AuthInput";
import AuthButton from "../../../components/auth/AuthButton";
import { MdOutlineChevronLeft } from "react-icons/md";
import { useRouter } from "next/navigation";
import { forgotPasswordSchema } from "@/lib/schema/authentication/loginSchema";
import { ErrorToast } from "@/components/ui/toaster";

const ForgotPassword = () => {
  const router = useRouter();

  const forgotPasswordMutation = useForgotPassword();

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: { email: "" },
      validationSchema: forgotPasswordSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values, action) => {
        console.log("🚀 ~ ForgotPassword ~ action:", action);

        try {
          const data = {
            email: values?.email,
            role: "lounge_manager",
          };

          const response = await forgotPasswordMutation.mutateAsync(data);
          console.log("🚀 ~ ForgotPassword ~ response:", response);
          router.push("/auth/verify-forget-otp");

          sessionStorage.setItem("resetEmail", values.email);
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
            forgot password
          </p>
          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] capitalize ">
            Please enter your registered email address.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[360px] md:w-[550px] w-[320px] mt-4">
            <div className=" w-full">
              <AuthInput
                label={"Email Address"}
                text={"Email address"}
                placeholder={"Enter email address"}
                type={"email"}
                id={"email"}
                name={"email"}
                maxLength={30}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors?.email}
                touched={touched?.email}
              />
            </div>
          </div>
          <div className="xxl:w-[650px] w-[350px] mt-6 mb-4">
            <AuthButton
              type="submit"
              text={"Send OTP"}
              loading={forgotPasswordMutation.isPending}
              disabled={forgotPasswordMutation.isPending}
            />
          </div>
        </form>
        <button
          type="button"
          className="w-full flex justify-center items-center cursor-pointer mt-4"
          onClick={() => router.push("/auth/login")}
        >
          <MdOutlineChevronLeft className="xxl:text-[26px] text-[22px] text-white" />
          <p className="text-[12px] xxl:text-[22px] uppercase font-bold leading-none tracking-wider text-white">
            Back
          </p>
        </button>
      </div>
      {/* {requestModal && (
        <RequestModal setIsOpen={setRequestModal} isLogin={true} />
      )} */}
    </div>
  );
};

export default ForgotPassword;
