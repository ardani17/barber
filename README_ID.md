# 💈 Aplikasi Manajemen Barber Shop

Aplikasi manajemen barber shop berbasis web modern yang dibangun dengan Next.js 16, React 19, dan PostgreSQL. Aplikasi ini dirancang untuk memudahkan pengelolaan operasional barber shop termasuk transaksi, manajemen barber, inventory, keuangan, dan gaji.

---

## ✨ Fitur Utama

### 🏪 Manajemen Transaksi
- Point of Sale (POS) yang user-friendly
- Support layanan dan produk
- Multi metode pembayaran (Tunai, QRIS)
- Cetak struk transaksi
- Riwayat transaksi lengkap

### 👨‍💼 Manajemen Barber
- Tambah/edit/hapus barber
- Sistem komisi fleksibel (Base only, Commission only, atau Both)
- Manajemen absensi (Check in/out, izin, sakit)
- Kinerja barber report

### 💰 Manajemen Keuangan
- Cashflow management
- Multi akun kas dan bank
- Transfer antar akun
- Kategori pengeluaran
- Laporan keuangan

### 💵 Manajemen Gaji
- Generate laporan gaji otomatis
- Perhitungan komisi berdasarkan transaksi
- Bonus dan potongan
- Pembayaran gaji multi-channel (tunai, bank, QRIS)
- Manajemen hutang barber

### 📦 Inventory Management
- Manajemen produk
- Tracking stok
- Harga beli dan jual
- Peringatan stok rendah

### 📊 Laporan
- Laporan penjualan (harian, mingguan, bulanan)
- Laporan kinerja barber
- Laporan keuangan
- Export PDF dan Excel

### 🔐 Sistem Keamanan
- Multi-role (Owner, Cashier)
- Password hashing dengan bcrypt
- Rate limiting
- Session management

---

## 📋 Persyaratan Sistem

### Minimum Requirements
- **Node.js**: v20.0.0 atau lebih tinggi
- **PostgreSQL**: v14.0 atau lebih tinggi
- **RAM**: 4 GB minimum (8 GB direkomendasikan)
- **Storage**: 10 GB free space
- **OS**: Windows 10+, macOS 10.15+, atau Linux (Ubuntu 20.04+)

### Recommended for Production
- **CPU**: Quad Core 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 20 GB dengan SSD
- **OS**: Linux (Ubuntu 22.04+)

---

## 🚀 Instalasi Cepat

### 1. Clone Repository

```bash
git clone https://github.com/username/baberv3.git
cd baberv3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan isi konfigurasi:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/baberv3_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

Generate secret key:
```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed database (opsional)
npm run db:seed
```

### 5. Jalankan Aplikasi

**Development Mode:**
```bash
npm run dev
```

Buka browser: http://localhost:3000

**Production Mode:**
```bash
# Build aplikasi
npm run build

# Start dengan PM2
pm2 start ecosystem.config.js
```

---

## 🔧 Konfigurasi Database

### Buat Database PostgreSQL

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database
CREATE DATABASE baberv3_db;

# Buat user
CREATE USER baberv3_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE baberv3_db TO baberv3_user;
```

### Atau via pgAdmin/phpMyAdmin

1. Buat database baru dengan nama `baberv3_db`
2. Buat user dengan password
3. Grant semua privileges ke user tersebut

---

## 👤 Login Default

Setelah menjalankan `npm run db:seed`, gunakan kredensial default:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Owner

⚠️ **PENTING**: Ganti password default setelah login pertama!

---

## 📚 Panduan Penggunaan

### Menambah Layanan

1. Login sebagai Owner
2. Buka menu **Services**
3. Klik **"Tambah Layanan"**
4. Isi nama dan harga
5. Klik **Simpan**

### Menambah Barber

1. Buka menu **Barbers**
2. Klik **"Tambah Barber"**
3. Isi data barber dan tipe komisi
4. Klik **Simpan**

### Melakukan Transaksi

1. Buka menu **POS**
2. Pilih Barber
3. Pilih Layanan/Produk
4. Pilih metode pembayaran
5. Klik **"Proses Transaksi"**

### Mengatur Absensi

1. Buka menu **Attendance**
2. Pilih barber
3. Klik tombol absensi (Check In/Check Out/Izin/Sakit)

### Generate Gaji

1. Buka menu **Salaries**
2. Pilih periode dan barber
3. Klik **"Generate Laporan Gaji"**
4. Klik **"Bayar Gaji"**

---

## 🛠️ Perintah Tersedia

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema (dev)
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Production

```bash
pm2 start ecosystem.config.js    # Start app
pm2 restart baberv3              # Restart app
pm2 logs baberv3                # View logs
pm2 stop baberv3                # Stop app
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Cek PostgreSQL
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Test koneksi
psql -U baberv3_user -d baberv3_db -h localhost
```

### Build Error

```bash
# Hapus node_modules
rm -rf node_modules package-lock.json

# Install ulang
npm install

# Build ulang
npm run build
```

### Permission Error (Linux)

```bash
# Set permission
chmod -R 755 /var/www/baberv3

# Ubah owner
sudo chown -R $USER:$USER /var/www/baberv3
```

### Masalah lainnya?

Lihat dokumentasi lengkap: [DOKUMENTASI.md](./DOKUMENTASI.md)

---

## 📖 Dokumentasi Lengkap

Dokumentasi lengkap tersedia dalam file **[DOKUMENTASI.md](./DOKUMENTASI.md)** yang mencakup:

1. ✅ Persyaratan sistem detail
2. ✅ Panduan instalasi lengkap (Development & Production)
3. ✅ Setup Nginx dan SSL
4. ✅ Konfigurasi email/SMTP
5. ✅ Panduan penggunaan detail semua fitur
6. ✅ Troubleshooting lengkap
7. ✅ FAQ
8. ✅ Daftar error code dan solusi
9. ✅ Konfigurasi tambahan

---

## 🤝 Support

**Email**: support@baberv3.com  
**WhatsApp**: +62 812-3456-7890  
**Documentation**: https://docs.baberv3.com  
**GitHub**: https://github.com/username/baberv3

---

## 📄 License

Copyright © 2026 Barber Management System. All rights reserved.

---

## 🙏 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Authentication**: NextAuth.js v5

---

**⭐ Jika aplikasi ini membantu, jangan lupa memberikan star di GitHub!**

---

## 📝 Change Log

### v1.0.0 (2026-01-02)
- Initial release
- Core features: POS, Barber Management, Transactions, Inventory, Cashflow, Salary Management
- Authentication & authorization
- Basic reports and analytics
