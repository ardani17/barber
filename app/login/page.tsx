"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
})

type LoginFormValues = z.infer<typeof loginSchema>

type Barber = {
  id: string
  name: string
}

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [barberPassword, setBarberPassword] = useState("")
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOpenAttendance() {
    try {
      const response = await fetch("/api/barbers")
      const data = await response.json()
      setBarbers(data)
      setShowAttendance(true)
    } catch (error) {
      setError("Gagal mengambil data barber")
    }
  }

  async function handleAttendance(type: "CHECK_IN" | "CHECK_OUT" | "PERMISSION" | "SICK") {
    if (!selectedBarber) {
      setAttendanceError("Silakan pilih barber")
      return
    }

    if (!barberPassword) {
      setAttendanceError("Silakan masukkan password")
      return
    }

    setAttendanceLoading(true)
    setAttendanceError(null)

    try {
      const verifyResponse = await fetch("/api/barbers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBarber.id,
          password: barberPassword
        })
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        throw new Error(data.error || "Password salah")
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarber.id,
          type
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal melakukan absensi")
      }

      let successMessage = ""
      switch (type) {
        case "CHECK_IN":
          successMessage = `Berhasil absen masuk - ${selectedBarber.name}`
          break
        case "CHECK_OUT":
          successMessage = `Berhasil absen pulang - ${selectedBarber.name}`
          break
        case "PERMISSION":
          successMessage = `Berhasil absen izin - ${selectedBarber.name}`
          break
        case "SICK":
          successMessage = `Berhasil absen sakit - ${selectedBarber.name}`
          break
      }

      setAttendanceSuccess(successMessage)

      setTimeout(() => {
        setShowAttendance(false)
        setSelectedBarber(null)
        setBarberPassword("")
        setAttendanceSuccess(null)
        setAttendanceError(null)
      }, 2000)
    } catch (error: any) {
      setAttendanceError(error.message || "Gagal melakukan absensi")
    } finally {
      setAttendanceLoading(false)
    }
  }

  function handleCloseAttendance() {
    setShowAttendance(false)
    setSelectedBarber(null)
    setBarberPassword("")
    setAttendanceError(null)
    setAttendanceSuccess(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-yellow-200 to-white p-4">
      <Card className="w-full max-w-md shadow-2xl border-yellow-500 bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-bold text-black dark:text-white">BARBERBRO</CardTitle>
          <CardDescription className="text-gray-600">
            Sistem Manajemen Barbershop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@barbershop.com"
                        type="email"
                        className="bg-white dark:bg-gray-800 border-yellow-500 text-black dark:text-white placeholder:text-gray-400"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        className="bg-white dark:bg-gray-800 border-yellow-500 text-black dark:text-white placeholder:text-gray-400"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-500 text-black dark:text-white hover:bg-yellow-600 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              onClick={handleOpenAttendance}
            >
              Absensi Capster
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Absensi Capster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Pilih Barber
                </label>
                <select
                  value={selectedBarber?.id || ""}
                  onChange={(e) => {
                    const barber = barbers.find((b) => b.id === e.target.value)
                    setSelectedBarber(barber || null)
                    setAttendanceError(null)
                  }}
                  className="w-full px-3 py-2 border border-yellow-500 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  <option value="">Pilih Barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Password Barber
                </label>
                <Input
                  type="password"
                  value={barberPassword}
                  onChange={(e) => {
                    setBarberPassword(e.target.value)
                    setAttendanceError(null)
                  }}
                  placeholder="Masukkan password"
                  className="bg-white dark:bg-gray-800 border-yellow-500 text-black dark:text-white"
                />
              </div>

              {attendanceError && (
                <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
                  {attendanceError}
                </div>
              )}

              {attendanceSuccess && (
                <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-md text-sm">
                  {attendanceSuccess}
                </div>
              )}

              {!attendanceSuccess && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleAttendance("CHECK_IN")}
                    disabled={attendanceLoading || !selectedBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Masuk"}
                  </Button>
                  <Button
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleAttendance("CHECK_OUT")}
                    disabled={attendanceLoading || !selectedBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Pulang"}
                  </Button>
                  <Button
                    className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                    onClick={() => handleAttendance("PERMISSION")}
                    disabled={attendanceLoading || !selectedBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Izin"}
                  </Button>
                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleAttendance("SICK")}
                    disabled={attendanceLoading || !selectedBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Sakit"}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={handleCloseAttendance}
                disabled={attendanceLoading}
              >
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


