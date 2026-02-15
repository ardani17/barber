import { Metadata } from "next"
import OfflineContent from "./offline-content"

export const metadata: Metadata = {
  title: "Offline - BARBERBRO",
  description: "Anda sedang offline. Periksa koneksi internet Anda.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default function OfflinePage() {
  return <OfflineContent />
}
