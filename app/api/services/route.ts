import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { handleApiError } from "@/lib/error-handler"

const serviceSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  isActive: z.boolean().optional()
})

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc"
      }
    })

    return Response.json(services.map(service => ({
      id: service.id,
      name: service.name,
      price: service.price.toString(),
      isActive: service.isActive
    })))
  } catch (error) {
    return handleApiError(error, "Fetch services")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        isActive: validatedData.isActive ?? true
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
    return handleApiError(error, "Create service")
  }
}
