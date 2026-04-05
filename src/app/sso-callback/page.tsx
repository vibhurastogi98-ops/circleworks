"use client";

// This page handles the OAuth redirect from Google (or any Clerk OAuth provider).
// Clerk's authenticateWithRedirect sends users to /sso-callback, which must
// render AuthenticateWithRedirectCallback to complete the flow.
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
