"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"

const createServiceSchema = z.object({
  name: z.string().min(1, "Nama layanan harus diisi"),
  price: z.string()
})

const updateServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama layanan harus diisi"),
  price: z.string()
})

export async function createService(params: z.infer<typeof createServiceSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { name, price } = createServiceSchema.parse(params)

  try {
    const service = await prisma.service.create({
      data: {
        name,
        price: new Decimal(price)
      }
    })

    return service
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Gagal membuat layanan")
  }
}

export async function updateService(params: z.infer<typeof updateServiceSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, name, price } = updateServiceSchema.parse(params)

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        price: new Decimal(price)
      }
    })

    return service
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Gagal mengupdate layanan")
  }
}

export async function toggleServiceActive(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id }
    })

    if (!service) {
      throw new Error("Service not found")
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        isActive: !service.isActive
      }
    })

    return updatedService
  } catch (error) {
    console.error("Error toggling service active:", error)
    throw new Error("Gagal mengubah status layanan")
  }
}

export async function getServices() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc"
      }
    })

    return services.map(service => ({
      id: service.id,
      name: service.name,
      price: service.price.toString(),
      isActive: service.isActive
    }))
  } catch (error) {
    console.error("Error fetching services:", error)
    throw new Error("Gagal mengambil data layanan")
  }
}

export async function getServiceById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id }
    })

    if (!service) {
      throw new Error("Service not found")
    }

    return {
      id: service.id,
      name: service.name,
      price: service.price.toString(),
      isActive: service.isActive
    }
  } catch (error) {
    console.error("Error fetching service:", error)
    throw new Error("Gagal mengambil data layanan")
  }
}
