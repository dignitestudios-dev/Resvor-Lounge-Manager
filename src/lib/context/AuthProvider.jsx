// lib/context/AuthProvider.jsx
"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMe } from "@/lib/hooks/queries/useQueries";
import {
  AUTH_REDIRECT,
  DEFAULT_REDIRECT,
  PROTECTED_ROUTES,
} from "@/config/routes";

const ONBOARDING_ROUTE = "/auth/signup";

const AuthContext = createContext(null);
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: authData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAuthMe();
  console.log("🚀 ~ AuthProvider ~ isLoading:", isLoading);
  console.log("🚀 ~ AuthProvider ~ authData:", authData);

  // Resolved once the FIRST load settles (success or 401).
  // We deliberately ignore isFetching so background refetches
  // (window focus, interval, etc.) never re-trigger the full-screen loader.
  const isResolved = !isLoading;

  const sessionType = authData?.sessionType ?? null;
  const onboardingStep = authData?.onboardingStep ?? "create_account";
  const user = authData?.user ?? null;
  const isAuthenticated = sessionType === "access_token";
  const isOnboarding = sessionType === "registration_token";

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = pathname.startsWith("/auth");
  const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

  const redirectTarget = useMemo(() => {
    if (!isResolved) return null;

    if (
      isAuthenticated &&
      onboardingStep === "completed" &&
      user.isSubscribed === true
    ) {
      return pathname.startsWith("/dashboard") ? null : DEFAULT_REDIRECT;
    }

    if (isAuthenticated && onboardingStep === "create_lounge") {
      return isOnboardingRoute ? null : ONBOARDING_ROUTE;
    }

    if (
      isAuthenticated &&
      onboardingStep === "completed" &&
      user.isSubscribed === false
    ) {
      return isOnboardingRoute ? null : ONBOARDING_ROUTE;
    }

    if (isOnboarding) {
      return isOnboardingRoute ? null : ONBOARDING_ROUTE;
    }

    // logged out
    return isProtectedRoute ? AUTH_REDIRECT : null;
  }, [
    isResolved,
    pathname,
    isAuthenticated,
    isOnboarding,
    isAuthRoute,
    isOnboardingRoute,
    isProtectedRoute,
  ]);
  console.log("🚀 ~ AuthProvider ~ redirectTarget:", redirectTarget);

  useEffect(() => {
    if (redirectTarget && redirectTarget !== pathname) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, pathname, router]);

  const contextValue = useMemo(
    () => ({
      authData,
      sessionType,
      onboardingStep,
      user,
      isAuthenticated,
      isOnboarding,
      isAuthLoading: !isResolved,
      isFetching,
      isError,
      refetchAuth: refetch,
    }),
    [
      authData,
      sessionType,
      onboardingStep,
      user,
      isAuthenticated,
      isOnboarding,
      isResolved,
      isFetching,
      isError,
      refetch,
    ],
  );

  // Block render while auth state is unknown, AND while a redirect is pending —
  // this is what stops a flash of /dashboard or /auth/signup before the route swaps.
  if (!isResolved || redirectTarget) {
    return (
      <div className="flex justify-center items-center h-screen w-screen text-white backgroundImage">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
