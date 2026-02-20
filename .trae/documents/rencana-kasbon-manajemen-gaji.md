# Rencana: Kasbon Terintegrasi Payroll

## Tujuan
Menambahkan kemampuan merekam **Kasbon** (cash advance/pinjaman ke barber) lewat menu **Transaksi → Pengeluaran** dengan kategori baru **Kasbon**, dan memastikan kasbon tersebut bisa dipakai di **Manajemen Gaji** untuk:
- tercatat sebagai kewajiban barber (outstanding kasbon),
- bisa dipotong saat proses pembayaran gaji,
- tetap sinkron dengan arus kas (saldo akun/cashflow).

## Temuan Struktur Saat Ini (Baseline)
- Kategori pengeluaran bersifat **enum statis** (`ExpenseCategory`) dan di-hardcode ulang di:
  - Validasi server action pengeluaran (`z.enum([...])`) dan filter.
  - UI transaksi/pengeluaran (list kategori + union type).
  - Komponen ringkasan breakdown pengeluaran (mapping ikon/label).
- Payroll memiliki entitas `SalaryDebt` (hutang) yang secara UI ikut mengurangi “net salary”, tetapi:
  - Proses `paySalary(...)` saat ini tidak melakukan settlement hutang (`SalaryDebt`) ke pembayaran.
  - `SalaryDebt` memiliki `paymentId` namun belum menjadi relasi yang jelas untuk traceability settlement.
- Arus kas untuk pengeluaran sudah konsisten:
  - `Expense` + (opsional) decrement `CashAccount` + create `CashTransaction` tipe `WITHDRAW`.
- Arus kas untuk pembayaran gaji juga konsisten: decrement `CashAccount` + create `CashTransaction` tipe `WITHDRAW`, lalu create `SalaryPayment`.

## Keputusan Desain (Recommended)
Kasbon sebaiknya diperlakukan sebagai **sub-tipe hutang payroll** yang *juga tampil sebagai pengeluaran* (karena uang benar-benar keluar saat kasbon diberikan).

Desain yang disarankan:
1) Tambah kategori expense `KASBON` agar muncul di UI transaksi/pengeluaran dan agregasi dashboard/cashflow.
2) Saat user membuat pengeluaran kategori `KASBON`, sistem juga membuat catatan hutang payroll untuk barber:
   - Simpan sebagai `SalaryDebt` dengan penanda tipe `KASBON`.
3) Saat bayar gaji (`paySalary`), sistem otomatis:
   - mengambil kasbon/hutang yang belum lunas untuk barber,
   - memotongnya dari pembayaran (menambah `deductionAmount`/field khusus),
   - menandai hutang sebagai settled dan menautkannya ke `SalaryPayment` agar audit trail jelas,
   - **tanpa membuat cash out baru** (karena cash sudah keluar ketika kasbon dibuat).

Alasan:
- Memenuhi requirement user (“rekam kasbon lewat pengeluaran”) sekaligus menjaga domain payroll (kasbon sebagai kewajiban barber).
- Menjaga konsistensi cashflow: kas keluar 1x saat kasbon diberikan, bukan saat dipotong gaji.
- Memudahkan pelaporan dan audit (kasbon tercatat dan bisa ditrace).

## Alternatif (Lebih Cepat tapi Kurang Terintegrasi)
- Hanya menambah kategori `KASBON` di pengeluaran tanpa membuat relasi ke barber/`SalaryDebt`.
  - Dampak: payroll tidak tahu kasbon mana yang harus dipotong, user harus input manual di “deduction”.
  - Tidak direkomendasikan karena tujuan integrasi payroll tidak tercapai.

## Perubahan yang Direncanakan

### A. Database (Prisma + Migrasi)
1) Tambah `KASBON` ke `ExpenseCategory`.
2) Tambah tipe hutang payroll:
   - `enum SalaryDebtType { KASBON, OTHER }`
   - `SalaryDebt.type` default `OTHER`.
3) Perjelas hubungan settlement hutang:
   - Tambah field relasi `SalaryDebt.settledByPaymentId` (nullable) → `SalaryPayment.id`.
   - Pertahankan `isPaid/paidAt` sebagai status final.
4) (Opsional, tergantung kebutuhan reporting) Relasi dari `Expense` ke kasbon:
   - Tambah `Expense.salaryDebtId` nullable (relasi ke `SalaryDebt`) dan/atau `Expense.barberId` nullable.
   - Ini membuat “pengeluaran kasbon” bisa dibuka balik ke “hutang kasbon” tanpa mengandalkan teks deskripsi.

Catatan keputusan opsi (4) akan dipilih dengan prioritas:
- Jika UI transaksi butuh “lihat kasbon per barber” dari tab pengeluaran → ambil opsi (4).
- Jika cukup “kasbon tercatat & terpotong di gaji” → (4) bisa ditunda.

### B. Server Actions / Business Logic
1) Pengeluaran
   - Update schema validasi kategori (Zod) agar menerima `KASBON`.
   - Tambah flow khusus saat `category=KASBON`:
     - wajib pilih `barberId`,
     - create `SalaryDebt(type=KASBON, amount, reason/title)`,
     - tetap create `Expense(category=KASBON, amount, title, date, accountId)`,
     - decrement saldo akun + create `CashTransaction WITHDRAW` (tetap seperti pengeluaran biasa),
     - jika opsi relasi (A4) diambil: tautkan `Expense.salaryDebtId` ke debt.
2) Payroll
   - `paySalary(...)`:
     - query `SalaryDebt` outstanding (isPaid=false) untuk barber, filter `type=KASBON` (dan/atau include OTHER jika diinginkan),
     - hitung total kasbon yang akan dipotong,
     - apply deduction otomatis:
       - minimal: tambahkan ke `deductionAmount` yang disimpan di `SalaryPayment`,
       - ideal: tambahkan field khusus di `SalaryPayment` (mis. `kasbonDeductedAmount`) agar eksplisit (diputuskan saat implementasi),
     - mark hutang kasbon sebagai paid & set `settledByPaymentId`.
   - Pastikan tidak ada cash transaction tambahan ketika settlement via payroll.

### C. UI (Owner → Transaksi → Pengeluaran)
1) Tambah pilihan kategori “Kasbon” pada dropdown kategori.
2) Jika kategori “Kasbon” dipilih:
   - tampilkan field “Barber” (select barber),
   - placeholder/label menyesuaikan: deskripsi = alasan kasbon,
   - validasi client-side: barber wajib, amount > 0, account wajib bila amount > 0.
3) Tampilkan badge/label yang jelas pada list pengeluaran untuk kategori kasbon.

### D. UI (Owner → Gaji)
1) Pastikan outstanding kasbon tampil jelas sebagai bagian dari hutang.
2) Saat membuka modal bayar gaji:
   - tampilkan info “Kasbon outstanding” dan “Kasbon akan dipotong” (read-only),
   - cegah user bingung karena UI saat ini mengurangi debt di ringkasan, namun proses `paySalary` sebelumnya belum menyettle.

### E. Dashboard / Reporting / Breakdown
1) Update mapping ikon/label untuk kategori `KASBON` agar breakdown tetap rapi.
2) Pastikan query agregasi/filter kategori expense tidak error akibat enum baru.

## Checklist Acceptance Criteria
- Di Transaksi → Pengeluaran, user bisa memilih kategori “Kasbon”.
- Saat membuat kasbon:
  - saldo akun berkurang (jika account dipilih),
  - cashflow mencatat `WITHDRAW` dengan deskripsi yang sesuai,
  - kasbon tercatat sebagai hutang barber (`SalaryDebt` bertipe `KASBON`).
- Saat bayar gaji barber dengan kasbon outstanding:
  - kasbon otomatis terpotong,
  - hutang kasbon berubah status lunas dan terkait ke pembayaran gaji,
  - tidak ada cash out tambahan selain cash out pembayaran gaji itu sendiri.
- UI salary summary dan data real di DB konsisten (tidak hanya “tampil berkurang” tapi benar-benar settled).

## Risiko & Mitigasi
- **Double counting cashflow** (kasbon keluar saat dibuat + keluar lagi saat settlement): mitigasi dengan memastikan settlement hanya status hutang, tanpa `CashTransaction`.
- **Ketidakkonsistenan UI vs server** (UI sudah mengurangi debt tapi server belum): mitigasi dengan menambahkan settlement di `paySalary`.
- **Hardcoded enum di banyak tempat**: mitigasi dengan audit grep untuk semua `RENT|UTILITIES|SUPPLIES|OTHER` dan update serentak.

## Verifikasi
- Uji manual skenario:
  1) Buat kasbon 100.000 dari akun tunai → saldo turun, expense tercatat, debt kasbon tercatat.
  2) Bayar gaji periode berjalan → kasbon otomatis dipotong dan debt menjadi lunas.
  3) Breakdown pengeluaran menampilkan kasbon dan totalnya sesuai.
- Tambahkan minimal 1 test (jika ada harness) untuk memastikan `paySalary` melakukan settlement debt.

