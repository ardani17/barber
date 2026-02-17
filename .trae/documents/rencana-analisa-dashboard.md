# Rencana Analisa Dashboard (Owner)

## Tujuan
Menganalisa bagian **Owner Dashboard**: dari mana data diambil, bagaimana data diproses di server, bagaimana data di-*render* di UI, dan titik mana yang perlu disentuh bila ingin menambah/mengubah metrik/komponen dashboard.

## Output yang Diharapkan
- Peta file & tanggung jawab (page/hook/server action/komponen chart).
- Alur data end-to-end (range tanggal → fetch → agregasi DB → shape data → render).
- Panduan perubahan: “kalau mau menampilkan data baru di dashboard, edit bagian mana saja”.
- Checklist cepat untuk debugging bila data kosong/tidak sesuai.

## Lingkup
Fokus pada route group **(owner)**, khususnya halaman `/dashboard` dan semua dependensi langsungnya. Tidak membahas area cashier/POS, kecuali relevan.

## Ringkasan Arsitektur Dashboard Saat Ini
- **Halaman dashboard adalah client component**: `app/(owner)/dashboard/page.tsx`.
- Data dashboard diambil lewat **Server Action** (bukan `app/api/*`): `actions/dashboard.ts` → `getDashboardData()`.
- Client melakukan fetch via hook `hooks/use-dashboard.ts` yang:
  - Mengubah `selectedRange` + `customStartDate/customEndDate` menjadi `startDate/endDate`.
  - Memanggil `getDashboardData({ startDate, endDate })`.
  - Menyimpan hasil ke local state lalu page merender KPI + chart + breakdown.
- Server Action mengakses DB via **Prisma**, memakai **`unstable_cache`** untuk caching per range tanggal.

## File Kunci untuk Ditinjau
- Routing & guard:
  - `app/(owner)/layout.tsx` (cek role OWNER + sidebar)
- UI dashboard:
  - `app/(owner)/dashboard/page.tsx` (mengatur range dan merender widget)
  - `components/owner/date-range-picker.tsx`
  - `components/owner/metric-card.tsx`
  - `components/owner/chart-container.tsx`
  - `components/owner/charts/*` (chart di-load dinamis; `ssr: false`)
  - `components/owner/revenue-breakdown.tsx`
  - `components/owner/expenses-breakdown.tsx`
- Data layer:
  - `hooks/use-dashboard.ts` (client fetching + state)
  - `actions/dashboard.ts` (server action, caching, query Prisma, shaping response)
  - `lib/cache.ts` (TTL + tags)

## Alur Data End-to-End (Yang Akan Dijelaskan di Hasil Analisa)
1. User masuk `/dashboard` (route group `(owner)`).
2. `app/(owner)/layout.tsx` memanggil `auth()` → redirect kalau bukan OWNER.
3. `DashboardPage` menyimpan state range tanggal (default `month`) lalu memanggil `useDashboard(...)`.
4. `useDashboard` menghitung `startDate/endDate` sesuai range lalu memanggil server action `getDashboardData`.
5. `getDashboardData`:
   - Validasi session + parse input.
   - Menormalisasi tanggal menjadi `YYYY-MM-DD`.
   - Memanggil `unstable_cache(() => fetchDashboardDataCore(...))`.
6. `fetchDashboardDataCore` menjalankan agregasi (groupBy/sum + time-series) via Prisma.
7. Hasil dikembalikan ke client dalam shape `DashboardData` lalu dirender:
   - KPI cards (gross profit, expenses, commissions, net profit).
   - 2 charts (cashflow, commission).
   - 2 breakdown cards (revenue, expenses).

## Langkah Analisa yang Akan Dikerjakan (Read-only)
1. Verifikasi rute dan guard (role OWNER) untuk memastikan akses dashboard sesuai ekspektasi.
2. Audit kontrak data `DashboardData` (shape + tipe) di hook dan bagaimana dipakai di page/components.
3. Bedah server action:
   - Validasi input & normalisasi tanggal.
   - Strategi caching: key, TTL, tags, konsekuensi invalidasi.
   - Query Prisma/aggregate: sumber tabel, filter date range, grouping.
   - Transformasi ke output UI (format string vs number).
4. Bedah komponen UI:
   - KPI: cara menentukan trend/positif-negatif.
   - Chart: data mapping & asumsi label (harian/mingguan).
   - Breakdown: sorting/top N + formatting.
5. Buat “peta perubahan” untuk kebutuhan umum:
   - Tambah metrik baru (KPI card).
   - Tambah chart baru.
   - Tambah breakdown baru.

## Peta Perubahan (Jika Mau Menampilkan Data Baru)
- Tambah field baru di response server action:
  - Tambah agregasi/query di `actions/dashboard.ts` → gabungkan ke object return.
- Update kontrak data di client:
  - Update interface `DashboardData` di `hooks/use-dashboard.ts`.
  - Update rendering di `app/(owner)/dashboard/page.tsx` atau komponen breakdown/chart terkait.
- Jika butuh invalidasi cache:
  - Pastikan tag cache relevan (mis. transaksi/pengeluaran) dan update strategi invalidasi di action yang menulis data.

## Checklist Debugging (Data Dashboard Kosong / Tidak Sesuai)
- Pastikan user role OWNER (cek `app/(owner)/layout.tsx`).
- Pastikan range tanggal benar (cek kalkulasi di `useDashboard`).
- Pastikan data di DB memenuhi filter `date gte/lte` untuk rentang itu.
- Cek caching: apakah data lama tersaji karena tag/TTL (lihat `lib/cache.ts` dan key per range).
- Pastikan chart menerima array non-empty dan label konsisten.

