import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/employees(.*)",
  "/payroll(.*)",
  "/settings(.*)",
  "/me(.*)",
  "/onboarding(.*)",
  "/benefits(.*)",
  "/time(.*)",
  "/compliance(.*)",
  "/reports(.*)",
  "/agency(.*)",
  "/hiring(.*)",
  "/learning(.*)",
  "/performance(.*)",
  "/contractors(.*)",
  "/accountant-portal(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    signInUrl: "/login",
    signUpUrl: "/signup",
    afterSignInUrl: "/dashboard",
    afterSignUpUrl: "/onboarding/company-setup",
  },
);


