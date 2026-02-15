import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToasterProvider } from "@/components/toaster-provider"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://baberbro.com"),
  title: {
    default: "BARBERBRO - Sistem Manajemen Barbershop Terlengkap di Indonesia",
    template: "%s | BARBERBRO"
  },
  description: "Kelola barbershop Anda dengan mudah menggunakan sistem manajemen terlengkap. Tracking penjualan, komisi barber, inventaris, absensi, dan laporan keuangan dalam satu aplikasi. Coba gratis sekarang!",
  keywords: ["sistem manajemen barbershop", "aplikasi kasir barbershop", "software barbershop", "POS barbershop", "sistem kasir barbershop Indonesia", "aplikasi manajemen barbershop", "BARBERBRO"],
  authors: [{ name: "BARBERBRO" }],
  creator: "BARBERBRO",
  publisher: "BARBERBRO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://baberbro.com",
    title: "BARBERBRO - Sistem Manajemen Barbershop Terlengkap di Indonesia",
    description: "Kelola barbershop Anda dengan mudah. Tracking penjualan, komisi barber, inventaris, absensi, dan laporan keuangan dalam satu aplikasi.",
    siteName: "BARBERBRO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BARBERBRO - Dashboard Sistem Manajemen Barbershop"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BARBERBRO - Sistem Manajemen Barbershop Terlengkap",
    description: "Kelola barbershop Anda dengan mudah. Tracking penjualan, komisi barber, inventaris, absensi, dan laporan keuangan dalam satu aplikasi.",
    images: ["/twitter-image.jpg"],
    creator: "@barberbro_id"
  },
  alternates: {
    canonical: "https://baberbro.com"
  },
  verification: {
    google: "google-site-verification-code"
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:text-foreground"
        >
          Langsung ke konten utama
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToasterProvider>
            <ServiceWorkerRegistration />
            {children}
          </ToasterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
