"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { IoMailOutline, IoCallOutline } from "react-icons/io5";
import { LiaIdCard } from "react-icons/lia";
import { IoMdPerson } from "react-icons/io";
import { FaClipboardList } from "react-icons/fa";

import OnboardingStepper from "../../../components/onBoarding/OnboardingSteps";

import CreateAccount from "../../../components/onBoarding/CreateAccount";
import VerifyEmail from "../../../components/onBoarding/VerifyEmail";
import VerifyPhone from "../../../components/onBoarding/VerifyPhone";
import PersonalDetails from "../../../components/onBoarding/PersonalDetails";
import Subscription from "../../../components/onBoarding/Subscription";

import { useLogout } from "@/lib/hooks/mutations/AuthMutations";

import { ErrorToast } from "@/components/ui/toaster";
import { useAuthContext } from "@/lib/context/AuthProvider";
import Completed from "@/components/onBoarding/Completed";

export default function SignUp() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { onboardingStep: sessionOnboardingStep, user } = useAuthContext();

  const logoutMutation = useLogout();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [email, setEmail] = useState("");

  const onboardingStep = sessionOnboardingStep || "create_account";

  const stepMap = {
    create_account: 0,
    verify_email: 1,
    verify_mobile: 2,
    buy_subscription: 3,
    create_lounge: 4,
    completed: 5,
  };

  const currentStep = stepMap[onboardingStep] ?? 0;

  const providerSteps = [
    {
      icon: IoMdPerson,
      title: "Your Details",
    },
    {
      icon: IoMailOutline,
      title: "Verify Email",
    },
    {
      icon: IoCallOutline,
      title: "Verify Number",
    },
    {
      icon: LiaIdCard,
      title: "Subscription",
    },
    {
      icon: FaClipboardList,
      title: "Create Lounge",
    },
  ];

  const steps = providerSteps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    active: index === currentStep,
  }));

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logoutMutation.mutateAsync();
      queryClient.setQueryData(["auth-me"], null);
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.clear();

      router.replace("/auth/login");
    } catch (error) {
      if (error?.code === "NO_INTERNET") {
        ErrorToast(error.message);
      } else {
        ErrorToast(
          error?.response?.data?.message ||
          "An error occurred during logout. Please try again.",
        );
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderedScreen = useMemo(() => {
    switch (onboardingStep) {
      case "create_account":
        return <CreateAccount setEmail={setEmail} />;
      case "verify_email":
        return (
          <VerifyEmail email={email || user?.email} handlePrevious={handleLogout} />
        );
      case "verify_mobile":
        return (
          <VerifyPhone email={email || user?.email} handlePrevious={handleLogout} />
        );
      case "buy_subscription":
        return <Subscription handlePrevious={handleLogout} />;
      case "create_lounge":
        return <PersonalDetails handlePrevious={handleLogout} />;
      case "completed":
        return <Completed />;

      default:
        return <CreateAccount setEmail={setEmail} />;
    }
  }, [onboardingStep, user?.email, email]);

  if (isLoggingOut) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full w-full">
      <OnboardingStepper steps={steps} currentStep={currentStep} />

      <div className="col-span-12 lg:col-span-8 px-5 md:px-10 h-full flex justify-center items-center">
        <div className="w-full relative flex justify-center flex-col items-center h-full">
          {renderedScreen}
        </div>
      </div>
    </div>
  );
}
