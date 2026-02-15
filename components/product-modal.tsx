"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const productFormSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  buyPrice: z.string().min(1, "Harga beli harus diisi"),
  sellPrice: z.string().min(1, "Harga jual harus diisi"),
  stock: z.string().optional()
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    buyPrice: string
    sellPrice: string
  }
}

export function ProductModal({ open, onOpenChange, onSuccess, editData }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: editData
      ? {
          name: editData.name,
          buyPrice: editData.buyPrice,
          sellPrice: editData.sellPrice
        }
      : {
          name: "",
          buyPrice: "",
          sellPrice: "",
          stock: "0"
        }
  })

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = editData ? `/api/products/${editData.id}` : "/api/products"
      const method = editData ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          buyPrice: data.buyPrice,
          sellPrice: data.sellPrice,
          stock: editData ? undefined : parseInt(data.stock || "0"),
          isActive: true
        })
      })

      if (!res.ok) {
        throw new Error("Gagal menyimpan produk")
      }

      reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal menyimpan produk")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-4 sm:p-6">
        <DialogHeader className="sm:text-left">
          <DialogTitle className="text-lg sm:text-xl">{editData ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {editData
              ? "Edit informasi produk yang ada."
              : "Tambah produk baru ke katalog barbershop."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">Nama Produk</Label>
              <Input
                id="name"
                placeholder="Contoh: Pomade"
                {...register("name")}
                className="text-sm"
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-xs sm:text-sm text-red-500" role="alert">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buyPrice" className="text-sm">Harga Beli</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register("buyPrice")}
                  className="text-sm"
                  aria-describedby={errors.buyPrice ? "buyPrice-error" : undefined}
                />
                {errors.buyPrice && (
                  <p id="buyPrice-error" className="text-xs sm:text-sm text-red-500" role="alert">{errors.buyPrice.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellPrice" className="text-sm">Harga Jual</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register("sellPrice")}
                  className="text-sm"
                  aria-describedby={errors.sellPrice ? "sellPrice-error" : undefined}
                />
                {errors.sellPrice && (
                  <p id="sellPrice-error" className="text-xs sm:text-sm text-red-500" role="alert">{errors.sellPrice.message}</p>
                )}
              </div>
            </div>
            {!editData && (
              <div className="grid gap-2">
                <Label htmlFor="stock" className="text-sm">Stock Awal</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock")}
                  className="text-sm"
                />
              </div>
            )}
            {error && <p className="text-xs sm:text-sm text-red-500" role="alert">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Menyimpan..." : editData ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
