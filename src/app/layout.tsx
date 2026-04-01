import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1628",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://circleworks.vercel.app"),
  title: {
    default: "CircleWorks — Payroll Software for US Companies & HR Platform",
    template: "%s | CircleWorks",
  },
  description:
    "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform. 30-day free trial, no setup fees.",
  keywords: [
    "payroll software USA",
    "HR platform",
    "online payroll",
    "small business payroll software",
    "all-in-one HR platform",
    "CircleWorks",
  ],
  alternates: {
    canonical: "./",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    title: "CircleWorks — #1 Payroll & HR Platform for US Companies",
    description: "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.vercel.app",
    images: [
      {
        url: "https://circleworks.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks — USA Payroll & HR Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleWorks — #1 Payroll & HR Platform for US Companies",
    description: "Run payroll in 3 clicks. All 50 states, auto tax filing, HRIS, ATS & benefits — one platform.",
    images: ["https://circleworks.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─────────────────────────────────────────────
 * Replace with your real IDs before deploying:
 *   GA4:        G-XXXXXXXXXX
 *   Meta Pixel: XXXXXXXXXXXXXXXX
 * ───────────────────────────────────────────── */
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
const META_PIXEL_ID = "XXXXXXXXXXXXXXXX";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* SEO Update */}
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <link rel="alternate" hrefLang="en-us" href="https://circleworks.vercel.app/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* ── Google Fonts ── */}
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

      {/* ── Google Analytics 4 ── */}
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

      {/* ── Meta (Facebook) Pixel ── */}
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

      <body className="antialiased">{children}</body>
    </html>
  );
}
