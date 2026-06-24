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
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

const ONBOARDING_ROUTE = "/auth/signup";

const AuthContext = createContext(null);
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const hasToken = typeof window !== "undefined" && !!(Cookies.get("token") || Cookies.get("authorization"));

  const cachedAuth = useMemo(() => {
    if (!hasToken) return null;

    try {
      const sessionType = Cookies.get("sessionType");
      const onboardingStep = Cookies.get("onboardingStep");
      const userVal = Cookies.get("user");
      const user = userVal ? JSON.parse(userVal) : null;
      if (sessionType) {
        return { sessionType, onboardingStep, user };
      }
    } catch (e) {
      console.error("Failed to parse cached auth cookies:", e);
    }
    return null;
  }, [hasToken]);

  useEffect(() => {
    if (!hasToken) {
      queryClient.setQueryData(["auth-me"], null);
    }
  }, [hasToken, queryClient]);

  const {
    data: authData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAuthMe({
    initialData: cachedAuth || undefined,
    enabled: hasToken,
  });

  const sessionType = authData?.sessionType ?? authData?.tokenType ?? null;
  const onboardingStep = authData?.onboardingStep ?? "create_account";
  const user = authData?.user ?? null;
  const isAuthenticated = sessionType === "access_token";
  const isOnboarding = sessionType === "registration_token";

  useEffect(() => {
    if (authData) {
      if (authData.sessionType) {
        Cookies.set("sessionType", authData.sessionType, { expires: 7, path: "/" });
      } else if (authData.tokenType) {
        Cookies.set("sessionType", authData.tokenType, { expires: 7, path: "/" });
      }
      if (authData.onboardingStep) {
        Cookies.set("onboardingStep", authData.onboardingStep, { expires: 7, path: "/" });
      }
      if (authData.user) {
        Cookies.set("user", JSON.stringify(authData.user), { expires: 7, path: "/" });
      }
    } else if (authData === null || isError) {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("authorization", { path: "/" });
      Cookies.remove("sessionType", { path: "/" });
      Cookies.remove("onboardingStep", { path: "/" });
      Cookies.remove("user", { path: "/" });
    }
  }, [authData, isError]);

  useEffect(() => {
    if (
      pathname.startsWith("/dashboard") &&
      (sessionType === "registration_token" || user?.isSubscribed === false)
    ) {
      refetch();
    }
  }, [pathname, sessionType, user?.isSubscribed, refetch]);

  // Resolved once the FIRST load settles (success or 401).
  // We deliberately ignore isFetching so background refetches
  // (window focus, interval, etc.) never re-trigger the full-screen loader,
  // EXCEPT when the user's cached state is incomplete (e.g., they just returned from Stripe).
  const isResolved = !isLoading && !(isFetching && (sessionType === "registration_token" || user?.isSubscribed === false));

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
      user?.isSubscribed === true
    ) {
      return pathname.startsWith("/dashboard") ? null : DEFAULT_REDIRECT;
    }

    if (isAuthenticated && onboardingStep === "create_lounge") {
      return isOnboardingRoute ? null : ONBOARDING_ROUTE;
    }

    if (
      isAuthenticated &&
      onboardingStep === "completed" &&
      user?.isSubscribed === false
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
