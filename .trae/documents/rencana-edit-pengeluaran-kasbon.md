# Rencana: Editing Pengeluaran → Konversi ke Kasbon

## Analisa Kasus (Root Cause)
Kasus yang Anda alami masuk akal dengan kondisi implementasi saat ini:
- **Kasbon ter-record ke gaji hanya jika ada `SalaryDebt(type=KASBON)`**.
- Flow yang membuat `SalaryDebt(type=KASBON)` saat ini terjadi di **create pengeluaran** (saat `category=KASBON`).
- Sementara **edit pengeluaran (`updateExpense`) hanya mengubah data Expense**, tidak membuat `SalaryDebt` baru, dan tidak menautkan `Expense.salaryDebtId`.

Akibatnya:
1) Anda buat pengeluaran kategori `OTHER` → tercatat sebagai `Expense` biasa.
2) Anda edit kategori menjadi `KASBON` → `Expense.category` berubah, tetapi **tidak ada `SalaryDebt`** yang dibuat.
3) Saat payroll diproses, sistem memotong kasbon dari `SalaryDebt`, sehingga pengeluaran hasil edit tersebut **tidak akan memotong gaji**.

Catatan tambahan: Editing pengeluaran di sistem saat ini juga **tidak mengoreksi arus kas** (saldo akun & `CashTransaction`) bila amount/account berubah; jadi “edit pengeluaran” memang harus diperlakukan hati-hati untuk konsistensi akuntansi.

## Target Perbaikan
1) Mencegah kondisi “Expense KASBON tanpa `SalaryDebt`”.
2) Menyediakan cara aman agar pengeluaran `OTHER` bisa “diubah menjadi kasbon” dan tetap terhubung ke payroll.
3) Menjaga cashflow agar tidak double-counting.

## Solusi yang Dipilih: Opsi B (Konversi ke Kasbon)
Implementasi dibuat **bukan lewat edit biasa (`updateExpense`)**, tetapi lewat **aksi konversi khusus** supaya:
- SalaryDebt(type=KASBON) pasti terbentuk,
- `Expense.salaryDebtId` selalu terisi,
- tidak terjadi double cash transaction.

### Spesifikasi Aksi: `convertExpenseToKasbon(expenseId, barberId)`
Ditambahkan server action khusus (mis. `convertExpenseToKasbon(expenseId, barberId)`), bukan lewat `updateExpense`.

**Aturan konversi:**
- Hanya boleh untuk Expense yang:
  - **belum punya `salaryDebtId`** (agar tidak dobel),
  - dan **punya `accountId`** (karena kasbon harus punya sumber dana; kalau tidak ada akun, konversi ditolak).
- Dua mode yang didukung:
  1) Expense masih kategori non-KASBON (mis. OTHER) → dikonversi menjadi KASBON.
  2) Expense sudah terlanjur kategori KASBON tapi `salaryDebtId` kosong (akibat edit lama) → dianggap “repair” dan ditautkan ke payroll.
- Saat konversi/repair:
  - buat `SalaryDebt(type=KASBON, amount=expense.amount, reason=expense.title, barberId=...)`,
  - update `Expense`:
    - `category=KASBON`,
    - `barberId=<barberId>`,
    - `salaryDebtId=<newDebtId>`.
- **Tidak membuat `CashTransaction` baru** dan tidak mengubah saldo akun, karena cash out sudah terjadi saat Expense dibuat (jika accountId sudah ada).

### Perubahan UI (Transaksi → Pengeluaran)
- Di modal edit pengeluaran:
  - kategori boleh dipilih menjadi **KASBON**,
  - jika kategori diset ke KASBON saat mode edit:
    - tampilkan field “Barber” wajib,
    - tombol utama berubah menjadi **“Konversi ke Kasbon”** (memanggil `convertExpenseToKasbon`),
    - tombol “Simpan” (updateExpense) **tidak dipakai** untuk case ini.
- Setelah sukses konversi:
  - modal ditutup,
  - list pengeluaran di-refresh,
  - item tersebut diperlakukan sebagai kasbon (terkunci dari edit/hapus untuk menjaga konsistensi).

**Pro:**
- User bisa memperbaiki input tanpa delete + create ulang.
**Con:**
- Ada aturan tambahan (wajib accountId), dan perlu validasi kuat agar tidak menciptakan ketidakkonsistenan.

## Penanganan Data Existing (Repair)
Karena `convertExpenseToKasbon` juga bisa meng-handle mode “repair”, maka:
- Kasus “Expense.category=KASBON AND salaryDebtId IS NULL” dapat diperbaiki dengan menjalankan konversi dari UI (pilih barber lalu konversi).

## Implementasi yang Akan Dilakukan
1) Server: tambah action `convertExpenseToKasbon`.
   - Lokasi: `actions/expenses.ts` (atau file baru jika lebih rapi, tapi default: tetap di `actions/expenses.ts`).
   - Wajib transaksi DB (`prisma.$transaction`) untuk create debt + update expense agar atomic.
2) Server: update `updateExpense` untuk mencegah konversi KASBON via edit biasa:
   - Jika request update mengandung `category=KASBON`, kembalikan error yang mengarahkan memakai aksi konversi.
3) UI: update modal edit pengeluaran di `app/(owner)/transactions/page.tsx`:
   - Jika edit mode + kategori=KASBON → panggil `convertExpenseToKasbon` (bukan `updateExpense`).
   - Validasi UI: barber wajib, akun wajib, amount > 0.
   - Setelah konversi sukses: refresh list.
4) Locking behavior:
   - Setelah expense punya `salaryDebtId`, disable edit/hapus (seperti kasbon biasa) untuk mencegah mismatch payroll.
5) Verifikasi (tanpa reset DB):
   - Buat pengeluaran OTHER + pilih akun → edit → pilih KASBON + pilih barber → konversi → cek hutang kasbon muncul di gaji dan terpotong saat bayar gaji.

## Catatan Risiko yang Ditangani
- Mencegah “KASBON tanpa SalaryDebt” dengan memaksa path konversi.
- Mencegah double cashflow karena konversi tidak membuat cashTransaction baru.
- Mengunci expense yang sudah tertaut ke debt untuk menjaga integritas payroll.
