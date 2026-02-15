"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Store, Users, Settings as SettingsIcon, Plus, Edit, Trash2, Moon, Sun } from "lucide-react"
import { createUser, updateUser, deleteUser, getUsers } from "@/actions/users"

interface StoreProfile {
  name: string
  address: string
  phone: string
  email: string
  description: string
}

interface Cashier {
  id: string
  username: string
  email: string
  role: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store")
  
  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: ""
  })
  
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [cashierModalOpen, setCashierModalOpen] = useState(false)
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCashier, setDeletingCashier] = useState<Cashier | null>(null)
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(false)
  
  const [cashierForm, setCashierForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CASHIER"
  })
  
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mockStoreProfile: StoreProfile = {
    name: "BarberBro Barbershop",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    phone: "+62 812 3456 7890",
    email: "info@barberbro.com",
    description: "Barbershop profesional dengan pelayanan terbaik"
  }

  useEffect(() => {
    loadStoreProfile()
    loadCashiers()
  }, [])

  const loadStoreProfile = () => {
    setStoreProfile(mockStoreProfile)
  }

  const loadCashiers = async () => {
    setIsLoadingCashiers(true)
    try {
      const result = await getUsers()
      if (result.success && result.data) {
        setCashiers(result.data)
      } else {
        alert(result.error || "Gagal memuat data user")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat memuat data user")
    } finally {
      setIsLoadingCashiers(false)
    }
  }

  const handleStoreProfileSave = () => {
    alert("Profil toko berhasil disimpan")
  }

  const handleCashierSubmit = async () => {
    if (!cashierForm.username || !cashierForm.email || (cashierForm.role === "CASHIER" && !cashierForm.password && !editingCashier)) {
      alert("Mohon lengkapi semua field")
      return
    }

    try {
      let result
      if (editingCashier) {
        result = await updateUser({
          id: editingCashier.id,
          username: cashierForm.username,
          email: cashierForm.email,
          role: cashierForm.role as "OWNER" | "CASHIER"
        })
      } else {
        result = await createUser({
          username: cashierForm.username,
          email: cashierForm.email,
          password: cashierForm.password,
          role: cashierForm.role as "OWNER" | "CASHIER"
        })
      }

      if (result.success) {
        alert(editingCashier ? "User berhasil diperbarui" : "User berhasil ditambahkan")
        await loadCashiers()
        setCashierModalOpen(false)
        setEditingCashier(null)
        setCashierForm({ username: "", email: "", password: "", role: "CASHIER" })
      } else {
        alert(result.error || "Gagal menyimpan data user")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data user")
    }
  }

  const handleEditCashier = (cashier: Cashier) => {
    setEditingCashier(cashier)
    setCashierForm({
      username: cashier.username,
      email: cashier.email,
      password: "",
      role: cashier.role
    })
    setCashierModalOpen(true)
  }

  const handleDeleteCashier = async () => {
    if (deletingCashier) {
      try {
        const result = await deleteUser(deletingCashier.id)
        if (result.success) {
          alert("User berhasil dihapus")
          await loadCashiers()
          setDeleteDialogOpen(false)
          setDeletingCashier(null)
        } else {
          alert(result.error || "Gagal menghapus user")
        }
      } catch (error) {
        alert("Terjadi kesalahan saat menghapus user")
      }
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Pengaturan</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Kelola profil toko, user, dan preferensi</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] h-8 sm:h-10 text-xs sm:text-xs">
            <TabsTrigger value="store" className="gap-1 sm:gap-2">
              <Store className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profil Toko</span>
            </TabsTrigger>
            <TabsTrigger value="cashiers" className="gap-1 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">User</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1 sm:gap-2">
              <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tampilan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Profil Toko
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Nama Toko</Label>
                  <Input
                    id="storeName"
                    value={storeProfile.name}
                    onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="storeAddress">Alamat</Label>
                  <Input
                    id="storeAddress"
                    value={storeProfile.address}
                    onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="storePhone">Telepon</Label>
                    <Input
                      id="storePhone"
                      type="tel"
                      value={storeProfile.phone}
                      onChange={(e) => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeProfile.email}
                      onChange={(e) => setStoreProfile({ ...storeProfile, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">Deskripsi</Label>
                  <Input
                    id="storeDescription"
                    value={storeProfile.description}
                    onChange={(e) => setStoreProfile({ ...storeProfile, description: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleStoreProfileSave} className="gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Simpan Profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashiers">
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Daftar User
                </CardTitle>
                <Button onClick={() => {
                  setEditingCashier(null)
                  setCashierForm({ username: "", email: "", password: "", role: "CASHIER" })
                  setCashierModalOpen(true)
                }} size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-xs">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Tambah User</span>
                </Button>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                {isLoadingCashiers ? (
                  <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Memuat data user...
                  </div>
                ) : cashiers.length === 0 ? (
                  <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Belum ada user yang ditambahkan
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto hidden sm:block">
                      <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 px-1 text-xs sm:text-xs sm:py-3 sm:px-2">Username</TableHead>
                          <TableHead className="py-2 px-1 text-xs sm:text-xs sm:py-3 sm:px-2 hidden sm:table-cell">Email</TableHead>
                          <TableHead className="py-2 px-1 text-xs sm:text-xs sm:py-3 sm:px-2">Role</TableHead>
                          <TableHead className="py-2 px-1 text-xs sm:text-xs sm:py-3 sm:px-2 text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashiers.map((cashier) => (
                          <TableRow key={cashier.id}>
                            <TableCell className="font-medium py-1.5 px-1 text-xs sm:text-xs sm:py-3 sm:px-2">
                              {cashier.username}
                            </TableCell>
                            <TableCell className="py-1.5 px-1 text-xs sm:text-xs sm:py-3 sm:px-2 hidden sm:table-cell">
                              {cashier.email}
                            </TableCell>
                            <TableCell className="py-1.5 px-1 sm:py-3 sm:px-2">
                              <Badge variant={cashier.role === "OWNER" ? "default" : "secondary"} className="text-xs px-1.5 py-0.5 sm:text-xs">
                                {cashier.role === "OWNER" ? "Owner" : "Kasir"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1.5 px-1 text-right sm:py-3 sm:px-2">
                              <div className="flex justify-end gap-1 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCashier(cashier)}
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 h-6 w-6 sm:h-8 sm:w-8 p-0"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeletingCashier(cashier)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="grid gap-3 sm:hidden">
                    {cashiers.map((cashier) => (
                      <div key={cashier.id} className="rounded-lg border border-yellow-500 dark:border-gray-700 p-3 bg-card">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-medium">{cashier.username}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{cashier.email}</p>
                          </div>
                          <Badge variant={cashier.role === "OWNER" ? "default" : "secondary"} className={cashier.role === "OWNER" ? "bg-yellow-500 text-black text-xs px-1.5 py-0.5" : "text-xs px-1.5 py-0.5"}>
                            {cashier.role === "OWNER" ? "Owner" : "Kasir"}
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditCashier(cashier)} className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setDeletingCashier(cashier); setDeleteDialogOpen(true) }} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Tampilan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {!mounted ? (
                      <Sun className="h-5 w-5 text-gray-400" />
                    ) : theme === "light" ? (
                      <Sun className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Moon className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {!mounted ? "Memuat..." : theme === "light" ? "Mode Terang" : "Mode Gelap"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pilih tema tampilan aplikasi
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleThemeToggle}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {!mounted ? (
                      "..."
                    ) : theme === "light" ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Mode Gelap
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Mode Terang
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2">Informasi Tema</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Mode Terang: Background putih dengan teks gelap</p>
                    <p>• Mode Gelap: Background hitam dengan teks putih</p>
                    <p>• Preferensi tema akan disimpan dan digunakan otomatis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={cashierModalOpen} onOpenChange={setCashierModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingCashier ? "Edit User" : "Tambah User Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 py-4">
              <div>
                <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
                <Input
                  id="username"
                  value={cashierForm.username}
                  onChange={(e) => setCashierForm({ ...cashierForm, username: e.target.value })}
                  placeholder="Masukkan username"
                  className="mt-1 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cashierForm.email}
                  onChange={(e) => setCashierForm({ ...cashierForm, email: e.target.value })}
                  placeholder="Masukkan email"
                  className="mt-1 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {!editingCashier && (
                <div>
                  <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={cashierForm.password}
                    onChange={(e) => setCashierForm({ ...cashierForm, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="mt-1 h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
                <Select
                  value={cashierForm.role}
                  onValueChange={(value) => setCashierForm({ ...cashierForm, role: value })}
                >
                  <SelectTrigger id="role" className="mt-1 h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER" className="text-xs sm:text-sm">Kasir</SelectItem>
                    <SelectItem value="OWNER" className="text-xs sm:text-sm">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCashierModalOpen(false)} className="text-xs sm:text-sm">
                Batal
              </Button>
              <Button onClick={handleCashierSubmit} className="text-xs sm:text-sm">
                {editingCashier ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Hapus User?</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Apakah Anda yakin ingin menghapus user "{deletingCashier?.username}"? 
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="text-xs sm:text-sm">
                Batal
              </Button>
              <Button onClick={handleDeleteCashier} className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
