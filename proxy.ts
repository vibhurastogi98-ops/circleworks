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

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
