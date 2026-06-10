import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_REDIRECT,
  DEFAULT_REDIRECT,
  PROTECTED_ROUTES,
} from "@/config/routes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authorization")?.value;
  const tokenType = request.cookies.get("tokenType")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicAuth = ["/auth/login", "/auth/signup"].includes(pathname);

  const isAuthRoute = pathname.startsWith("/auth");
  console.log("🚀 ~ proxy ~ isAuthRoute:", isAuthRoute);

  // Step-wise tokenType condition for registration flow
  if (tokenType === "registration_token") {
    // Users in registration flow can ONLY access /auth/signup
    if (pathname === "/auth/signup") {
      return NextResponse.next();
    }
    // Redirect away from other auth pages (login, forget-password, etc.)
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/signup", request.url));
    }
    // Redirect away from protected routes
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  // Protected route check - must have valid token
  if (isProtected && !token) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT, request.url));
  }

  // Auth page access check - users with access_token shouldn't access login/signup
  // Only redirect if they have a valid access_token (logged in users)
  if (isPublicAuth && token && tokenType === "access_token") {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // Allow free navigation between auth pages when:
  // - No token (logged out)
  // - No tokenType (logged out)
  // - OR user is on an auth page with no valid token
  if (isAuthRoute && !token && !tokenType) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
