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

const serviceFormSchema = z.object({
  name: z.string().min(1, "Nama layanan harus diisi"),
  price: z.string().min(1, "Harga harus diisi")
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface ServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    price: string
  }
}

export function ServiceModal({ open, onOpenChange, onSuccess, editData }: ServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: editData
      ? {
          name: editData.name,
          price: editData.price
        }
      : {
          name: "",
          price: ""
        }
  })

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = editData ? `/api/services/${editData.id}` : "/api/services"
      const method = editData ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          price: data.price,
          isActive: true
        })
      })

      if (!res.ok) {
        throw new Error("Gagal menyimpan layanan")
      }

      reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal menyimpan layanan")
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
          <DialogTitle className="text-lg sm:text-xl">{editData ? "Edit Layanan" : "Tambah Layanan Baru"}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {editData
              ? "Edit informasi layanan yang ada."
              : "Tambah layanan baru ke katalog barbershop."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">Nama Layanan</Label>
              <Input
                id="name"
                placeholder="Contoh: Potong Rambut"
                {...register("name")}
                className="text-sm"
              />
              {errors.name && (
                <p className="text-xs sm:text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm">Harga</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("price")}
                className="text-sm"
              />
              {errors.price && (
                <p className="text-xs sm:text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
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
