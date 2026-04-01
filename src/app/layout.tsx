import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CircleWorks | Payroll & HR for Creator Agencies",
    template: "%s | CircleWorks",
  },
  description:
    "CircleWorks is the #1 Payroll & HR platform built for creator agencies, studios, and companies. Pay W-2 staff and 1099 talent flawlessly. Trusted by 500+ agencies nationwide.",
  keywords: [
    "US payroll software",
    "HR platform USA",
    "payroll SaaS",
    "HRIS",
    "ATS",
    "employee benefits",
    "time tracking",
    "CircleWorks",
  ],
  openGraph: {
    title: "CircleWorks | USA Payroll & HR Platform",
    description:
      "All-in-one: Payroll, HRIS, ATS, Benefits, Time, Expenses. Built for every US company.",
    type: "website",
    siteName: "CircleWorks",
    url: "https://circleworks.com",
    images: [
      {
        url: "https://circleworks.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleWorks — USA Payroll & HR Platform",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
