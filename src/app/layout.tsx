import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from '@/components/common/ToastProvider';
import { startJobCleanupScheduler } from '@/lib/jobs/scheduler';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMK Sunan Giri - Website Resmi",
  description: "Website resmi SMK Sunan Giri dengan fitur PPDB Online, AI Recommendation System, Tracer Study Alumni, dan BKK Online",
};

// Start job cleanup scheduler when server starts
if (typeof window === 'undefined') {
  startJobCleanupScheduler();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
