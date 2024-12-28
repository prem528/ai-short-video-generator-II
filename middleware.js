import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // Redirect to the homepage if a non-admin tries to access admin routes
  if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin") {
    const url = new URL("/dashboard", req.url);
    return NextResponse.redirect(url);
  }

  // Redirect admin to the admin dashboard after sign-in
  if (
    req.nextUrl.pathname === "/" &&
    sessionClaims?.metadata?.role === "admin"
  ) {
    const url = new URL("/admin", req.url);
    return NextResponse.redirect(url);
  }

  // Protect routes defined as protected
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
