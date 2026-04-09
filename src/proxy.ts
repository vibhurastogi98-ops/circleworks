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

  // 2. Handle routing for signed-in users
  if (userId) {
    const role = (sessionClaims?.metadata as any)?.role as string;

    // A. Employee Portal Routing
    if (role === "employee") {
       if (isPublicRoute(req) && url.pathname !== "/") {
          return NextResponse.redirect(new URL("/me", req.url));
       }
       return NextResponse.next();
    }

    // B. Admin/Owner Routing (Direct to Dashboard)
    if (url.pathname === "/login" || url.pathname === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
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
