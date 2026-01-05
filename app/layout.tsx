import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
