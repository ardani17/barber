import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { handleApiError } from "@/lib/error-handler"

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.string().min(1).optional(),
  isActive: z.boolean().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const { isActive } = body

    const service = await prisma.service.update({
      where: { id },
      data: { isActive }
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")

    return Response.json(service)
  } catch (error) {
    return handleApiError(error, "Update service")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.price && { price: validatedData.price }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      }
    })

    revalidatePath("/pos")
    revalidatePath("/inventory")

    return Response.json({
      id: service.id,
      name: service.name,
      price: service.price.toString(),
      isActive: service.isActive
    })
  } catch (error) {
    return handleApiError(error, "Update service")
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    await prisma.service.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error, "Delete service")
  }
}
