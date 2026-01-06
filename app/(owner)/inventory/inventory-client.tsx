"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Package, Scissors, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import { ServiceModal } from "@/components/service-modal"
import { ProductModal } from "@/components/product-modal"
import { StockAdjustmentModal } from "@/components/stock-adjustment-modal"
import { toggleServiceActive } from "@/actions/services"
import { toggleProductActive, adjustProductStock } from "@/actions/products"

interface Service {
  id: string
  name: string
  price: string
  isActive: boolean
}

interface Product {
  id: string
  name: string
  buyPrice: string
  sellPrice: string
  stock: number
  isActive: boolean
  isLowStock: boolean
}

interface InventoryClientProps {
  initialServices: Service[]
  initialProducts: Product[]
}

export default function InventoryClient({
  initialServices,
  initialProducts
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState("services")
  const [services, setServices] = useState<Service[]>(initialServices)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | undefined>(undefined)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | undefined>(undefined)

  const handleToggleService = async (id: string, currentStatus: boolean) => {
    try {
      await toggleServiceActive(id)
      setServices(services.map(s => 
        s.id === id ? { ...s, isActive: !currentStatus } : s
      ))
    } catch (error) {
      console.error("Error toggling service:", error)
    }
  }

  const handleToggleProduct = async (id: string, currentStatus: boolean) => {
    try {
      await toggleProductActive(id)
      setProducts(products.map(p => 
        p.id === id ? { ...p, isActive: !currentStatus } : p
      ))
    } catch (error) {
      console.error("Error toggling product:", error)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product)
    setStockModalOpen(true)
  }

  const handleCloseServiceModal = () => {
    setServiceModalOpen(false)
    setEditingService(undefined)
  }

  const handleCloseProductModal = () => {
    setProductModalOpen(false)
    setEditingProduct(undefined)
  }

  const handleServiceSuccess = async () => {
    handleCloseServiceModal()
    window.location.reload()
  }

  const handleProductSuccess = async () => {
    handleCloseProductModal()
    window.location.reload()
  }

  const handleStockSuccess = async (adjustment: number, reason: string) => {
    if (adjustingProduct) {
      try {
        await adjustProductStock({
          id: adjustingProduct.id,
          adjustment,
          reason
        })
        setProducts(products.map(p => 
          p.id === adjustingProduct.id 
            ? { ...p, stock: Math.max(0, p.stock + adjustment) }
            : p
        ))
        setStockModalOpen(false)
        setAdjustingProduct(undefined)
      } catch (error) {
        console.error("Error adjusting stock:", error)
      }
    }
  }

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Inventaris</h1>
          <p className="text-xs sm:text-base text-muted-foreground">Kelola layanan dan produk barbershop</p>
        </div>
      </div>

      <Card className="border-yellow-500 dark:border-gray-700 shadow-lg w-full overflow-hidden">
        <CardContent className="p-2 sm:p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <TabsList className="bg-muted border border-yellow-500 dark:border-gray-700 w-full sm:w-auto h-10 sm:h-auto">
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Scissors className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Layanan</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Produk</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-yellow-500 dark:border-gray-700 focus:border-yellow-600 text-xs sm:text-sm h-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (activeTab === "services") {
                      setEditingService(undefined)
                      setServiceModalOpen(true)
                    } else {
                      setEditingProduct(undefined)
                      setProductModalOpen(true)
                    }
                  }}
                  className="bg-yellow-500 text-black hover:bg-yellow-600 shrink-0 h-10 w-10"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="services" className="mt-0 w-full">
              <div className="rounded-md border border-yellow-500 dark:border-gray-700 w-full">
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="text-[10px] sm:text-xs text-foreground whitespace-nowrap py-1.5 px-1">Nama Layanan</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-right whitespace-nowrap py-1.5 px-1">Harga</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-center whitespace-nowrap py-1.5 px-1">Status</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-center whitespace-nowrap py-1.5 px-1">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-2 text-muted-foreground text-[10px] sm:text-xs">
                            Tidak ada layanan ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium text-foreground text-[10px] sm:text-xs py-1.5 px-1">
                              {service.name}
                            </TableCell>
                            <TableCell className="text-right text-foreground text-[10px] sm:text-xs py-1.5 px-1">
                              {formatCurrency(service.price)}
                            </TableCell>
                            <TableCell className="text-center py-1.5 px-1">
                              <Badge 
                                variant={service.isActive ? "default" : "secondary"}
                                className={service.isActive ? "bg-green-500 hover:bg-green-600 text-[10px] px-1.5 py-0.5" : "text-[10px] px-1.5 py-0.5"}
                              >
                                {service.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center py-1.5 px-1">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditService(service)}
                                  className="h-6 w-6 sm:h-7 sm:w-7"
                                >
                                  <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                                <Switch
                                  checked={service.isActive}
                                  onCheckedChange={() => handleToggleService(service.id, service.isActive)}
                                  className="data-[state=checked]:bg-green-500"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0 w-full">
              <div className="rounded-md border border-yellow-500 dark:border-gray-700 w-full">
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="text-[10px] sm:text-xs text-foreground whitespace-nowrap py-1.5 px-1">Nama Produk</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-right whitespace-nowrap py-1.5 px-1 hidden sm:table-cell">Harga Beli</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-right whitespace-nowrap py-1.5 px-1">Harga Jual</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-right whitespace-nowrap py-1.5 px-1">Stock</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-center whitespace-nowrap py-1.5 px-1 hidden sm:table-cell">Status</TableHead>
                        <TableHead className="text-[10px] sm:text-xs text-foreground text-center whitespace-nowrap py-1.5 px-1">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-2 text-muted-foreground text-[10px] sm:text-xs">
                            Tidak ada produk ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium text-foreground text-[10px] sm:text-xs py-1.5 px-1">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {product.stock <= 5 && product.isActive && (
                                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 shrink-0" />
                                )}
                                <span className="truncate max-w-[80px] sm:max-w-none">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-foreground text-[10px] sm:text-xs py-1.5 px-1 hidden sm:table-cell">
                              {formatCurrency(product.buyPrice)}
                            </TableCell>
                            <TableCell className="text-right text-foreground text-[10px] sm:text-xs py-1.5 px-1">
                              {formatCurrency(product.sellPrice)}
                            </TableCell>
                            <TableCell className="text-right text-foreground text-[10px] sm:text-xs py-1.5 px-1">
                              <Badge 
                                variant={product.stock <= 5 ? "destructive" : "outline"}
                                className={product.stock <= 5 ? "bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0.5" : "text-[10px] px-1.5 py-0.5"}
                              >
                                {product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center py-1.5 px-1 hidden sm:table-cell">
                              <Badge 
                                variant={product.isActive ? "default" : "secondary"}
                                className={product.isActive ? "bg-green-500 hover:bg-green-600 text-[10px] px-1.5 py-0.5" : "text-[10px] px-1.5 py-0.5"}
                              >
                                {product.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center py-1.5 px-1">
                              <div className="flex items-center justify-center gap-0.5 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-6 w-6 sm:h-7 sm:w-7"
                                >
                                  <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleAdjustStock(product)}
                                  title="Sesuaikan Stock"
                                  className="h-6 w-6 sm:h-7 sm:w-7 hidden sm:flex"
                                >
                                  <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                                <Switch
                                  checked={product.isActive}
                                  onCheckedChange={() => handleToggleProduct(product.id, product.isActive)}
                                  className="data-[state=checked]:bg-green-500 scale-75 sm:scale-100"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={serviceModalOpen} onOpenChange={handleCloseServiceModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingService ? "Edit Layanan" : "Tambah Layanan"}
            </DialogTitle>
          </DialogHeader>
          <ServiceModal
            open={serviceModalOpen}
            onOpenChange={handleCloseServiceModal}
            onSuccess={handleServiceSuccess}
            editData={editingService ? {
              id: editingService.id,
              name: editingService.name,
              price: editingService.price
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={productModalOpen} onOpenChange={handleCloseProductModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>
          <ProductModal
            open={productModalOpen}
            onOpenChange={handleCloseProductModal}
            onSuccess={handleProductSuccess}
            editData={editingProduct ? {
              id: editingProduct.id,
              name: editingProduct.name,
              buyPrice: editingProduct.buyPrice,
              sellPrice: editingProduct.sellPrice
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {adjustingProduct && (
        <StockAdjustmentModal
          open={stockModalOpen}
          onOpenChange={(open) => {
            setStockModalOpen(open)
            if (!open) setAdjustingProduct(undefined)
          }}
          onSuccess={handleStockSuccess}
          productData={{
            id: adjustingProduct.id,
            name: adjustingProduct.name,
            stock: adjustingProduct.stock
          }}
        />
      )}
    </div>
  )
}
