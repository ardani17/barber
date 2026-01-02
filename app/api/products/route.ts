import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { handleApiError } from "@/lib/error-handler"

const productSchema = z.object({
  name: z.string().min(1),
  buyPrice: z.string().min(1),
  sellPrice: z.string().min(1),
  stock: z.number().optional(),
  isActive: z.boolean().optional()
})

export async function GET() {
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

    return Response.json(products.map(product => ({
      id: product.id,
      name: product.name,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      price: product.sellPrice.toString(),
      stock: product.stock,
      isActive: product.isActive
    })))
  } catch (error) {
    return handleApiError(error, "Fetch products")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        buyPrice: validatedData.buyPrice,
        sellPrice: validatedData.sellPrice,
        stock: validatedData.stock ?? 0,
        isActive: validatedData.isActive ?? true
      }
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")

    return Response.json({
      id: product.id,
      name: product.name,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock,
      isActive: product.isActive
    })
  } catch (error) {
    return handleApiError(error, "Create product")
  }
}
