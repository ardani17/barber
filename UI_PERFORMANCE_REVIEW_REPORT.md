# UI Performance Review Report - BARBERBRO

**Tanggal Audit:** 16 Februari 2026  
**Versi Aplikasi:** Next.js 16.1.1 | React 19.2.3  
**Lingkup:** Performa UI loading data lambat & delay navigasi sidebar

---

## 1) Ringkasan Eksekutif
- Bottleneck utama berasal dari pola data fetching client-side yang memicu banyak server action sekaligus, ditambah query agregasi yang sebelumnya dilakukan di layer aplikasi.
- UI delay saat klik sidebar bukan karena network antar host, tetapi karena render + data loading (payload besar, tanpa cache, tanpa pagination, tanpa debounce).
- Database ada di VPS yang sama, namun query tetap berat karena agregasi di aplikasi, kurangnya indeks, dan query tanpa pagination.

---

## 2) Temuan Utama (Root Cause)
- **Data fetching dashboard terlalu fragmentasi**: 8 action server dipanggil bersamaan untuk satu layar dashboard. Lihat [use-dashboard.ts:L65-L126](file:///c:/laragon/www/baberv3/hooks/use-dashboard.ts#L65-L126).
- **Agregasi data dilakukan di aplikasi** (sebelum POC), menyebabkan payload besar dan CPU usage tinggi. Area dashboard: transaksi harian + top services/products. Lihat [dashboard.ts:L202-L343](file:///c:/laragon/www/baberv3/actions/dashboard.ts#L202-L343).
- **Tidak ada pagination** di transaksi; `findMany` dengan include nested membuat payload berat. Lihat [transactions.ts:L54-L89](file:///c:/laragon/www/baberv3/actions/transactions.ts#L54-L89).
- **Re-fetch berlebihan** karena useEffect bergantung pada banyak state dan tidak debounce (search). Lihat [transactions/page.tsx:L154-L206](file:///c:/laragon/www/baberv3/app/(owner)/transactions/page.tsx#L154-L206).
- **Caching server-side tidak ada** untuk data dashboard, Redis hanya untuk rate limit. Lihat [redis.ts](file:///c:/laragon/www/baberv3/lib/redis.ts).
- **Bundle client berat** (Recharts + banyak halaman client component). Lihat [dashboard/page.tsx](file:///c:/laragon/www/baberv3/app/(owner)/dashboard/page.tsx) dan chart components.

---

## 3) Audit Query Database

### 3.1 Indikasi Query Tidak Optimal
- Query aggregasi (top items, revenue harian) sebelumnya dilakukan di aplikasi (JS), menambah load memori dan CPU.
- Pencarian transaksi menggunakan `contains` pada nama barber/service/product tanpa indeks btree.
- Tidak ada pagination di transaksi → query besar dan respons lambat.

### 3.2 Indeks yang Direkomendasikan
- `Transaction(paymentMethod, date)` untuk filter per periode.
- `TransactionItem(type, serviceId)` dan `TransactionItem(type, productId)` untuk agregasi top items.
- `Service(name)`, `Product(name)`, `Barber(name)` untuk pencarian teks.
- `Expense(date, category)` untuk filter dan groupBy.

Referensi skema: [schema.prisma:L93-L148](file:///c:/laragon/www/baberv3/prisma/schema.prisma#L93-L148), [schema.prisma:L117-L132](file:///c:/laragon/www/baberv3/prisma/schema.prisma#L117-L132).

### 3.3 Query Observability yang Disarankan (Postgres)
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM "Transaction"
WHERE "date" BETWEEN $1 AND $2
ORDER BY "date" DESC
LIMIT 50;
```

---

## 4) Review Caching
- Service worker menggunakan `network-first` untuk `/api`, sehingga tetap lambat saat backend lambat. Lihat [sw.js:L11-L172](file:///c:/laragon/www/baberv3/public/sw.js#L11-L172).
- Tidak ada cache server (Next cache / unstable_cache) untuk data dashboard.
- Redis dipakai untuk rate limiting, bukan caching data. Lihat [rate-limit.ts](file:///c:/laragon/www/baberv3/lib/rate-limit.ts).

---

## 5) Evaluasi API & UI Rendering
- **Dashboard**: fetch paralel banyak action → overhead auth/serialization.
- **Transactions**: `useEffect` memicu re-fetch pada banyak state sekaligus (search, filter, range) tanpa debounce → request storm.
- **Inventory**: fetch on-mount tanpa cache/pagination; modal dynamic import sudah baik namun data tetap fetch penuh.

---

## 6) Bundle Size & Lazy Loading
- Chart Recharts tetap dibundel awal di dashboard (client component).
- Banyak halaman memakai `"use client"` sehingga render awal bergantung data fetching di client.

---

## 7) Monitoring Resource VPS
Checklist peak hour:
- CPU/Memory: `htop` / `top`.
- Disk I/O: `iostat -xz 1`.
- Network: `iftop` / `vnstat`.
- Postgres: `pg_stat_statements` + `EXPLAIN (ANALYZE, BUFFERS)`.
- Node: `clinic flame` atau `0x` untuk CPU hotspots.

---

## 8) Performance Monitoring Tools
- Lighthouse untuk LCP/CLS/TTI.
- WebPageTest untuk waterfall request dan TTFB.
- APM: Sentry Performance / Datadog / OpenTelemetry (tracing server action & DB).

---

## 9) Rekomendasi Prioritas (Impact / Effort)
- **P0** Konsolidasikan dashboard fetch + agregasi di DB (Impact: Tinggi, Effort: Rendah).
- **P0** Tambah indeks untuk query aggregasi & filter (Impact: Tinggi, Effort: Sedang).
- **P1** Pagination + debounce search di transaksi & expenses (Impact: Tinggi, Effort: Sedang).
- **P1** Cache server-side dashboard (TTL 30–120s) (Impact: Sedang, Effort: Rendah).
- **P2** Lazy load chart + split bundle dashboard (Impact: Sedang, Effort: Rendah).

---

## 10) Proof-of-Concept Quick Wins (Sudah Diimplementasikan)
- **Single endpoint dashboard**: mengganti 8 action menjadi 1 action teragregasi di server.  
  Referensi: [dashboard.ts:L131-L260](file:///c:/laragon/www/baberv3/actions/dashboard.ts#L131-L260), [use-dashboard.ts:L65-L126](file:///c:/laragon/www/baberv3/hooks/use-dashboard.ts#L65-L126)
- **Agregasi DB untuk daily revenue & expenses**: gunakan query aggregate di database untuk kurangi beban CPU aplikasi.  
  Referensi: [dashboard.ts:L199-L212](file:///c:/laragon/www/baberv3/actions/dashboard.ts#L199-L212)
- **Top services/products via groupBy**: mengurangi payload dan kerja di aplikasi.  
  Referensi: [dashboard.ts:L246-L333](file:///c:/laragon/www/baberv3/actions/dashboard.ts#L246-L333)

---

## 11) Next Steps (Jika Disetujui)
- Implementasi indeks Prisma + migrasi.
- Pagination & debounced search untuk transaksi/expenses.
- Cache dashboard di server (Next cache/unstable_cache).
- Lazy load chart di dashboard untuk mengurangi TTI.
