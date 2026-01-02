import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import Decimal from "decimal.js"

const attendanceSchema = z.object({
  barberId: z.string(),
  type: z.enum(["CHECK_IN", "CHECK_OUT", "PERMISSION", "SICK"])
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get("barberId")
    const dateStr = searchParams.get("date")

    let whereClause: any = {}

    if (barberId) {
      whereClause.barberId = barberId
    }

    if (dateStr) {
      const date = new Date(dateStr)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      whereClause.timestamp = {
        gte: startOfDay,
        lte: endOfDay
      }
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      whereClause.timestamp = {
        gte: today,
        lt: tomorrow
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        barber: true
      },
      orderBy: {
        timestamp: "desc"
      }
    })

    const sanitizedAttendances = attendances.map(attendance => ({
      id: attendance.id,
      barberId: attendance.barberId,
      type: attendance.type,
      timestamp: attendance.timestamp.toISOString(),
      barber: {
        id: attendance.barber.id,
        name: attendance.barber.name,
        commissionRate: attendance.barber.commissionRate instanceof Decimal 
          ? attendance.barber.commissionRate.toString() 
          : String(attendance.barber.commissionRate),
        baseSalary: attendance.barber.baseSalary instanceof Decimal 
          ? attendance.barber.baseSalary.toString() 
          : attendance.barber.baseSalary?.toString(),
        compensationType: attendance.barber.compensationType,
        isActive: attendance.barber.isActive
      }
    }))

    return NextResponse.json({ attendances: sanitizedAttendances })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data absensi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = attendanceSchema.parse(body)

    const barber = await prisma.barber.findUnique({
      where: { id: validatedData.barberId }
    })

    if (!barber) {
      return NextResponse.json(
        { error: "Barber tidak ditemukan" },
        { status: 404 }
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        barberId: validatedData.barberId,
        type: validatedData.type,
        timestamp: new Date()
      },
      include: {
        barber: true
      }
    })

    revalidatePath("/salaries")

    const sanitizedAttendance = {
      id: attendance.id,
      barberId: attendance.barberId,
      type: attendance.type,
      timestamp: attendance.timestamp.toISOString(),
      barber: {
        id: attendance.barber.id,
        name: attendance.barber.name,
        commissionRate: attendance.barber.commissionRate instanceof Decimal 
          ? attendance.barber.commissionRate.toString() 
          : String(attendance.barber.commissionRate),
        baseSalary: attendance.barber.baseSalary instanceof Decimal 
          ? attendance.barber.baseSalary.toString() 
          : attendance.barber.baseSalary?.toString(),
        compensationType: attendance.barber.compensationType,
        isActive: attendance.barber.isActive
      }
    }

    return NextResponse.json(sanitizedAttendance)
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json(
      { error: "Gagal mencatat absensi" },
      { status: 500 }
    )
  }
}
