# 📋 MASTER TODO PERBAIKAN - BARBERBRO

> **Last Updated:** 15 Februari 2026  
> **Total Tasks:** 26 items  
> **Estimasi Total:** 54-70 jam kerja  
> **Sumber:** Frontend Audit + Responsive UI Audit

---

## 📊 DASHBOARD PROGRESS

| Fase | Total | Selesai | Progress |
|------|-------|---------|----------|
| 🔴 Fase 1 - Kritis | 8 | 8 | 100% ✅ |
| 🟠 Fase 2 - Sedang | 9 | 1 | 11% |
| 🟡 Fase 3 - Optimasi | 9 | 0 | 0% |
| **TOTAL** | **26** | **9** | **35%** |

---

## 🔴 FASE 1 - KRITIS (19-26 jam) ✅ COMPLETED

### Performance & Security

- [x] **1.1** Fix memory leak pada `hooks/use-toast.tsx`
  - Ganti variabel global dengan React Context
  - Implementasi ToastProvider
  - Update semua penggunaan useToast
  - **Effort:** 2-3 jam
  - **Source:** Frontend Audit #1
  - **Completed:** 15 Feb 2026

- [x] **1.2** Optimasi re-render dashboard `hooks/use-dashboard.ts`
  - Wrap `loadData` dengan `useCallback`
  - Perbaiki dependencies useEffect
  - Tambah abort controller untuk fetch
  - **Effort:** 1-2 jam
  - **Source:** Frontend Audit #2
  - **Completed:** 15 Feb 2026

- [x] **1.3** Implementasi middleware untuk route protection
  - Update `proxy.ts` (Next.js 16.1.1 menggunakan proxy.ts, bukan middleware.ts)
  - Redirect berdasarkan role (OWNER, CASHIER)
  - Handle unauthorized access
  - **Effort:** 2-3 jam
  - **Source:** Frontend Audit #7
  - **Completed:** 15 Feb 2026

- [x] **1.4** Perketat Content Security Policy
  - Environment-specific CSP directives
  - Hapus `'unsafe-eval'` untuk production
  - Test semua fitur setelah perubahan
  - **Effort:** 1 jam + testing
  - **Source:** Frontend Audit #3
  - **Completed:** 15 Feb 2026

### Mobile Responsive (WCAG Violations)

- [x] **1.5** Fix ukuran font `text-[10px]` → minimum `text-xs`
  - Ganti semua `text-[10px]` ke `text-xs` (12px minimum)
  - Files: salaries, attendance, inventory, cashflow, settings, barbers (6 files)
  - **Effort:** 3-4 jam
  - **Source:** Responsive Audit #1 (WCAG 1.4.4)
  - **Completed:** 15 Feb 2026

- [x] **1.6** Fix touch target size ke minimum 44x44px
  - Update button icon sizes: h-6 w-6 → min-h-11 min-w-11 (mobile)
  - Files: cashflow, settings, barbers (3 files)
  - **Effort:** 2-3 jam
  - **Source:** Responsive Audit #2 (WCAG 2.5.5)
  - **Completed:** 15 Feb 2026

- [x] **1.7** Implementasi card view untuk tabel di mobile
  - Buat card view inline untuk setiap halaman
  - Tampilkan card view untuk `sm:hidden`, table untuk `hidden sm:block`
  - Files: inventory/page.tsx, cashflow/page.tsx, settings/page.tsx
  - **Effort:** 6-8 jam
  - **Source:** Responsive Audit #3
  - **Completed:** 15 Feb 2026

- [x] **1.8** Tambah aria-label untuk hidden text buttons
  - Tambah aria-label pada semua button dengan `hidden sm:inline`
  - Files: pos/page.tsx (7 buttons: Input, Riwayat, Absen, Layanan, Produk, Tunai, QRIS)
  - **Effort:** 1-2 jam
  - **Source:** Responsive Audit #4 (WCAG 1.3.1)
  - **Completed:** 15 Feb 2026

---

## 🟠 FASE 2 - SEDANG (14-18 jam)

### Performance

- [ ] **2.1** Implementasi React.memo pada komponen list
  - `components/owner/revenue-breakdown.tsx`
  - `components/owner/expenses-breakdown.tsx`
  - `components/owner/metric-card.tsx`
  - **Effort:** 2-3 jam
  - **Source:** Frontend Audit #4

- [ ] **2.2** Migrasi rate limiting ke Redis
  - Update `lib/rate-limit.ts` untuk distributed rate limiting
  - Test dengan concurrent requests
  - **Effort:** 1-2 jam
  - **Source:** Frontend Audit #5

- [x] **2.3** Cleanup console.log di production
  - Buat `lib/logger.ts` utility ✅
  - Ganti semua console.log/error/warn di file produksi
  - Files: actions/*.ts, app/(owner)/*.tsx, app/(cashier)/*.tsx, app/api/*.ts
  - **Effort:** 2-3 jam
  - **Source:** Frontend Audit #6
  - **Completed:** 15 Feb 2026

### Mobile Responsive

- [ ] **2.4** Perbaiki truncation max-w values
  - Ganti `max-w-[80px]` → `max-w-[120px]`
  - Tambah `title` attribute untuk tooltip
  - **Effort:** 30 menit
  - **Source:** Responsive Audit #5

- [ ] **2.5** Optimize grid layout untuk 320px
  - Ganti `grid-cols-2` → `grid-cols-1 min-[375px]:grid-cols-2`
  - Files: dashboard metrics, POS grid
  - **Effort:** 1-2 jam
  - **Source:** Responsive Audit #6

- [ ] **2.6** Add skip links untuk accessibility
  - Implementasi skip-to-main-content link
  - **Effort:** 1 jam
  - **Source:** Responsive Audit - WCAG

- [ ] **2.7** Optimize image loading untuk mobile
  - Lazy loading untuk images below fold
  - Responsive image sizing
  - **Effort:** 2 jam
  - **Source:** Responsive Audit #10

- [ ] **2.8** Implementasi lazy loading untuk komponen berat
  - Dynamic import untuk modal, large tables
  - **Effort:** 3 jam
  - **Source:** Responsive Audit #10

- [ ] **2.9** Perbaikan aksesibilitas form
  - Pastikan semua input punya label dengan `htmlFor`
  - Tambah `aria-describedby` untuk error messages
  - **Effort:** 1-2 jam
  - **Source:** Frontend Audit #8

---

## 🟡 FASE 3 - OPTIMASI (21-26 jam)

### Code Quality

- [ ] **3.1** Konsolidasi duplicate UI components
  - Hapus `app/(owner)/salaries/components/ui/`
  - Update imports ke `components/ui/`
  - **Effort:** 2-3 jam
  - **Source:** Frontend Audit #10

- [ ] **3.2** Implementasi design tokens untuk spacing
  - Buat `constants/spacing.ts`
  - Konsistensi spacing di semua komponen
  - **Effort:** 2-3 jam
  - **Source:** Responsive Audit #7

- [ ] **3.3** Implementasi Next.js Image (untuk gambar future)
  - Setup konfigurasi di `next.config.ts`
  - **Effort:** 1 jam
  - **Source:** Frontend Audit #9

### Mobile Enhancement

- [ ] **3.4** Implementasi progressive disclosure
  - Show/hide details berdasarkan user action
  - Reduce initial cognitive load
  - **Effort:** 4-6 jam
  - **Source:** Responsive Audit #11

- [ ] **3.5** Add gesture support untuk mobile
  - Swipe actions untuk cards
  - Pull to refresh
  - **Effort:** 4 jam
  - **Source:** Responsive Audit #12

- [ ] **3.6** Optimize font loading strategy
  - font-display: swap
  - Preload critical fonts
  - **Effort:** 2 jam
  - **Source:** Responsive Audit #13

- [ ] **3.7** Implementasi service worker untuk offline
  - Cache static assets
  - Offline fallback pages
  - **Effort:** 6-8 jam
  - **Source:** Responsive Audit #14

- [ ] **3.8** Perbaikan color contrast badge
  - Audit semua badge colors
  - Pastikan contrast ratio 4.5:1
  - **Effort:** 1-2 jam
  - **Source:** Responsive Audit - WCAG

- [ ] **3.9** Optimize landmark regions
  - Proper use of main, nav, aside, header
  - ARIA landmarks untuk screen readers
  - **Effort:** 1-2 jam
  - **Source:** Responsive Audit - WCAG

---

## 📁 FILES MODIFIED (FASE 1)

### Modified Files
```
hooks/use-toast.tsx          - Memory leak fix (React Context)
hooks/use-dashboard.ts       - Re-render optimization (useCallback + AbortController)
next.config.ts               - CSP headers strengthening
proxy.ts                     - Route protection (barbers, attendance, cashflow added)
app/layout.tsx               - ToasterProvider centralization

app/(owner)/salaries/page.tsx     - Font size fix
app/(owner)/attendance/page.tsx   - Font size fix
app/(owner)/inventory/page.tsx    - Font size fix + card view
app/(owner)/cashflow/page.tsx     - Font size fix + touch target + card view
app/(owner)/settings/page.tsx     - Font size fix + touch target + card view
app/(owner)/barbers/page.tsx      - Font size fix + touch target

app/(cashier)/pos/page.tsx        - Aria-label for hidden buttons
```

### Deleted Files
```
middleware.ts                - Next.js 16.1.1 uses proxy.ts only
```

---

## 📁 FILES TO MODIFY (FASE 2 & 3)

### New Files (Remaining: 5)
```
constants/spacing.ts
components/ui/mobile-table.tsx
components/ui/mobile-transaction-card.tsx
components/ui/mobile-expense-card.tsx
public/sw.js (service worker)
```

### Created Files (Fase 2)
```
lib/logger.ts               - Environment-aware logging utility
```

### Modified Files (Remaining)
```
lib/rate-limit.ts
components/owner/revenue-breakdown.tsx
components/owner/expenses-breakdown.tsx
components/owner/metric-card.tsx
components/dashboard/sidebar.tsx
components/dashboard/dashboard-metrics.tsx
```

### Modified Files (Fase 2 - Task 2.3 Completed)
```
actions/dashboard.ts        - logError for revenue & top services
actions/cashflow.ts         - logError for cash operations
actions/products.ts         - logError for product fetch
actions/services.ts         - logError for service fetch
actions/users.ts            - logError for user fetch
actions/barbers.ts          - logError for barber fetch
actions/expenses.ts         - logError for expense delete
app/api/attendance/route.ts - logError for attendance fetch
app/api/barbers/[id]/route.ts - logError for barber API
app/(owner)/transactions/page.tsx - logError for expense save
app/(owner)/salaries/page.tsx - logError for salary detail
app/(owner)/salaries/components/*.tsx - logError for modals
app/(owner)/barbers/page.tsx - logError for barber save
app/(owner)/cashflow/page.tsx - logError for cashflow operations
app/(cashier)/pos/page.tsx - logError for POS operations
```

### Deleted Files
```
app/(owner)/salaries/components/ui/* (duplicate)
```

---

## ✅ VERIFICATION CHECKLIST

### Pre-Deployment
- [x] `npm run build` berhasil tanpa error
- [ ] `npm run lint` tidak ada warning
- [ ] TypeScript type check pass

### Functional Testing
- [ ] Test login/logout semua role (OWNER, CASHIER)
- [ ] Test dashboard loading dan filtering
- [ ] Test POS checkout flow
- [ ] Test rate limiting
- [ ] Test middleware redirect

### Mobile Testing
- [ ] Test pada 320px viewport (iPhone SE)
- [ ] Test pada 375px viewport (iPhone Standard)
- [ ] Test pada 414px viewport (iPhone Plus)
- [ ] Test touch targets (semua button >= 44px)
- [ ] Test horizontal scroll (tidak ada)

### Accessibility Testing
- [ ] Lighthouse accessibility score >= 90
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Keyboard navigation test
- [ ] Color contrast validation

### Performance Testing
- [ ] Lighthouse performance score >= 90
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] No console errors di browser
- [ ] Memory leak test (long session)

---

## 📈 TARGET METRICS

| Metrik | Current | Target | Status |
|--------|---------|--------|--------|
| **Performance Score** | ~75 | >= 90 | ⚠️ |
| **Accessibility Score** | ~70 | >= 90 | ⚠️ |
| **Best Practices** | ~85 | >= 95 | ⚠️ |
| **SEO Score** | 90 | >= 95 | ✅ |
| **LCP** | ~2.5s | < 2.0s | ⚠️ |
| **FID** | ~100ms | < 50ms | ⚠️ |
| **CLS** | ~0.05 | < 0.1 | ✅ |
| **Mobile Score** | 7.2/10 | 9/10 | ⚠️ |

---

## 📝 NOTES

1. **Fase 1 Completed:** Semua 8 task kritis sudah selesai pada 15 Februari 2026
2. **Fase 2 Progress:** Task 2.3 (Console cleanup) selesai pada 15 Februari 2026
3. **Next.js 16.1.1:** Menggunakan `proxy.ts` bukan `middleware.ts`
4. **CSP Changes:** Perlu testing menyeluruh karena dapat membreak functionality
5. **Mobile Testing:** Gunakan Chrome DevTools Device Mode + physical devices
6. **Backup:** Selalu backup database dan codebase sebelum perubahan besar
7. **Monitoring:** Setup monitoring untuk Core Web Vitals setelah deployment

---

## 🔗 QUICK LINKS

- [Frontend Audit Report](./FRONTEND_AUDIT_REPORT.md)
- [Responsive UI Audit Report](./RESPONSIVE_UI_AUDIT_REPORT.md)

---

*Last sync: 15 Februari 2026 - Fase 1 Completed, Fase 2 Task 2.3 Completed*
