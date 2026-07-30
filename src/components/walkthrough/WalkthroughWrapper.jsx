"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Joyride, STATUS } from "react-joyride";
import WelcomeModal from "./WelcomeModal";
import CustomTooltip from "./CustomTooltip";
import { walkthroughSteps } from "./walkthroughSteps";

const WalkthroughWrapper = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only check and show walkthrough on dashboard pages
    if (!pathname?.startsWith("/dashboard")) {
      return;
    }

    const shouldShow =
      localStorage.getItem("show_welcome_walkthrough") === "true" ||
      localStorage.getItem("is_new_signup") === "true";

    if (shouldShow) {
      setShowWelcome(true);
    }
  }, [pathname]);

  const clearWalkthroughFlags = () => {
    try {
      localStorage.removeItem("show_welcome_walkthrough");
      localStorage.removeItem("is_new_signup");
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartWalkthrough = () => {
    setShowWelcome(false);
    clearWalkthroughFlags();
    // Short delay to let WelcomeModal unmount before starting Joyride tour
    setTimeout(() => {
      setRunTour(true);
    }, 200);
  };

  const handleSkipWalkthrough = () => {
    setShowWelcome(false);
    setRunTour(false);
    clearWalkthroughFlags();
  };

  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;

    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (
      finishedStatuses.includes(status) ||
      type === "tour:end" ||
      action === "close" ||
      action === "reset" ||
      action === "stop"
    ) {
      setRunTour(false);
      clearWalkthroughFlags();
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onStart={handleStartWalkthrough}
        onSkip={handleSkipWalkthrough}
      />

      {/* Joyride Tour - Uncontrolled mode for 100% smooth step transitions */}
      <Joyride
        steps={walkthroughSteps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={false}
        disableOverlayClose={false}
        spotlightClicks={false}
        spotlightPadding={6}
        scrollToFirstStep={true}
        scrollOffset={100}
        tooltipComponent={CustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 99999,
            overlayColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      />
    </>
  );
};

export default WalkthroughWrapper;
