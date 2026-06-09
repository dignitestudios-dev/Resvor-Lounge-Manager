"use client";
import AuthButton from "../../../components/auth/AuthButton";
import { useEffect, useRef, useState } from "react";
import CountDown from "../../../components/auth/CountDown";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";
import {
  useVerifyForgotEmail,
  useForgotPassword,
} from "@/lib/hooks/mutations/AuthMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const VerifyForgotOtp = () => {
  const router = useRouter();
  const verifyEmailMutation = useVerifyForgotEmail();
  // const resendOtpMutation = useResendForgotOtp();
  const resendOtpMutation = useForgotPassword();

  const [otp, setOtp] = useState(Array(5).fill(""));
  const inputs = useRef([]);

  const [isActive, setIsActive] = useState(true);
  const [seconds, setSeconds] = useState(30);
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  // Check if all OTP fields are filled
  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setValidationError(""); // Clear error on input

      // Move to next only if next is empty
      const nextIndex = index + 1;
      if (nextIndex < otp.length && !newOtp[nextIndex]) {
        inputs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // prevent default backspace behavior
      const newOtp = [...otp];

      if (otp[index]) {
        // Just clear current input if not already empty
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move focus back and clear previous
        inputs.current[index - 1].focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = async (e, index) => {
    e.preventDefault();

    try {
      const pastedText = await navigator.clipboard.readText();
      const digits = pastedText.replace(/\D/g, "").split("");

      if (digits.length > 0) {
        const newOtpDisplay = [...otp];

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

        setOtp(newOtpDisplay);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate OTP
    if (!isOtpComplete) {
      setValidationError("Please enter all 5 digits of the OTP");
      return;
    }

    try {
      const response = await verifyEmailMutation.mutateAsync({
        otp: otp.join(""),
        email,
      });

      if (response?.success) {
        sessionStorage.setItem("resetToken", response?.data?.resetToken);
        router.push("/auth/update-password");
      } else {
        ErrorToast(
          response?.message || "Something went wrong. Please try again.",
        );
      }
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
  };

  useEffect(() => {
    const email = sessionStorage.getItem("resetEmail");
    setEmail(email);
  }, []);

  const handleResendOtp = async () => {
    try {
      await resendOtpMutation.mutateAsync({ email, role: "lounge_manager" });
      setOtp(Array(5).fill(""));
      setSeconds(30);
      setIsActive(true);
      setValidationError("");
      SuccessToast("OTP resent successfully");
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
  };

  return (
    <div className="grid lg:grid-cols-1 grid-cols-1 w-full text-white">
      <div className="flex flex-col justify-center items-center h-auto ">
        {/* <div className="flex justify-start items-center absolute top-16 left-40">
          <button
            className="cursor-pointer"
            type="button"
            onClick={() => router.back()}
          >
            <FaArrowLeftLong color="white" size={24} />
          </button>
        </div> */}
        <div>
          <img
            src={"/images/forgotLogo.png"}
            alt="logo"
            className="w-[220px]"
          />
        </div>
        <div className="text-center space-y-2 max-w-[38%] mb-6">
          <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-semibold">
            Verify OTP
          </p>
          <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-[#E6E6E6]">
            A One-Time Password (OTP) has been sent to your registered email{" "}
            {`(${email})`}. Please enter it to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="xxl:space-y-8 space-y-6 xxl:w-[650px] lg:w-[360px] md:w-[550px] w-[320px] mt-4">
            <div className="xxl:w-[600px] xxl:m-4 grid grid-cols-5 gap-16 ml-2 xl:w-[300px] lg:w-[380px] md:w-[550px] w-full ">
              {otp.map((digit, index) => (
                <input
                  inputMode="numeric"
                  key={index}
                  // type="password"
                  placeholder=""
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                  ref={(el) => (inputs.current[index] = el)}
                  className="xxl:h-[79px] xxl:w-[79px] h-[49px] w-[49px] rounded-[12px] outline-none text-center border-[1px] border-[#D9D9D9] placeholder:text-[#181818]
                placeholder:text-[16px] placeholder:text-white xxl:placeholder:text-[20px] focus-within:border-[#8A8A8A] flex items-center justify-center"
                />
              ))}
            </div>
            {validationError && (
              <div className="text-red-500 text-sm font-medium text-center">
                {validationError}
              </div>
            )}
            <div
              className=" w-full 
          max-w-[300px]
          sm:max-w-[350px]
          md:max-w-[400px]
          lg:max-w-[450px]
          xl:max-w-[450px]
          flex flex-col gap-4"
            >
              <AuthButton
                text="Verify"
                loading={verifyEmailMutation.isPending}
                disabled={!isOtpComplete || verifyEmailMutation.isPending}
              />
              <CountDown
                isActive={isActive}
                setIsActive={setIsActive}
                seconds={seconds}
                setSeconds={setSeconds}
                onResend={handleResendOtp}
                isLoading={resendOtpMutation.isPending}
              />
              <button
                onClick={() => router.push("/auth/forget-password")}
                type="button"
                className=" px-4 py-2 text-sm font-semibold text-red-500 
             border border-red-400 rounded-lg 
             hover:bg-red-50 hover:text-red-600 
             transition-colors duration-200 ease-in-out"
              >
                Wrong email? Change it
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* {requestModal && (
        <RequestModal setIsOpen={setRequestModal} isLogin={true} />
      )} */}
    </div>
  );
};

export default VerifyForgotOtp;
