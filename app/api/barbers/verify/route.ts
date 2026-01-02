import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { handleApiError, handleNotFound, handleUnauthorized } from "@/lib/error-handler"

const verifySchema = z.object({
  id: z.string(),
  password: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifySchema.parse(body)

    const barber = await prisma.barber.findUnique({
      where: { id: validatedData.id }
    })

    if (!barber) {
      return handleNotFound("Barber tidak ditemukan")
    }

    const isValid = await bcrypt.compare(validatedData.password, barber.password)

    if (!isValid) {
      return handleUnauthorized("Password salah")
    }

    return Response.json({
      success: true,
      barber: {
        id: barber.id,
        name: barber.name
      }
    })
  } catch (error) {
    return handleApiError(error, "Verify barber")
  }
}
