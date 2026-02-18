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
  title: "SMK Sunan Giri Menganti",
  description: "Website resmi SMK Sunan Giri dengan fitur PPDB Online, AI Recommendation System, Tracer Study Alumni, dan BKK Online. Daftarkan diri Anda sekarang!",
  keywords: "SMK Sunan Giri, PPDB Online, pendaftaran siswa, career services, tracer study, BKK",
  authors: [{ name: "SMK Sunan Giri" }],
  creator: "SMK Sunan Giri",
  publisher: "SMK Sunan Giri",
  robots: {
    index: true,
    follow: true,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://smksunangiri.sch.id",
    siteName: "SMK Sunan Giri",
    title: "SMK Sunan Giri - Sekolah Menengah Kejuruan Terkemuka",
    description: "Website resmi SMK Sunan Giri dengan PPDB Online, AI Recommendation, Tracer Study Alumni, dan Layanan BKK",
    images: [
      {
        url: "https://smksunangiri.sch.id/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SMK Sunan Giri",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMK Sunan Giri - PPDB Online & Career Services",
    description: "Daftar PPDB, cek rekomendasi jurusan, ikuti tracer study alumni, dan akses layanan BKK di SMK Sunan Giri",
    images: ["https://smksunangiri.sch.id/og-image.jpg"],
  },
  alternates: {
    canonical: "https://smksunangiri.sch.id",
  },
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
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://smksunangiri.sch.id" />
      </head>
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
