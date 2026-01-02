import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { handleApiError } from "@/lib/error-handler"

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  buyPrice: z.string().min(1).optional(),
  sellPrice: z.string().min(1).optional(),
  stock: z.number().optional(),
  isActive: z.boolean().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const { isActive, stock } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(stock !== undefined && { stock })
      }
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")

    return Response.json(product)
  } catch (error) {
    return handleApiError(error, "Update product")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.buyPrice && { buyPrice: validatedData.buyPrice }),
        ...(validatedData.sellPrice && { sellPrice: validatedData.sellPrice }),
        ...(validatedData.stock !== undefined && { stock: validatedData.stock }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
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
    return handleApiError(error, "Update product")
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    await prisma.product.delete({
      where: { id }
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error, "Delete product")
  }
}
