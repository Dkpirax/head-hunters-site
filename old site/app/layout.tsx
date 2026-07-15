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
import { getSettings } from "@/app/actions/settings";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  // Maintenance mode validation
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const session = await auth();

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");
  const isAdmin = session?.user && (session.user as any).role !== "USER";

  const isMaintenance = settings.maintenance_mode_enabled && !isAdmin && !isLoginPage && !isAdminPage && !isApiRoute;

  if (isMaintenance) {
    return (
      <html lang="en" className={dmSans.variable}>
        <body className="font-sans antialiased bg-[#0B0B0C] text-white flex items-center justify-center min-h-screen px-5 relative overflow-hidden">
          <div className="grain" aria-hidden="true" />
          <div className="aurora" aria-hidden="true" />
          <div className="max-w-[480px] w-full text-center p-8 rounded-[24px] border border-white/10 bg-white/4 backdrop-blur-xl relative z-10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#02695e]/20 border border-[#04a891]/30 flex items-center justify-center mx-auto mb-6 text-[#04a891]">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-3">System Maintenance</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {settings.maintenance_message || "We are currently performing scheduled maintenance. Please check back soon."}
            </p>
            <div className="text-[10px] text-white/20 uppercase tracking-widest pt-5 border-t border-white/6">
              Head Hunters Workforce Systems
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`font-sans antialiased`}>
        <SmoothScroll>
          <div className="grain" aria-hidden="true" />
          <div className="aurora" aria-hidden="true" />
          {children}
          <FloatingButtons chatbotEnabled={settings.flag_chatbot_enabled} />
        </SmoothScroll>
      </body>
    </html>
  );
}
