import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif — warm, editorial, distinctive. Gives Beacon its "document" character.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const description =
  "Beacon is a digital health passport. Store your blood group, allergies, " +
  "medications and conditions — encrypted — and share them with an approved " +
  "responder in an emergency via a single QR code.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beacon — Digital Health Passport & Emergency Medical ID",
    template: "%s · Beacon",
  },
  description,
  applicationName: "Beacon",
  authors: [{ name: "Ijeoma" }],
  creator: "Ijeoma",
  keywords: [
    "health passport",
    "emergency medical ID",
    "medical information",
    "allergies",
    "blood group",
    "QR code",
    "first responder",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Beacon",
    url: siteUrl,
    title: "Beacon — Digital Health Passport & Emergency Medical ID",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon — Digital Health Passport",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
  category: "health",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
