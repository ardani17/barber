import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import Decimal from "decimal.js"
import { logError } from "@/lib/logger"

const updateBarberSchema = z.object({
  name: z.string().min(1).optional(),
  commissionRate: z.string().min(1).optional(),
  baseSalary: z.string().optional(),
  compensationType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const { isActive } = body

    const barber = await prisma.barber.update({
      where: { id },
      data: { isActive }
    })

    revalidatePath("/pos")

    return NextResponse.json({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString(),
      compensationType: barber.compensationType,
      isActive: barber.isActive
    })
  } catch (error) {
    logError('API', 'Gagal update barber status (PATCH)', error)
    return NextResponse.json(
      { error: "Gagal mengupdate barber" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const body = await request.json()
    const validatedData = updateBarberSchema.parse(body)

    const updateData: any = {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.commissionRate && { commissionRate: validatedData.commissionRate }),
      ...(validatedData.baseSalary !== undefined && { baseSalary: validatedData.baseSalary }),
      ...(validatedData.compensationType && { compensationType: validatedData.compensationType }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
    }

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    const barber = await prisma.barber.update({
      where: { id },
      data: updateData
    })

    revalidatePath("/pos")

    return NextResponse.json({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString(),
      compensationType: barber.compensationType,
      isActive: barber.isActive
    })
  } catch (error) {
    logError('API', 'Gagal update barber (PUT)', error)
    return NextResponse.json(
      { error: "Gagal mengupdate barber" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id

    await prisma.barber.delete({
      where: { id }
    })

    revalidatePath("/pos")

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('API', 'Gagal hapus barber (DELETE)', error)
    return NextResponse.json(
      { error: "Gagal menghapus barber" },
      { status: 500 }
    )
  }
}
