import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define which routes are public
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/sso-callback(.*)",
  "/about(.*)",
  "/pricing(.*)",
  "/integrations(.*)",
  "/blog(.*)",
  "/docs(.*)",
  "/legal(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = new URL(req.url);

  // 1. If hitting a private route and not logged in, go to login
  if (!userId && !isPublicRoute(req)) {
     return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Check onboarding status for logged-in users
  if (userId) {
    const role = (sessionClaims?.metadata as any)?.role as string;
    const hasCompletedOnboarding = (sessionClaims?.metadata as any)?.hasData === true;

    // A. If an employee, they don't need company onboarding
    if (role === "employee") {
       if (isPublicRoute(req) && url.pathname !== "/") {
          return NextResponse.redirect(new URL("/me", req.url));
       }
       return NextResponse.next();
    }

    // B. If already completed onboarding (Admin), don't let them go back to /signup or /login
    if (hasCompletedOnboarding && (url.pathname === "/login" || url.pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // C. If NOT completed onboarding (Admin), and NOT on a public route, send to /signup
    // Exception: Allow the /signup page itself and its internal redirects
    if (!hasCompletedOnboarding && !isPublicRoute(req)) {
       return NextResponse.redirect(new URL("/signup", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
