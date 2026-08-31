import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { AttributionCapture } from "@/components/campaign/AttributionCapture";
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap"
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bimspect.com"),
  applicationName: "BIMSpect",
  creator: "BIMSpect Ltd",
  publisher: "BIMSpect Ltd",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export default function EnglishRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}
