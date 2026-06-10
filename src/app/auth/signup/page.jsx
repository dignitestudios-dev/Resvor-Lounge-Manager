"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { IoMailOutline, IoCallOutline } from "react-icons/io5";
import { LiaIdCard } from "react-icons/lia";
import { IoMdPerson } from "react-icons/io";

import OnboardingStepper from "../../../components/onBoarding/OnboardingSteps";
import { HiOutlineCalendarDateRange } from "react-icons/hi2";
import CreateAccount from "../../../components/onBoarding/CreateAccount";
import VerifyEmail from "../../../components/onBoarding/VerifyEmail";
import VerifyPhone from "../../../components/onBoarding/VerifyPhone";
import PersonalDetails from "../../../components/onBoarding/PersonalDetails";
import FloorPlanSetup from "../../../components/onBoarding/FloorPlanSetup";
import MultipleLounge from "../../../components/onBoarding/MultipleLounge";
import { FaClipboardList } from "react-icons/fa";
import Subscription from "../../../components/onBoarding/Subscription";
import PersonalDetailsRemaining from "@/components/onBoarding/PersonalDetailsRemaining";
import { useAuthMe } from "@/lib/hooks/queries/useQueries";
import { useLogout } from "@/lib/hooks/mutations/AuthMutations";
import { ErrorToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";

export default function SignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authData, isLoading, refetch } = useAuthMe();
  console.log("🚀 ~ SignUp ~ authData:", authData);

  const logoutMutation = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [currentState, setCurrentState] = useState("createAccount");

  // Refetch auth data when middleware redirects with registration_token
  useEffect(() => {
    const tokenType = Cookies.get("tokenType");
    if (tokenType === "registration_token" && !authData) {
      // Fresh fetch when user is in registration flow (redirected by middleware)
      refetch();
    }
  }, [refetch]);

  // Handle navigation based on authData onboardingStep
  useEffect(() => {
    if (!isLoading && authData) {
      const onboardingStep = authData.onboardingStep;
      const sessionType = authData.sessionType;

      // If user has access_token, redirect to dashboard
      if (sessionType === "access_token" && onboardingStep === "completed") {
        router.push("/dashboard");
        return;
      }

      // Handle different onboarding steps
      if (onboardingStep === "verify_email") {
        setCurrentStep(1);
        setCurrentState("verify_email");
      } else if (onboardingStep === "verify_mobile") {
        setCurrentStep(2);
        setCurrentState("verify_mobile");
      } else if (
        sessionType === "access_token" &&
        onboardingStep === "create_lounge"
      ) {
        setCurrentStep(3);
        setCurrentState("personalDetails");
      } else if (
        sessionType === "access_token" &&
        onboardingStep === "completed"
      ) {
        setCurrentStep(4);
        setCurrentState("subscription");
      }
      // Default to createAccount if onboardingStep is not recognized
    }
  }, [authData, isLoading, router]);

  const providerSteps = [
    { icon: IoMdPerson, title: "Your Details" },
    { icon: IoMailOutline, title: "Verify Email" },
    { icon: IoCallOutline, title: "Verify Number" },
    { icon: LiaIdCard, title: "Create Lounge" },
    // { icon: HiOutlineCalendarDateRange, title: "Floor Plan" },
    // { icon: IoMdPerson, title: "Multiple Lounge" },
    { icon: FaClipboardList, title: "Subscription" },
  ];

  const steps = providerSteps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    active: index === currentStep,
  }));

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    // if (currentStep > 0) {
    //   setCurrentStep(currentStep - 1);
    // }

    try {
      setIsLoggingOut(true);
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(["auth-me"], null);
      // Explicitly clear cookies
      Cookies.remove("authorization");
      Cookies.remove("tokenType");
      router.push("/auth/login");
    } catch (error) {
      if (error.code === "NO_INTERNET") {
        ErrorToast(error.message);
      } else {
        ErrorToast(
          error.response?.data?.message ||
            "An error occurred during logout. Please try again.",
        );
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`grid grid-cols-12 gap-6 h-full w-full`}>
      <OnboardingStepper steps={steps} currentStep={currentStep} />

      <div className="col-span-12 lg:col-span-8 px-5 md:px-10 h-full flex justify-center items-center">
        <div
          className={`w-full relative flex justify-center flex-col items-center h-full `}
        >
          {isLoading || isLoggingOut ? (
            <div className="text-center text-white">
              <p className="text-xl">Loading...</p>
            </div>
          ) : currentStep === 0 && currentState === "createAccount" ? (
            <CreateAccount
              setEmail={setEmail}
              handleNext={handleNext}
              setCurrentState={setCurrentState}
            />
          ) : currentStep === 1 && currentState === "verify_email" ? (
            <VerifyEmail
              email={email || authData?.user?.email}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              setCurrentState={setCurrentState}
            />
          ) : currentStep === 2 && currentState === "verify_mobile" ? (
            <VerifyPhone
              email={email || authData?.user?.email}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              setCurrentState={setCurrentState}
            />
          ) : currentStep === 3 && currentState === "personalDetails" ? (
            <PersonalDetails
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              setCurrentState={setCurrentState}
            />
          ) : //  : currentStep === 4 && currentState === "success" ? (
          //   <MultipleLounge
          //     handleNext={handleNext}
          //     handlePrevious={handlePrevious}
          //     setCurrentStep={setCurrentStep}
          //     setCurrentState={setCurrentState}
          //   />
          // )
          currentStep === 4 && currentState === "subscription" ? (
            <Subscription
              handleNext={handleNext}
              handlePrevious={handlePrevious}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
