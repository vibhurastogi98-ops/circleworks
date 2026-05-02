import type { Metadata, Viewport } from "next";
import Script from "next/script";

import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import CookieBanner from "@/components/legal/CookieBanner";
import CirceWidget from "@/components/CirceWidget";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";
import SocketProvider from "@/components/SocketProvider";
import { AuthProvider } from "@/context/AuthContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1628",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://circleworks.vercel.app"),
  title: {
    default:
      "CircleWorks — THE ONLY PAYROLL & HR PLATFORM FOR CREATORS, AGENCIES & COMPANIES",
    template: "%s | CircleWorks",
  },
  description:
    "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform.",
};

const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
const META_PIXEL_ID = "XXXXXXXXXXXXXXXX";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <link
          rel="alternate"
          hrefLang="en-us"
          href="https://circleworks.vercel.app/"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      {/* Google Analytics */}
      {GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          if ('${META_PIXEL_ID}' !== 'XXXXXXXXXXXXXXXX') {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          }
        `}
      </Script>

      <body className="antialiased" suppressHydrationWarning>
        <Toaster position="top-right" richColors />
        <KeyboardShortcuts />
        <CookieBanner />
        
        {/* ✅ WCAG 2.1 AA Skip Navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all"
        >
          Skip to main content
        </a>

        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <CirceWidget />
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}