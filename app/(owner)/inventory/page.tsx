import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { getServices } from "@/actions/services"
import { getProducts } from "@/actions/products"
import InventoryClient from "./inventory-client"

export const metadata = {
  title: "Inventaris - BaberShop",
  description: "Kelola layanan dan produk barbershop"
}

export const dynamic = "force-dynamic"

async function InventoryContent() {
  const [services, products] = await Promise.all([
    getServices(),
    getProducts()
  ])

  return (
    <InventoryClient
      initialServices={services}
      initialProducts={products}
    />
  )
}

function InventorySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-2 sm:px-0">
        <div>
          <div className="h-8 sm:h-10 w-40 sm:w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 sm:h-6 w-48 sm:w-96 bg-muted rounded animate-pulse mt-2" />
        </div>
      </div>
      <Card className="border-yellow-500 dark:border-gray-700 shadow-lg w-full overflow-hidden">
        <CardContent className="p-2 sm:p-4">
          <div className="h-10 sm:h-12 w-full bg-muted rounded animate-pulse mb-4" />
          <div className="rounded-md border border-yellow-500 dark:border-gray-700 w-full">
            <div className="h-64 sm:h-80 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryContent />
    </Suspense>
  )
}
