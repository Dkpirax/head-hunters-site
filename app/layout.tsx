import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Head Hunters | Premium Workforce Solutions",
    template: "%s | Head Hunters",
  },
  description:
    "Head Hunters brings people, precision and progress to executive search, permanent recruitment, labour hire and multi-country workforce support across Australia, New Zealand and Sri Lanka.",
  keywords: [
    "recruitment",
    "labour hire",
    "executive search",
    "workforce solutions",
    "casual staffing",
    "remote staff",
    "Australia",
    "New Zealand",
    "Sri Lanka",
  ],
  authors: [{ name: "Head Hunters" }],
  creator: "Head Hunters",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Head Hunters",
    title: "Head Hunters | Premium Workforce Solutions",
    description:
      "Precision hiring. Human results. Executive search, permanent recruitment, labour hire and remote staffing across Australia, New Zealand and Sri Lanka.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Head Hunters | Premium Workforce Solutions",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { FloatingButtons } from "@/components/layout/FloatingButtons";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`font-sans antialiased`}>
        <SmoothScroll>
          <div className="grain" aria-hidden="true" />
          <div className="aurora" aria-hidden="true" />
          {children}
          <FloatingButtons />
        </SmoothScroll>
      </body>
    </html>
  );
}
