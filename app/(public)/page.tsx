import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, CheckCircle, Zap, Scissors, Clock, Star, MapPin, Phone, Mail, Calendar, Award, Users, Sparkles, BadgeDollarSign, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "BARBERBRO - Barbershop Profesional | Potong Rambut & Grooming Terbaik",
  description: "BARBERBRO adalah barbershop profesional dengan layanan potong rambut terbaik, hair styling, dan grooming untuk pria. Booking appointment online sekarang untuk pengalaman potong rambut premium dengan barber berpengalaman.",
  keywords: ["BARBERBRO", "barberbro", "barbershop", "barber", "potong rambut", "haircut", "hair styling", "grooming", "barber profesional", "salon pria", "potong rambut pria", "barbershop terbaik", "barbershop near me", "barbershop Indonesia"],
  openGraph: {
    title: "BARBERBRO - Barbershop Profesional",
    description: "Layanan potong rambut dan grooming profesional. Booking appointment online untuk pengalaman barbershop terbaik dengan barber berpengalaman.",
    url: "https://baberbro.com",
    images: [
      {
        url: "/og-barbershop.jpg",
        width: 1200,
        height: 630,
        alt: "BARBERBRO - Barbershop Profesional"
      }
    ]
  }
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Barbershop",
  "name": "BARBERBRO",
  "alternateName": "barberbro",
  "description": "BARBERBRO adalah barbershop profesional yang menyediakan layanan potong rambut, hair styling, dan grooming untuk pria dengan barber berpengalaman dan kualitas terbaik.",
  "url": "https://baberbro.com",
  "telephone": "+6285376541422",
  "email": "info@baberbro.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Raya Banjarsugihan No.103",
    "addressLocality": "Surabaya",
    "addressRegion": "Jawa Timur",
    "postalCode": "60185",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-7.2654",
    "longitude": "112.7366"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "22:00"
    }
  ],
  "priceRange": "Rp 50.000 - Rp 200.000",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "sameAs": [
    "https://www.instagram.com/barber_bro_surabaya",
    "https://www.facebook.com/barber_bro_surabaya",
    "https://wa.me/6285376541422"
  ]
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://baberbro.com"
    }
  ]
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main id="main-content" role="main" aria-label="Konten utama" className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <nav aria-label="Menu utama" className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            BARBERBRO
          </h1>
          <div className="flex flex-wrap justify-end gap-2 sm:gap-4">
            <a 
              href="tel:+6285376541422" 
              className="px-3 sm:px-6 py-2 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors font-semibold flex items-center gap-2 text-xs sm:text-base"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Hubungi Kami</span>
            </a>
            <Link 
              href="#booking" 
              className="px-3 sm:px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-semibold text-xs sm:text-base"
            >
              <span className="hidden sm:inline">Booking Sekarang</span>
              <span className="sm:hidden">Booking</span>
            </Link>
            <Link 
              href="/login" 
              className="px-3 sm:px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors font-semibold flex items-center gap-2 text-xs sm:text-base"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        </div>
        </nav>

        <section className="container mx-auto px-4 py-8 sm:py-16 md:py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-5 bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
              BARBERBRO
            </h2>
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">
              Barbershop Profesional & Grooming Terbaik
            </p>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-5 sm:mb-8 max-w-2xl mx-auto">
              Nikmati pengalaman potong rambut premium dengan barber berpengalaman. Layanan profesional untuk gaya rambut dan grooming pria yang modern dan trendi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                href="#booking" 
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2"
              >
                Booking Appointment
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <a 
                href="https://wa.me/6285376541422" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                WhatsApp
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">4.8/5</span>
              </div>
              <span>•</span>
              <span>250+ Review</span>
              <span>•</span>
              <span>4+ Tahun Pengalaman</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-10">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Mengapa Memilih BARBERBRO?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              BARBERBRO adalah barbershop profesional dengan barber berpengalaman dan kualitas layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">Barber Profesional</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tim barber BARBERBRO berpengalaman dengan sertifikasi profesional.</p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">Teknik Terbaik</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Menggunakan teknik potong rambut modern dan peralatan premium.</p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">Layanan Cepat</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Booking mudah dan layanan efisien tanpa menunggu lama.</p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">Pelayanan Ramah</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Kenyamanan dan kepuasan pelanggan adalah prioritas BARBERBRO.</p>
            </div>
          </div>
        </section>

        <section id="layanan" className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Layanan BARBERBRO
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Berbagai layanan potong rambut dan grooming untuk tampilan maksimal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Haircut</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Potong rambut dengan teknik profesional dan sesuai dengan tren terkini.</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">Rp 30.000</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Styling</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Penataan rambut dengan produk berkualitas untuk tampilan maksimal.</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">Rp 25.000</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Shave</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Cukur jenggot dan kumis dengan teknik wet shave yang nyaman.</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">Rp 15.000</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Hair Colouring</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Pewarnaan rambut profesional dengan berbagai pilihan warna.</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">Rp 150.000</span>
              </div>
            </div>
          </div>
        </section>

        <section id="barber" className="container mx-auto px-4 py-12 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-10">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Kenapa Memilih BARBERBRO?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Keunggulan yang membuat BARBERBRO menjadi pilihan terbaik untuk kebutuhan grooming Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Barber Profesional</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Tim barber berpengalaman dengan teknik terkini dan keahlian di berbagai gaya potongan rambut pria modern.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Produk Berkualitas</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Menggunakan produk-produk profesional berkualitas tinggi untuk hasil terbaik dan kesehatan rambut Anda.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <BadgeDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Harga Terjangkau</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Harga kompetitif dengan kualitas layanan premium, memberikan nilai terbaik untuk setiap rupiah yang Anda keluarkan.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Jam Operasional Fleksibel</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Buka setiap hari dari 10:00 - 22:00, memberikan kemudahan bagi Anda untuk booking kapan saja sesuai jadwal.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Lokasi Strategis</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Berlokasi di Surabaya Barat dengan akses mudah, parkir luas, dan lingkungan yang nyaman untuk grooming.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl mb-4 sm:mb-6 flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Layanan Ramah</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Pelayanan yang ramah, profesional, dan personal untuk memberikan pengalaman grooming yang menyenangkan.
              </p>
            </div>
          </div>
        </section>

        <section id="review" className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Apa Kata Pelanggan BARBERBRO?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 italic text-sm sm:text-base">
                "BARBERBRO adalah barbershop terbaik yang pernah saya kunjungi. Barber-nya sangat profesional dan hasil potong rambutnya selalu memuaskan!"
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Rizky Firmansyah</p>
              <p className="text-xs sm:text-sm text-gray-500">Pelanggan Setia</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 italic text-sm sm:text-base">
                "Layanan di BARBERBRO sangat cepat dan rapi. Booking mudah dan tidak perlu menunggu lama. Highly recommended!"
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Andi Pratama</p>
              <p className="text-xs sm:text-sm text-gray-500">Pelanggan VIP</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 italic text-sm sm:text-base">
                "Harga sangat terjangkau untuk kualitas layanan premium. Barber-nya ramah dan pelayanannya excellent. BARBERBRO memang the best!"
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Dedi Kurniawan</p>
              <p className="text-xs sm:text-sm text-gray-500">Pelanggan Regular</p>
            </div>
          </div>
        </section>

        <section id="booking" className="container mx-auto px-4 py-12 sm:py-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl shadow-2xl mb-8 sm:mb-10">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 sm:mb-6 text-white">
              Booking Appointment Sekarang
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-yellow-50 mb-6 sm:mb-8">
              Booking mudah dan cepat di BARBERBRO. Hubungi kami untuk membuat appointment atau langsung datang ke barbershop kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/6285376541422" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-bold text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Booking via WhatsApp
              </a>
              <a 
                href="tel:+6285376541422" 
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Telepon Langsung
              </a>
            </div>
          </div>
        </section>

        <section id="kontak" className="container mx-auto px-4 py-12 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl mb-8 sm:mb-10">
          <div className="text-center mb-10 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Hubungi BARBERBRO
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Kunjungi barbershop kami atau hubungi untuk informasi lebih lanjut
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-5 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Lokasi</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Jl. Raya Banjarsugihan No.103<br />
                Banjar Sugihan, Kec. Tandes, Surabaya, Jawa Timur 60185
              </p>
            </div>

            <div className="text-center p-5 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Telepon</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                +62 853-7654-1422
              </p>
              <a 
                href="https://wa.me/6285376541422" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base"
              >
                WhatsApp
              </a>
            </div>

            <div className="text-center p-5 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Jam Operasional</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Setiap Hari: 10:00 - 22:00
              </p>
            </div>
          </div>
        </section>

        <footer role="contentinfo" className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-2xl font-bold mb-4 text-yellow-400">BARBERBRO</h4>
                <p className="text-gray-400 mb-4">
                  BARBERBRO adalah barbershop profesional yang menyediakan layanan potong rambut, hair styling, dan grooming untuk pria dengan barber berpengalaman.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.instagram.com/barber_bro_surabaya" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    Instagram
                  </a>
                  <a 
                    href="#" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
              <div>
                <h5 className="font-bold mb-4">Layanan</h5>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#layanan" className="hover:text-yellow-400 transition-colors">Haircut</Link></li>
                  <li><Link href="#layanan" className="hover:text-yellow-400 transition-colors">Styling</Link></li>
                  <li><Link href="#layanan" className="hover:text-yellow-400 transition-colors">Shave</Link></li>
                  <li><Link href="#layanan" className="hover:text-yellow-400 transition-colors">Hair Colouring</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-4">Informasi</h5>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#barber" className="hover:text-yellow-400 transition-colors">Tim Barber</Link></li>
                  <li><Link href="#review" className="hover:text-yellow-400 transition-colors">Review</Link></li>
                  <li><Link href="#booking" className="hover:text-yellow-400 transition-colors">Booking</Link></li>
                  <li><Link href="#kontak" className="hover:text-yellow-400 transition-colors">Kontak</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-4">Hubungi Kami</h5>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+6285376541422" className="hover:text-yellow-400 transition-colors">
                      +62 853-7654-1422
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:info@baberbro.com" className="hover:text-yellow-400 transition-colors">
                      info@baberbro.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Surabaya, Indonesia</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2026 BARBERBRO. All rights reserved.</p>
              <p className="mt-2 text-sm">
                BARBERBRO - Barbershop Profesional | Domain: baberbro.com | Layanan Potong Rambut & Grooming Terbaik
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
