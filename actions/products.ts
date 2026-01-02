"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"

const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  buyPrice: z.string(),
  sellPrice: z.string(),
  stock: z.number().int().min(0, "Stock harus lebih dari atau sama dengan 0")
})

const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama produk harus diisi"),
  buyPrice: z.string(),
  sellPrice: z.string()
})

const adjustStockSchema = z.object({
  id: z.string(),
  adjustment: z.number().int(),
  reason: z.string().min(1, "Alasan penyesuaian harus diisi")
})

export async function createProduct(params: z.infer<typeof createProductSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { name, buyPrice, sellPrice, stock } = createProductSchema.parse(params)

  try {
    const product = await prisma.product.create({
      data: {
        name,
        buyPrice: new Decimal(buyPrice),
        sellPrice: new Decimal(sellPrice),
        stock
      }
    })

    return product
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error("Gagal membuat produk")
  }
}

export async function updateProduct(params: z.infer<typeof updateProductSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, name, buyPrice, sellPrice } = updateProductSchema.parse(params)

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        buyPrice: new Decimal(buyPrice),
        sellPrice: new Decimal(sellPrice)
      }
    })

    return product
  } catch (error) {
    console.error("Error updating product:", error)
    throw new Error("Gagal mengupdate produk")
  }
}

export async function adjustProductStock(params: z.infer<typeof adjustStockSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, adjustment, reason } = adjustStockSchema.parse(params)

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    const newStock = product.stock + adjustment

    if (newStock < 0) {
      throw new Error("Stock tidak boleh negatif")
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        stock: newStock
      }
    })

    return {
      product: updatedProduct,
      previousStock: product.stock,
      adjustment,
      reason,
      newStock
    }
  } catch (error) {
    console.error("Error adjusting product stock:", error)
    throw new Error("Gagal menyesuaikan stock produk")
  }
}

export async function toggleProductActive(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isActive: !product.isActive
      }
    })

    return updatedProduct
  } catch (error) {
    console.error("Error toggling product active:", error)
    throw new Error("Gagal mengubah status produk")
  }
}

export async function getProducts() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [
        {
          stock: "asc"
        },
        {
          name: "asc"
        }
      ]
    })

    return products.map(product => ({
      id: product.id,
      name: product.name,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock,
      isActive: product.isActive,
      isLowStock: product.stock <= 5
    }))
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Gagal mengambil data produk")
  }
}

export async function getProductById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    return {
      id: product.id,
      name: product.name,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock,
      isActive: product.isActive
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    throw new Error("Gagal mengambil data produk")
  }
}
