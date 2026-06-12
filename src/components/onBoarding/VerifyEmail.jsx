/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { useFormik } from "formik";
import AuthButton from "../auth/AuthButton";
import TextCountDown from "./TextCountDown";
import AuthSuccessModal from "../auth/AuthSuccessModal";
import { verifyEmailValues } from "@/lib/init/verifyEmailValues";
import { verifyEmailSchema } from "@/lib/schema/authentication/verifyEmailSchema";
import { useVerifyEmail } from "@/lib/hooks/mutations/OnBoardingMutations";
import { ErrorToast } from "../ui/toaster";
import { useResendForgotOtp } from "@/lib/hooks/mutations/AuthMutations";
import { LogOutIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { updateAuthCache } from "@/lib/utils";

const VerifyEmail = ({ email, handlePrevious }) => {
  const inputs = useRef([]);
  const queryClient = useQueryClient();
  const verifyEmailMutation = useVerifyEmail();
  const resendOtpMutation = useResendForgotOtp();

  const [otpDisplay, setOtpDisplay] = useState(Array(5).fill(""));

  const [isActive, setIsActive] = useState(true);
  const [seconds, setSeconds] = useState(30);
  const [requestSendModal, setRequestSendModal] = useState(false);

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: verifyEmailValues,
      validationSchema: verifyEmailSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        try {
          const response = await verifyEmailMutation.mutateAsync(values);

          updateAuthCache(queryClient, {
            onboardingStep: response?.data?.onboardingStep,
          });

          setRequestSendModal(true);
        } catch (error) {
          console.log("query client ---> ", error);
          if (error.code === "NO_INTERNET") {
            ErrorToast(error.message);
          } else {
            ErrorToast(
              error.response?.data?.message ||
                "An error occurred during logout. Please try again.",
            );
          }
        }
      },
    });

  const handleOtpChange = (e, index) => {
    const { value } = e.target;

    if (/^\d$/.test(value)) {
      const newOtpDisplay = [...otpDisplay];
      newOtpDisplay[index] = value;
      setOtpDisplay(newOtpDisplay);

      // Update formik value with concatenated OTP
      const otpString = newOtpDisplay.join("");
      handleChange({
        target: { name: "otp", value: otpString },
      });

      // Move to next only if next is empty
      const nextIndex = index + 1;
      if (nextIndex < newOtpDisplay.length && !newOtpDisplay[nextIndex]) {
        inputs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // prevent default backspace behavior
      const newOtpDisplay = [...otpDisplay];

      if (otpDisplay[index]) {
        // Just clear current input if not already empty
        newOtpDisplay[index] = "";
        setOtpDisplay(newOtpDisplay);
      } else if (index > 0) {
        // Move focus back and clear previous
        inputs.current[index - 1].focus();
        newOtpDisplay[index - 1] = "";
        setOtpDisplay(newOtpDisplay);
      }

      // Update formik value with concatenated OTP
      const otpString = newOtpDisplay.join("");
      handleChange({
        target: { name: "otp", value: otpString },
      });
    }
  };

  const handlePaste = async (e, index) => {
    e.preventDefault();

    try {
      const pastedText = await navigator.clipboard.readText();
      const digits = pastedText.replace(/\D/g, "").split("");

      if (digits.length > 0) {
        const newOtpDisplay = [...otpDisplay];

        // Fill OTP fields starting from current index
        for (
          let i = 0;
          i < digits.length && index + i < newOtpDisplay.length;
          i++
        ) {
          if (/^\d$/.test(digits[i])) {
            newOtpDisplay[index + i] = digits[i];
          }
        }

        setOtpDisplay(newOtpDisplay);

        // Update formik value
        const otpString = newOtpDisplay.join("");
        handleChange({
          target: { name: "otp", value: otpString },
        });

        // Move focus to the next empty field or last field
        const nextEmptyIndex = newOtpDisplay.findIndex(
          (val, idx) => idx >= index && val === "",
        );
        const focusIndex =
          nextEmptyIndex === -1 ? newOtpDisplay.length - 1 : nextEmptyIndex;
        inputs.current[focusIndex]?.focus();
      }
    } catch (err) {
      console.log("Paste failed:", err);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtpMutation.mutateAsync({ email, role: "lounge_manager" });
      setOtpDisplay(Array(5).fill("")); // Reset OTP display
      handleChange({
        target: { name: "otp", value: "" },
      });
      handleRestart();
    } catch (err) {
      if (err.code === "NO_INTERNET") {
        ErrorToast(err.message);
      } else {
        ErrorToast(
          err.response?.data?.message || "An error occurred. Please try again.",
        );
      }
    }
  };

  const handleRestart = () => {
    setSeconds(30);
    setIsActive(true);
  };

  const handleModalClose = async () => {
    try {
      // queryClient.removeQueries({
      //   queryKey: ["auth-me"],
      // });
      // queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      setRequestSendModal(false);
    } catch (error) {
      console.log("🚀 ~ handleModalClose ~ error:", error);
    }
  };

  return (
    <div className="grid lg:grid-cols-1 grid-cols-1 w-full text-white">
      <div className="flex justify-end mr-16 -mt-10">
        <button
          className="group relative bg-white rounded-md p-2 cursor-pointer"
          type="button"
          onClick={() => handlePrevious()}
        >
          {/* Tooltip text */}
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 scale-0 rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
            Logout
          </span>

          <LogOutIcon color="black" size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-center items-center h-auto ">
        <div>
          <img
            src={"/images/forgotLogo.png"}
            alt="logo"
            className="w-[220px]"
          />
        </div>
        <div className="mt-4 py-4 space-y-3 xxl:w-[400px]  xxl:ml-12 text-center">
          <p className=" xxl:text-[48px] text-[32px] font-[600] capitalize">
            verification
          </p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#E6E6E6] w-[440px]">
            A One-Time Password (OTP) has been sent to your registered email{" "}
            {`(${email})`}. Please enter it to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[460px] md:w-[550px] w-[320px] mt-4">
            <div className="xxl:w-[600px] xxl:m-4 grid grid-cols-5 ml-8 gap-20 xl:w-[340px] lg:w-[360px] md:w-[550px] w-full ">
              {otpDisplay.map((digit, index) => (
                <input
                  inputMode="numeric"
                  key={index}
                  // type="password"
                  placeholder=""
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                  onBlur={handleBlur}
                  ref={(el) => (inputs.current[index] = el)}
                  className="xxl:h-[79px] xxl:w-[79px] h-[70px] w-[70px] rounded-[12px] outline-none text-center border-[1px] bg-white/10 backdrop-blur-[28.9px] placeholder:text-[#E6E6F0]
                placeholder:text-[16px] xxl:placeholder:text-[20px] focus-within:border-[#CACACA] flex items-center justify-center"
                />
              ))}
            </div>
            {errors.otp && touched.otp && (
              <div className="text-red-500 text-sm text-center">
                {errors.otp}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 pl-4 mt-4 mb-3 relative z-10">
              <span className="text-center text-[14px] leading-[21.6px] text-white ">
                {isActive ? "OTP resend in" : "Didn’t receive the OTP?"}
                {isActive ? (
                  <TextCountDown
                    isActive={isActive}
                    setIsActive={setIsActive}
                    seconds={seconds}
                    setSeconds={setSeconds}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendOtpMutation.isPending}
                    className="font-[600] pl-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {resendOtpMutation.isPending ? "Resending..." : "Resend"}
                  </button>
                )}
              </span>
            </div>
            <div className="w-full flex justify-center pl-4 mt-4 space-y-4 ">
              <div className="w-[360px] ">
                <AuthButton
                  text="Verify"
                  disabled={verifyEmailMutation.isPending}
                  loading={verifyEmailMutation.isPending}
                />
              </div>
            </div>
            {/* <div className="w-full flex justify-center pl-4 mt-4 space-y-4 ">
              <button
                onClick={() => handlePrevious()}
                type="button"
                className="w-[360px] px-4 py-2 text-sm font-semibold text-red-500 
             border border-red-400 rounded-lg 
             hover:bg-red-50 hover:text-red-600 
             transition-colors duration-200 ease-in-out"
              >
                Wrong email? Change it
              </button>
            </div> */}
          </div>
        </form>
      </div>
      {requestSendModal && (
        <AuthSuccessModal
          isOpen={requestSendModal}
          onClick={() => {
            handleModalClose();
          }}
          title="Email verified"
          description="Your email has been verified successfully."
        />
      )}
    </div>
  );
};

export default VerifyEmail;
