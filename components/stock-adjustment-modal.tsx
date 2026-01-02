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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const stockAdjustmentSchema = z.object({
  adjustment: z.number().int().min(-10000, "Nilai tidak valid").max(10000, "Nilai tidak valid"),
  reason: z.string().min(1, "Alasan harus diisi")
})

type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>

interface StockAdjustmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (adjustment: number, reason: string) => void
  productData: {
    id: string
    name: string
    stock: number
  }
}

export function StockAdjustmentModal({ open, onOpenChange, onSuccess, productData }: StockAdjustmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustment: 0,
      reason: ""
    }
  })

  if (!productData) {
    return null
  }

  const adjustmentValue = watch("adjustment")

  const handleAdjustmentTypeChange = (type: "add" | "subtract") => {
    setAdjustmentType(type)
  }

  const onSubmit = async (data: StockAdjustmentValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const finalAdjustment = adjustmentType === "subtract" ? -Math.abs(data.adjustment) : Math.abs(data.adjustment)

      const res = await fetch(`/api/products/${productData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: productData.stock + finalAdjustment
        })
      })

      if (!res.ok) {
        throw new Error("Gagal menyesuaikan stock")
      }

      reset()
      onSuccess?.(finalAdjustment, data.reason)
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal menyesuaikan stock")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    setAdjustmentType("add")
    onOpenChange(false)
  }

  const getNewStock = () => {
    const adjustment = adjustmentType === "subtract" ? -Math.abs(adjustmentValue || 0) : Math.abs(adjustmentValue || 0)
    return productData.stock + adjustment
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-4 sm:p-6">
        <DialogHeader className="sm:text-left">
          <DialogTitle className="text-lg sm:text-xl">Penyesuaian Stock</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Menyesuaikan stock untuk produk: <strong>{productData.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="bg-muted p-3 sm:p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium">Stock Saat Ini:</span>
                <span className="text-base sm:text-lg font-bold">{productData.stock}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">Tipe Penyesuaian</Label>
              <RadioGroup value={adjustmentType} onValueChange={(val) => handleAdjustmentTypeChange(val as "add" | "subtract")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add" className="cursor-pointer text-sm">Tambah Stock (+)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract" className="cursor-pointer text-sm">Kurangi Stock (-)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment" className="text-sm">Jumlah Penyesuaian</Label>
              <Input
                id="adjustment"
                type="number"
                min="1"
                placeholder="0"
                {...register("adjustment", { valueAsNumber: true })}
                className="text-sm"
              />
              {errors.adjustment && (
                <p className="text-xs sm:text-sm text-red-500">{errors.adjustment.message}</p>
              )}
            </div>

            <div className="bg-muted p-3 sm:p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium">Stock Baru:</span>
                <span className={`text-base sm:text-lg font-bold ${getNewStock() < 0 ? "text-red-500" : getNewStock() <= 5 ? "text-orange-500" : "text-green-500"}`}>
                  {getNewStock()}
                </span>
              </div>
              {getNewStock() < 0 && (
                <p className="text-xs sm:text-sm text-red-500 mt-1">Stock tidak boleh negatif!</p>
              )}
              {getNewStock() >= 0 && getNewStock() <= 5 && getNewStock() !== productData.stock && (
                <p className="text-xs sm:text-sm text-orange-500 mt-1">Stock akan berada di bawah 5 (low stock)</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-sm">Alasan Penyesuaian</Label>
              <Input
                id="reason"
                placeholder="Contoh: Restock barang baru, Barang rusak, dll."
                {...register("reason")}
                className="text-sm"
              />
              {errors.reason && (
                <p className="text-xs sm:text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>

            {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || getNewStock() < 0} className="w-full sm:w-auto">
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
