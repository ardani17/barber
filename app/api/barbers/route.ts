import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { handleApiError } from "@/lib/error-handler"

const barberSchema = z.object({
  name: z.string().min(1),
  commissionRate: z.string().min(1),
  baseSalary: z.string().optional(),
  compensationType: z.enum(["BASE_ONLY", "COMMISSION_ONLY", "BOTH"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Password minimal 6 karakter")
})

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return Response.json(barbers.map(barber => ({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString(),
      compensationType: barber.compensationType,
      isActive: barber.isActive
    })))
  } catch (error) {
    return handleApiError(error, "Fetch barbers")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = barberSchema.parse(body)

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const barber = await prisma.barber.create({
      data: {
        name: validatedData.name,
        commissionRate: validatedData.commissionRate,
        baseSalary: validatedData.baseSalary,
        compensationType: validatedData.compensationType ?? "COMMISSION_ONLY",
        isActive: validatedData.isActive ?? true,
        password: hashedPassword
      }
    })

    revalidatePath("/pos")

    return Response.json({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString(),
      compensationType: barber.compensationType,
      isActive: barber.isActive
    })
  } catch (error) {
    return handleApiError(error, "Create barber")
  }
}
