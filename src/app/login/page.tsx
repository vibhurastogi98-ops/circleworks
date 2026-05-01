"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        forceRedirectUrl="/dashboard"
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: "#0ea5e9",
            colorBackground: "#0f172a",
            colorInputBackground: "#1e293b",
            colorInputText: "#f1f5f9",
            colorText: "#f1f5f9",
            borderRadius: "8px",
          },
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            card: "bg-slate-900 border-slate-700",
            headerTitle: "text-slate-200",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton:
              "bg-slate-800 border-slate-600 hover:bg-slate-700",
            socialButtonsBlockButtonText: "text-slate-200",
            dividerLine: "bg-slate-700",
            dividerText: "text-slate-400",
            formFieldInput: "bg-slate-800 border-slate-600 text-slate-200",
            formFieldLabel: "text-slate-300",
            footerActionLink: "text-blue-400 hover:text-blue-300",
          },
        }}
      />
    </div>
  );
}
