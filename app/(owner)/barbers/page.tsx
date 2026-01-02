'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { getBarbers, createBarber, updateBarber, toggleBarberActive } from '@/actions/barbers'
import type { Barber } from '@/types'

interface BarberFormData {
  name: string
  commissionRate: string
  baseSalary: string
  compensationType: 'BASE_ONLY' | 'COMMISSION_ONLY' | 'BOTH'
  password: string
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [formData, setFormData] = useState<BarberFormData>({
    name: '',
    commissionRate: '',
    baseSalary: '',
    compensationType: 'BOTH',
    password: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadBarbers = async () => {
    try {
      setLoading(true)
      const data = await getBarbers()
      setBarbers(data)
    } catch (error) {
      console.error('Error loading barbers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBarbers()
  }, [])

  const handleOpenModal = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber)
      setFormData({
        name: barber.name,
        commissionRate: barber.commissionRate,
        baseSalary: barber.baseSalary || '',
        compensationType: barber.compensationType,
        password: ''
      })
    } else {
      setEditingBarber(null)
      setFormData({
        name: '',
        commissionRate: '',
        baseSalary: '',
        compensationType: 'BOTH',
        password: ''
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      if (editingBarber) {
        await updateBarber({
          id: editingBarber.id,
          name: formData.name,
          commissionRate: formData.commissionRate,
          baseSalary: formData.baseSalary,
          compensationType: formData.compensationType,
          password: formData.password || undefined
        })
      } else {
        await createBarber({
          name: formData.name,
          commissionRate: formData.commissionRate,
          baseSalary: formData.baseSalary,
          compensationType: formData.compensationType,
          password: formData.password
        })
      }

      setModalOpen(false)
      loadBarbers()
    } catch (error) {
      console.error('Error saving barber:', error)
      alert(error instanceof Error ? error.message : 'Gagal menyimpan data capster')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await toggleBarberActive(id)
      loadBarbers()
    } catch (error) {
      console.error('Error toggling barber:', error)
      alert('Gagal mengubah status capster')
    }
  }

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeBarbers = filteredBarbers.filter(b => b.isActive)
  const inactiveBarbers = filteredBarbers.filter(b => !b.isActive)

  const formatCurrency = (value: string) => {
    if (!value) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(value))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-xs sm:text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Pengelola Capster</h1>
          <p className="text-xs sm:text-sm text-gray-600">Kelola data capster, komisi, dan gaji pokok</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-8 sm:h-10 px-2 sm:px-4">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Tambah Capster</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            placeholder="Cari capster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {activeBarbers.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-700">Capster Aktif ({activeBarbers.length})</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeBarbers.map((barber) => (
                <div key={barber.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">{barber.name}</h3>
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                      </span>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(barber)}
                        className="h-7 w-7 sm:h-auto sm:w-auto p-0 sm:p-2"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(barber.id)}
                        className="h-7 w-7 sm:h-auto sm:w-auto p-0 sm:p-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tipe Kompensasi:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {barber.compensationType === 'BASE_ONLY' && 'Gaji Pokok Saja'}
                        {barber.compensationType === 'COMMISSION_ONLY' && 'Komisi Saja'}
                        {barber.compensationType === 'BOTH' && 'Gaji Pokok + Komisi'}
                      </p>
                    </div>

                    {barber.baseSalary && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Gaji Pokok:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(barber.baseSalary)}
                        </p>
                      </div>
                    )}

                    {barber.commissionRate && barber.commissionRate !== '0' && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Komisi:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(barber.commissionRate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inactiveBarbers.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-500">Capster Non-Aktif ({inactiveBarbers.length})</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveBarbers.map((barber) => (
                <div key={barber.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 opacity-75">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1 truncate">{barber.name}</h3>
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600">
                        Non-Aktif
                      </span>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(barber)}
                        className="h-7 w-7 sm:h-auto sm:w-auto p-0 sm:p-2"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(barber.id)}
                        className="h-7 w-7 sm:h-auto sm:w-auto p-0 sm:p-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tipe Kompensasi:</span>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {barber.compensationType === 'BASE_ONLY' && 'Gaji Pokok Saja'}
                        {barber.compensationType === 'COMMISSION_ONLY' && 'Komisi Saja'}
                        {barber.compensationType === 'BOTH' && 'Gaji Pokok + Komisi'}
                      </p>
                    </div>

                    {barber.baseSalary && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Gaji Pokok:</span>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(barber.baseSalary)}
                        </p>
                      </div>
                    )}

                    {barber.commissionRate && barber.commissionRate !== '0' && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Komisi:</span>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(barber.commissionRate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredBarbers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-xs sm:text-sm text-gray-500">Tidak ada capster yang ditemukan</p>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editingBarber ? 'Edit Capster' : 'Tambah Capster Baru'}</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-sm">
              {editingBarber ? 'Edit data capster yang ada' : 'Tambah capster baru ke sistem'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-[10px] sm:text-sm">Nama Capster *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama capster"
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              />
            </div>

            <div>
              <Label className="text-[10px] sm:text-sm">Tipe Kompensasi *</Label>
              <Select value={formData.compensationType} onValueChange={(value: any) => setFormData({ ...formData, compensationType: value })}>
                <SelectTrigger className="h-8 sm:h-10 text-[10px] sm:text-sm">
                  <SelectValue placeholder="Pilih tipe kompensasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE_ONLY" className="text-[10px] sm:text-sm">Gaji Pokok Saja</SelectItem>
                  <SelectItem value="COMMISSION_ONLY" className="text-[10px] sm:text-sm">Komisi Saja</SelectItem>
                  <SelectItem value="BOTH" className="text-[10px] sm:text-sm">Gaji Pokok + Komisi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.compensationType === 'BASE_ONLY' || formData.compensationType === 'BOTH') && (
              <div>
                <Label className="text-[10px] sm:text-sm">Gaji Pokok *</Label>
                <Input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  placeholder="0"
                  className="h-8 sm:h-10 text-[10px] sm:text-sm"
                />
              </div>
            )}

            {(formData.compensationType === 'COMMISSION_ONLY' || formData.compensationType === 'BOTH') && (
              <div>
                <Label className="text-[10px] sm:text-sm">Komisi (Rp) *</Label>
                <Input
                  type="number"
                  step="1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="0"
                  className="h-8 sm:h-10 text-[10px] sm:text-sm"
                />
              </div>
            )}

            {!editingBarber && (
              <div>
                <Label className="text-[10px] sm:text-sm">Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="h-8 sm:h-10 text-[10px] sm:text-sm"
                />
              </div>
            )}

            {editingBarber && (
              <div>
                <Label className="text-[10px] sm:text-sm">Password (Opsional)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                  className="h-8 sm:h-10 text-[10px] sm:text-sm"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              {submitting ? 'Menyimpan...' : editingBarber ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
