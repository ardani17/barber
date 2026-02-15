"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { logError } from "@/lib/logger"

const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["OWNER", "CASHIER"])
})

const updateUserSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["OWNER", "CASHIER"])
})

const changePasswordSchema = z.object({
  id: z.string(),
  newPassword: z.string().min(6, "Password minimal 6 karakter")
})

export async function createUser(params: z.infer<typeof createUserSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const { username, email, password, role } = createUserSchema.parse(params)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return { success: false, error: "Username sudah digunakan" }
      }
      if (existingUser.email === email) {
        return { success: false, error: "Email sudah digunakan" }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      }
    })

    revalidatePath("/owner/settings")

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    logError("Users", "Error creating user", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat user"
    }
  }
}

export async function updateUser(params: z.infer<typeof updateUserSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const { id, username, email, role } = updateUserSchema.parse(params)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: {
          id
        }
      }
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return { success: false, error: "Username sudah digunakan" }
      }
      if (existingUser.email === email) {
        return { success: false, error: "Email sudah digunakan" }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role
      }
    })

    revalidatePath("/owner/settings")

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    logError("Users", "Error updating user", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengupdate user"
    }
  }
}

export async function changePassword(params: z.infer<typeof changePasswordSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const { id, newPassword } = changePasswordSchema.parse(params)

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })

    return { success: true }
  } catch (error) {
    logError("Users", "Error changing password", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah password"
    }
  }
}

export async function deleteUser(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  if (id === session.user.id) {
    return { success: false, error: "Tidak bisa menghapus akun sendiri" }
  }

  try {
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath("/owner/settings")

    return { success: true }
  } catch (error) {
    logError("Users", "Error deleting user", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus user"
    }
  }
}

export async function getUsers() {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { username: "asc" }
    })

    return {
      success: true,
      data: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }))
    }
  } catch (error) {
    logError("Users", "Gagal mengambil data user", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data user"
    }
  }
}

export async function getUserById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    logError("Users", "Error fetching user", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data user"
    }
  }
}
