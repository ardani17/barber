"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { logError } from "@/lib/logger"

const createBarberSchema = z.object({
  name: z.string().min(1, "Nama barber harus diisi"),
  commissionRate: z.string().optional(),
  baseSalary: z.string().optional(),
  compensationType: z.enum(["BASE_ONLY", "COMMISSION_ONLY", "BOTH"]),
  password: z.string().min(6, "Password minimal 6 karakter")
})

const updateBarberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama barber harus diisi"),
  commissionRate: z.string().optional(),
  baseSalary: z.string().optional(),
  compensationType: z.enum(["BASE_ONLY", "COMMISSION_ONLY", "BOTH"]),
  password: z.string().optional()
})

export async function createBarber(params: z.infer<typeof createBarberSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { name, commissionRate, baseSalary, compensationType, password } = createBarberSchema.parse(params)

  const needsCommission = compensationType === "COMMISSION_ONLY" || compensationType === "BOTH"
  const needsBaseSalary = compensationType === "BASE_ONLY" || compensationType === "BOTH"

  if (needsCommission && !commissionRate) {
    throw new Error("Nilai komisi harus diisi untuk tipe kompensasi ini")
  }

  if (needsBaseSalary && !baseSalary) {
    throw new Error("Gaji pokok harus diisi untuk tipe kompensasi ini")
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const barber = await prisma.barber.create({
      data: {
        name,
        commissionRate: commissionRate ? new Decimal(commissionRate) : new Decimal(0),
        baseSalary: baseSalary ? new Decimal(baseSalary) : null,
        compensationType,
        isActive: true,
        password: hashedPassword
      }
    })

    revalidatePath("/owner/salaries")

    return {
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString() ?? null,
      compensationType: barber.compensationType,
      isActive: barber.isActive
    }
  } catch (error) {
    logError("Barbers", "Error creating barber", error)
    throw new Error(`Gagal membuat barber: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function updateBarber(params: z.infer<typeof updateBarberSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, name, commissionRate, baseSalary, compensationType, password } = updateBarberSchema.parse(params)

  const needsCommission = compensationType === "COMMISSION_ONLY" || compensationType === "BOTH"
  const needsBaseSalary = compensationType === "BASE_ONLY" || compensationType === "BOTH"

  if (needsCommission && !commissionRate) {
    throw new Error("Nilai komisi harus diisi untuk tipe kompensasi ini")
  }

  if (needsBaseSalary && !baseSalary) {
    throw new Error("Gaji pokok harus diisi untuk tipe kompensasi ini")
  }

  try {
    const updateData: any = {
      name,
      commissionRate: commissionRate ? new Decimal(commissionRate) : new Decimal(0),
      baseSalary: baseSalary ? new Decimal(baseSalary) : null,
      compensationType
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const barber = await prisma.barber.update({
      where: { id },
      data: updateData
    })

    revalidatePath("/owner/salaries")

    return {
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString() ?? null,
      compensationType: barber.compensationType,
      isActive: barber.isActive
    }
  } catch (error) {
    logError("Barbers", "Error updating barber", error)
    throw new Error("Gagal mengupdate barber")
  }
}

export async function toggleBarberActive(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const barber = await prisma.barber.findUnique({
      where: { id }
    })

    if (!barber) {
      throw new Error("Barber not found")
    }

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: {
        isActive: !barber.isActive
      }
    })

    revalidatePath("/owner/salaries")

    return {
      id: updatedBarber.id,
      name: updatedBarber.name,
      commissionRate: updatedBarber.commissionRate.toString(),
      baseSalary: updatedBarber.baseSalary?.toString() ?? null,
      compensationType: updatedBarber.compensationType,
      isActive: updatedBarber.isActive
    }
  } catch (error) {
    logError("Barbers", "Error toggling barber active", error)
    throw new Error("Gagal mengubah status barber")
  }
}

export async function getBarbers() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const barbers = await prisma.barber.findMany({
      orderBy: { name: "asc" }
    })

    return barbers.map(barber => ({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString() ?? null,
      compensationType: barber.compensationType,
      isActive: barber.isActive
    }))
  } catch (error) {
    logError("Barbers", "Error fetching barbers", error)
    throw new Error("Gagal mengambil data barber")
  }
}

export async function getBarberById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            items: true
          },
          orderBy: {
            date: "desc"
          },
          take: 50
        }
      }
    })

    if (!barber) {
      throw new Error("Barber not found")
    }

    const totalCommission = barber.transactions.reduce(
      (sum, t) => sum.plus(t.totalCommission),
      new Decimal(0)
    )

    const totalRevenue = barber.transactions.reduce(
      (sum, t) => sum.plus(t.totalAmount),
      new Decimal(0)
    )

    return {
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate.toString(),
      baseSalary: barber.baseSalary?.toString(),
      compensationType: barber.compensationType,
      isActive: barber.isActive,
      totalCommission: totalCommission.toString(),
      totalRevenue: totalRevenue.toString(),
      transactionCount: barber.transactions.length
    }
  } catch (error) {
    logError("Barbers", "Gagal mengambil data barber", error)
    throw new Error("Gagal mengambil data barber")
  }
}

export async function getBarberSalaryReport(barberId: string, startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    })

    if (!barber) {
      throw new Error("Barber not found")
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        barberId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: "asc"
      }
    })

    const totalCommission = transactions.reduce(
      (sum, t) => sum.plus(t.totalCommission),
      new Decimal(0)
    )

    const totalRevenue = transactions.reduce(
      (sum, t) => sum.plus(t.totalAmount),
      new Decimal(0)
    )

    let totalSalary = new Decimal(0)

    switch (barber.compensationType) {
      case "BASE_ONLY":
        totalSalary = barber.baseSalary || new Decimal(0)
        break
      case "COMMISSION_ONLY":
        totalSalary = totalCommission
        break
      case "BOTH":
        totalSalary = (barber.baseSalary || new Decimal(0)).plus(totalCommission)
        break
    }

    return {
      barberId: barber.id,
      barberName: barber.name,
      compensationType: barber.compensationType,
      baseSalary: barber.baseSalary?.toString(),
      commissionRate: barber.commissionRate.toString(),
      transactionCount: transactions.length,
      totalRevenue: totalRevenue.toString(),
      totalCommission: totalCommission.toString(),
      totalSalary: totalSalary.toString(),
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        totalAmount: t.totalAmount.toString(),
        totalCommission: t.totalCommission.toString()
      }))
    }
  } catch (error) {
    logError("Barbers", "Error fetching barber salary report", error)
    throw new Error("Gagal mengambil laporan gaji barber")
  }
}
