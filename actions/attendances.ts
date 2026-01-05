"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type AttendanceStatus = "HADIR" | "IZIN" | "SAKIT" | "LIBUR" | "PULANG"

export async function getAttendances(barberId?: string, date?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
    let whereClause: any = {}

    if (barberId) {
      whereClause.barberId = barberId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      whereClause.timestamp = {
        gte: startDate,
        lte: endDate
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

    const groupedAttendances = new Map<string, any>()

    for (const attendance of attendances) {
      const key = `${attendance.barberId}-${attendance.timestamp.toISOString().split("T")[0]}`
      
      if (!groupedAttendances.has(key)) {
        groupedAttendances.set(key, {
          id: attendance.id,
          barberId: attendance.barberId,
          date: attendance.timestamp.toISOString().split("T")[0],
          status: "HADIR" as AttendanceStatus,
          checkIn: null as string | null,
          checkOut: null as string | null,
          notes: null,
          barber: {
            id: attendance.barber.id,
            name: attendance.barber.name,
            commissionRate: attendance.barber.commissionRate.toString(),
            baseSalary: attendance.barber.baseSalary?.toString(),
            compensationType: attendance.barber.compensationType,
            isActive: attendance.barber.isActive
          }
        })
      }

      const existing = groupedAttendances.get(key)

      switch (attendance.type) {
        case "CHECK_IN":
          existing.checkIn = attendance.timestamp.toTimeString().slice(0, 5)
          break
        case "CHECK_OUT":
          existing.checkOut = attendance.timestamp.toTimeString().slice(0, 5)
          break
        case "PERMISSION":
          existing.status = "IZIN"
          existing.checkIn = null
          existing.checkOut = null
          break
        case "SICK":
          existing.status = "SAKIT"
          existing.checkIn = null
          existing.checkOut = null
          break
        case "LEAVE":
          existing.status = "LIBUR"
          existing.checkIn = null
          existing.checkOut = null
          break
      }

      if (existing.status !== "IZIN" && existing.status !== "SAKIT") {
        if (existing.checkIn && existing.checkOut) {
          existing.status = "HADIR"
        } else if (existing.checkIn && !existing.checkOut) {
          existing.status = "HADIR"
        } else if (!existing.checkIn && existing.checkOut) {
          existing.status = "PULANG"
        }
      }
    }

    return Array.from(groupedAttendances.values())
  } catch (error) {
    throw new Error("Gagal mengambil data absensi")
  }
}
