"use client";
import { useFormik } from "formik";
import AuthInput from "../../../components/auth/AuthInput";
import AuthButton from "../../../components/auth/AuthButton";
import { useRouter } from "next/navigation";
import { loginSchema } from "./../../../lib/schema/authentication/loginSchema";
import { useLogin } from "../../../lib/hooks/mutations/AuthMutations";
import { ErrorToast } from "../../../components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { updateAuthCache } from "@/lib/utils";
const loginValues = {
  email: "",
  password: "",
};

const Login = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: loginValues,
      validationSchema: loginSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        try {
          const response = await loginMutation.mutateAsync({
            email: values.email,
            password: values.password,
            role: "lounge_manager",
          });

          const { tokenType, onboardingStep, user } = response?.data ?? {};

          // Seed the cache so AuthLayout / signup page never needs to refetch
          updateAuthCache(queryClient, {
            sessionType: tokenType,
            onboardingStep,
            user,
          });

          if (tokenType === "registration_token") {
            console.log("🚀 ~ IF RUN LINE 46");
            // Middleware will guard the route; onboardingStep is already in cache
            router.push("/auth/signup");
          } else {
            console.log("🚀 ~ ELSE RUN LINE 50");

            localStorage.setItem("fromLogin", "true");
            // router.refresh();
            // window.location.href = "/dashboard";
            router.push("/dashboard");
            // router.replace("/dashboard");
          }
        } catch (error) {
          ErrorToast(
            error?.code === "NO_INTERNET"
              ? error.message
              : (error.response?.data?.message ??
                  "An error occurred. Please try again."),
          );
        }
      },
    });

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 w-full text-white">
      <div className="p-4 justify-center lg:flex hidden">
        <div className="max-w-[489px]">
          <img
            src={"/images/loginSideImg.png"}
            alt="logo"
            className="w-[489px]"
          />
          {/* <p className="text-[65px] font-[700]">Plan Better. Party Smarter.</p>
          <p className="text-[24px] font-[400]">
            Book top lounges or manage your own— Resvor makes every night
            seamless.
          </p> */}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center h-auto ">
        <div className="my-8 space-y-3 xxl:w-[400px] xxl:ml-12 text-center">
          <p className=" xxl:text-[48px] text-[36px] font-[600] capitalize">
            Log In
          </p>
          <p className="xxl:text-[26px] text-[16px] text-[#E6E6E6] ">
            Please enter your details to login
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px]">
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
          </div>
          <div className="mt-2 space-y-4">
            <div className="flex justify-end xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px]">
              <p
                type="button"
                className=" xxl:text-[20px] text-[12px] font-[500] cursor-pointer"
                onClick={() => router.push("/auth/forget-password")}
              >
                Forgot password?
              </p>
            </div>

            <div className="xxl:w-[650px] w-[350px] mt-1 mb-4">
              <AuthButton
                type="submit"
                text={"Login"}
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 my-6  ">
          <p className="text-center xxl:text-[26px] text-[15px] leading-[21.6px] text-white">
            Don’t have an account?
            <span
              className="text-white bg-clip-text text-transparent xxl:text-[26px] text-[16px] font-[500] pl-1 cursor-pointer "
              onClick={() => router.push("/auth/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
      {/* {requestModal && (
        <RequestModal setIsOpen={setRequestModal} isLogin={true} />
      )} */}
    </div>
  );
};

export default Login;
