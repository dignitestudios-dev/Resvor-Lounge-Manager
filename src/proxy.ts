import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_REDIRECT,
  DEFAULT_REDIRECT,
  PROTECTED_ROUTES,
} from "@/config/routes";

const getTokenType = (token: string): string | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    );

    return decodedPayload?.type ?? null;
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("🚀 ~ proxy ~ pathname:", pathname);

  const token = request.cookies.get("authorization")?.value;
  const tokenType = token ? getTokenType(token) : null;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isOnboardingRoute = pathname === "/auth/signup";
  const isAuthRoute = pathname.startsWith("/auth");

  /*
  |--------------------------------------------------------------------------
  | STATE 1 — FULLY AUTHENTICATED USER (access_token)
  |--------------------------------------------------------------------------
  */
  if (token && tokenType === "access_token") {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  // if (token && tokenType === "access_token") {
  //   // Allow authenticated users to access signup temporarily
  //   if (pathname === "/auth/signup") {
  //     return NextResponse.next();
  //   }

  //   if (isAuthRoute) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }

  //   return NextResponse.next();
  // }

  /*
  |--------------------------------------------------------------------------
  | STATE 2 — ONBOARDING USER (registration_token)
  |--------------------------------------------------------------------------
  */
  if (token && tokenType === "registration_token") {
    if (isOnboardingRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  /*
  |--------------------------------------------------------------------------
  | STATE 3 — LOGGED OUT
  | Treat the same as a new user — /auth/login and /auth/signup are both open.
  | Only block access to protected app routes.
  |--------------------------------------------------------------------------
  */
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
