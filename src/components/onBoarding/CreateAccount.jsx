/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import AuthButton from "../auth/AuthButton";
import AuthInput from "../auth/AuthInput";
import PhoneInput from "../auth/PhoneInput";
import { phoneFormatter, phoneToE164, updateAuthCache } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { userDetailsValues } from "@/lib/init/signUpValues";
import { userDetailsSchema } from "@/lib/schema/authentication/signupSchema";
import { ErrorToast } from "../ui/toaster";
import { useSignUp } from "@/lib/hooks/mutations/OnBoardingMutations";
import { useQueryClient } from "@tanstack/react-query";

const CreateAccount = ({ setEmail }) => {
  const router = useRouter();
  const signUpMutation = useSignUp();
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

          const data = {
            email: values.email,
            password: values.password,
            role: "lounge_manager",
            fullName: values.name,
            phoneNumber: phoneToE164(values.number),
          };

          const response = await signUpMutation.mutateAsync(data);

          updateAuthCache(queryClient, {
            onboardingStep: response?.data?.onboardingStep,
            user: { email: values.email }, // keep email available downstream
          });
        } catch (error) {
          console.log("🚀 ~ CreateAccount ~39--->errors:", error);
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
        <div className="mt-6 flex items-start gap-3 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px]">
          <label
            htmlFor="acceptedPolicy"
            className="relative flex items-center justify-center cursor-pointer mt-[1px] select-none shrink-0"
          >
            <input
              type="checkbox"
              checked={values.acceptedPolicy}
              onChange={handleChange}
              onBlur={handleBlur}
              id="acceptedPolicy"
              name="acceptedPolicy"
              className="sr-only"
            />
            <div className="w-[20px] h-[20px] rounded-[4px] border border-white bg-transparent flex items-center justify-center transition-colors">
              {values.acceptedPolicy && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </label>

          <p className="text-[13px] font-medium leading-[18px] tracking-[-0.0041em] text-white">
            I agree to the{" "}
            <span
              className="underline underline-offset-2 font-medium cursor-pointer text-white hover:text-gray-200"
              onClick={() => router.push("/auth/terms")}
            >
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span
              className="underline underline-offset-2 font-medium cursor-pointer text-white hover:text-gray-200"
              onClick={() => router.push("/auth/privacy")}
            >
              Privacy Policy
            </span>{" "}
            and authorize the collection and use of my phone number for Two-Factor Authentication.
          </p>
        </div>

        {errors.acceptedPolicy && touched.acceptedPolicy && (
          <p className="text-red-500 text-[11px] font-medium mt-1 w-full text-left xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px]">
            {errors.acceptedPolicy}
          </p>
        )}
        <div className="mt-8 xxl:w-[650px] lg:w-[350px] md:w-[550px] w-[320px]">
          <AuthButton
            text={"Sign Up"}
            disabled={signUpMutation.isPending}
            loading={signUpMutation.isPending}
          />
        </div>

        <div className="mt-4 flex items-center justify-center">
          <p className="text-center xxl:text-[20px] text-[15px] leading-[21.6px] text-white">
            Already have an account?{" "}
            <span
              className="font-bold cursor-pointer hover:underline text-white pl-1"
              onClick={() => router.push("/auth/login")}
            >
              Log In
            </span>
          </p>
        </div>


      </form>
    </div>
  );
};

export default CreateAccount;
