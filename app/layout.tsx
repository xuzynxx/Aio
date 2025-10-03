import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIO Downloader",
  description: "Download from TikTok, Instagram, YouTube & more!",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
