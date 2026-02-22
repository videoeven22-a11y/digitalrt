import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
};

export const metadata: Metadata = {
  title: "SmartWarga RT 03 Kp. Jati - Sistem Layanan Digital",
  description: "Sistem layanan digital RT 03 / RW 02 Kp. Jati untuk pengajuan surat keterangan, pendaftaran warga, dan pelayanan online lainnya.",
  keywords: ["SmartWarga", "RT 03", "RW 02", "Kp. Jati", "Layanan RT", "Surat Keterangan", "Warga", "Pelayanan Publik"],
  authors: [{ name: "RT 03 / RW 02 Kp. Jati" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-512.png", color: "#16a34a" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartWarga",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "SmartWarga RT 03 Kp. Jati",
    description: "Sistem layanan digital RT 03 / RW 02 Kp. Jati",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <PWAInstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}
