# 📚 Dokumentasi Aplikasi Manajemen Barber Shop

---

## 📖 Daftar Isi

1. [Persyaratan Sistem](#1-persyaratan-sistem)
2. [Panduan Instalasi](#2-panduan-instalasi)
3. [Konfigurasi Awal](#3-konfigurasi-awal)
4. [Panduan Penggunaan](#4-panduan-penggunaan)
5. [Troubleshooting](#5-troubleshooting)
6. [FAQ](#6-faq)
7. [Daftar Error Code](#7-daftar-error-code)
8. [Kontak Support](#8-kontak-support)

---

## 1. Persyaratan Sistem

### 1.1 Spesifikasi Minimal Server/Hosting

#### Development Environment (Lokal)
- **CPU**: Dual Core 2.0 GHz atau lebih tinggi
- **RAM**: 4 GB minimum (8 GB direkomendasikan)
- **Storage**: 10 GB free space
- **OS**: Windows 10+, macOS 10.15+, atau Linux (Ubuntu 20.04+)

#### Production Environment
- **CPU**: Quad Core 2.5 GHz atau lebih tinggi
- **RAM**: 4 GB minimum (8 GB direkomendasikan untuk traffic tinggi)
- **Storage**: 20 GB free space dengan SSD
- **OS**: Linux (Ubuntu 22.04+ / Debian 11+)
- **Bandwidth**: Minimum 10 Mbps

### 1.2 Versi Node.js

- **Node.js**: v20.0.0 atau lebih tinggi (v22.x direkomendasikan)
- **npm**: v9.0.0 atau lebih tinggi
- **yarn** (opsional): v1.22.0 atau lebih tinggi
- **pnpm** (opsional): v8.0.0 atau lebih tinggi

**Cek versi Node.js:**
```bash
node --version
npm --version
```

### 1.3 Persyaratan Database (PostgreSQL)

- **PostgreSQL**: v14.0 atau lebih tinggi (v15.x atau v16.x direkomendasikan)
- **RAM untuk Database**: Minimum 1 GB
- **Storage untuk Database**: Minimum 5 GB (tergantung volume data)

**Rekomendasi Konfigurasi PostgreSQL:**
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 1.4 Software Tambahan

- **Git**: v2.30.0 atau lebih tinggi
- **PM2** (untuk production): v5.0.0 atau lebih tinggi
- **Nginx** (untuk reverse proxy): v1.18.0 atau lebih tinggi

---

## 2. Panduan Instalasi

### 2.1 Langkah 1: Unduh Paket Aplikasi

#### Opsi A: Clone dari Git Repository
```bash
git clone https://github.com/username/baberv3.git
cd baberv3
```

#### Opsi B: Download ZIP
1. Download file ZIP dari repository
2. Ekstrak file ZIP ke direktori yang diinginkan
3. Buka terminal/command prompt di direktori tersebut

### 2.2 Langkah 2: Upload ke Server

#### Untuk Shared Hosting
1. Upload semua file menggunakan:
   - **cPanel File Manager**: Upload folder sebagai .zip, lalu ekstrak
   - **FTP**: Gunakan FileZilla atau WinSCP
   - **SFTP**: Gunakan perintah:
     ```bash
     scp -r baberv3 user@yourserver.com:/var/www/
     ```

#### Untuk VPS/Dedicated Server
```bash
# SSH ke server
ssh user@yourserver.com

# Navigasi ke web directory
cd /var/www/

# Clone repository
git clone https://github.com/username/baberv3.git

# Atau upload file
scp baberv3.zip user@yourserver.com:/var/www/
unzip baberv3.zip
```

### 2.3 Langkah 3: Konfigurasi Permissions Folder

#### Linux/macOS
```bash
# Masuk ke direktori aplikasi
cd /var/www/baberv3

# Set permissions untuk folder
find . -type d -exec chmod 755 {} \;

# Set permissions untuk file
find . -type f -exec chmod 644 {} \;

# Set permissions khusus untuk node_modules
chmod -R 755 node_modules

# Pastikan .next directory writable
chmod -R 755 .next
```

#### Windows
Secara default, permissions sudah terkonfigurasi dengan benar. Namun jika ada masalah:
1. Klik kanan folder → Properties → Security
2. Pastikan user memiliki permission Read & Execute
3. Pastikan folder dapat di-write oleh aplikasi

### 2.4 Langkah 4: Buat Database Baru

#### Via phpMyAdmin
1. Login ke phpMyAdmin
2. Klik tab "Databases"
3. Masukkan nama database (contoh: `baberv3_db`)
4. Klik "Create"
5. Buat user database baru dengan permission lengkap

#### Via PostgreSQL Command Line
```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database
CREATE DATABASE baberv3_db;

# Buat user database
CREATE USER baberv3_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE baberv3_db TO baberv3_user;

# Exit
\q
```

#### Via pgAdmin
1. Buka pgAdmin
2. Klik kanan pada Databases → Create → Database
3. Masukkan nama: `baberv3_db`
4. Klik Save
5. Klik kanan pada Login/Group Roles → Create → Login/Group Role
6. Masukkan nama user dan password
7. Set privileges dan Save

### 2.5 Langkah 5: Instalasi Dependensi

#### Development Environment
```bash
# Install dependencies
npm install

# Atau menggunakan yarn
yarn install

# Atau menggunakan pnpm
pnpm install
```

#### Production Environment
```bash
# Install dependencies (production only)
npm install --production=false

# Install PM2 untuk process management
npm install -g pm2

# Install build tools jika belum ada
npm install -g typescript @types/node
```

### 2.6 Langkah 6: Konfigurasi Environment

#### Buat File .env
Copy file `.env.example` dan rename menjadi `.env`:

```bash
# Linux/macOS
cp .env.example .env

# Windows
copy .env.example .env
```

#### Edit File .env
```env
# Database Configuration
DATABASE_URL="postgresql://baberv3_user:your_secure_password@localhost:5432/baberv3_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Application Configuration
NODE_ENV="development"
APP_NAME="Barber Management System"
APP_URL="http://localhost:3000"

# Email Configuration (Opsional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Redis Configuration (Opsional - untuk rate limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 5)

# Atau online: https://generate-secret.vercel.app/32
```

### 2.7 Langkah 7: Setup Database

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Push Database Schema
```bash
# Development mode
npm run db:push

# Production mode (gunakan migrations)
npm run db:migrate
```

#### Seed Database (Opsional)
```bash
npm run db:seed
```

### 2.8 Langkah 8: Build Aplikasi

#### Development Build
```bash
npm run build
```

#### Production Build
```bash
# Build dengan optimasi
npm run build -- --production

# Verifikasi build
npm run start
```

### 2.9 Langkah 9: Jalankan Aplikasi

#### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

#### Production Mode dengan PM2
```bash
# Buat file ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'baberv3',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/baberv3',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start aplikasi
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 2.10 Langkah 10: Setup Nginx Reverse Proxy (Production)

#### Konfigurasi Nginx
```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/baberv3
```

Isi dengan konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optimasi static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Aktifkan Konfigurasi
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/baberv3 /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

### 2.11 Langkah 11: Setup SSL dengan Let's Encrypt (Opsional tapi Disarankan)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
sudo certbot renew --dry-run
```

---

## 3. Konfigurasi Awal

### 3.1 Akses Pertama

1. Buka browser dan akses aplikasi: `http://yourdomain.com` atau `http://localhost:3000`
2. Anda akan diarahkan ke halaman login
3. Login menggunakan akun default yang dibuat saat seeding:
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Catatan**: Ganti password segera setelah login pertama

### 3.2 Pengaturan Dasar Aplikasi

#### Akses Halaman Settings
1. Login sebagai **Owner**
2. Klik menu **Settings** di sidebar
3. Lengkapi informasi berikut:

**Informasi Toko:**
- Nama Toko
- Alamat lengkap
- Nomor telepon
- Email kontak
- Jam operasional

**Pengaturan Transaksi:**
- Prefix nomor transaksi (default: TRX)
- Auto-increment nomor transaksi
- Pajak/Persen (jika ada)
- Metode pembayaran aktif (Tunai, QRIS, Transfer Bank)

### 3.3 Konfigurasi Email/SMTP

#### Konfigurasi di .env
```env
# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"
```

#### Konfigurasi di Settings Panel
1. Buka menu Settings → Email
2. Isi konfigurasi SMTP:
   - **SMTP Host**: `smtp.gmail.com` (untuk Gmail)
   - **SMTP Port**: `587` untuk TLS, `465` untuk SSL
   - **SMTP User**: Email pengirim
   - **SMTP Password**: App password (bukan password biasa untuk Gmail)
   - **From Email**: Email pengirim
   - **From Name**: Nama pengirim

#### Cara Mendapatkan App Password Gmail
1. Login ke Google Account
2. Go to Security → 2-Step Verification
3. Klik "App passwords"
4. Pilih "Mail" dan device (Other)
5. Generate dan copy password

### 3.4 Pengaturan Pembayaran

#### Konfigurasi Metode Pembayaran
1. Buka menu Settings → Payment Methods
2. Aktifkan metode pembayaran:
   - **Tunai**: Aktifkan dan setting opsi
   - **QRIS**: Masukkan QR code image dan nomor akun
   - **Transfer Bank**: Tambahkan rekening bank yang tersedia

#### Setup Rekening Bank
1. Buka menu Cashflow → Bank Accounts
2. Klik "Tambah Rekening Bank"
3. Isi detail:
   - Nama Bank
   - Nomor Rekening
   - Nama Pemilik
   - Saldo Awal
   - Status Aktif/Non-aktif

### 3.5 Konfigurasi Akun Kas

#### Setup Akun Kas Tunai
1. Buka menu Cashflow → Cash Accounts
2. Klik "Tambah Akun Kas"
3. Isi detail:
   - Nama Akun: "Kas Utama"
   - Tipe: TUNAI
   - Saldo Awal: Rp 0
   - Set sebagai Default: Ya
   - Status Aktif

#### Setup Akun QRIS
1. Buka menu Cashflow → Cash Accounts
2. Klik "Tambah Akun Kas"
3. Isi detail:
   - Nama Akun: "QRIS"
   - Tipe: QRIS
   - Saldo Awal: Rp 0
   - Status Aktif

### 3.6 Integrasi Sistem Eksternal

#### Integrasi WhatsApp (Opsional)
Untuk notifikasi WhatsApp:
1. Daftar di layanan WhatsApp Gateway (misal: Twilio, Wablas, Fonez)
2. Dapatkan API Key dan API URL
3. Konfigurasi di Settings → Integrations
4. Template pesan otomatis:
   - Konfirmasi booking
   - Pengingat jadwal
   - Promosi

#### Integrasi Payment Gateway (Opsional)
Untuk pembayaran online:
1. Daftar di payment gateway (Midtrans, Xendit, Doku)
2. Dapatkan API Key dan Secret Key
3. Konfigurasi di Settings → Payment Gateway
4. Setup callback URL

---

## 4. Panduan Penggunaan

### 4.1 Cara Menambah Layanan (Services)

#### Langkah 1: Buka Halaman Layanan
1. Login sebagai Owner
2. Klik menu **Services** di sidebar
3. Klik tombol **"Tambah Layanan"**

#### Langkah 2: Isi Data Layanan
- **Nama Layanan**: Contoh "Potong Rambut"
- **Harga**: Masukkan harga dalam Rupiah (contoh: 50000)
- **Status**: Aktif/Non-aktif
- **Deskripsi**: Opsional

#### Langkah 3: Simpan
Klik tombol **"Simpan"** untuk menyimpan layanan

#### Contoh Layanan Standar Barber Shop
| Nama Layanan | Harga | Komisi (umum) |
|--------------|-------|---------------|
| Potong Rambut | Rp 50.000 | 20-30% |
| Cuci Rambut | Rp 30.000 | 15-20% |
| Potong & Cuci | Rp 70.000 | 25-35% |
| Cream Bath | Rp 100.000 | 30-40% |
| Coloring | Rp 150.000 | 35-45% |
| Styling | Rp 80.000 | 25-35% |

### 4.2 Manajemen Jadwal Barber

#### Tambah Barber Baru
1. Klik menu **Barbers** di sidebar
2. Klik tombol **"Tambah Barber"**
3. Isi data barber:
   - Nama Barber
   - Password untuk login
   - Tipe Komisi:
     - *Base Only*: Gaji tetap saja
     - *Commission Only*: Komisi saja
     - *Both*: Gaji tetap + Komisi
   - Gaji Pokok (jika dipilih Base Only atau Both)
   - Persentase Komisi (jika dipilih Commission Only atau Both)
   - Status: Aktif/Non-aktif
4. Klik **"Simpan"**

#### Manajemen Absensi
1. Klik menu **Attendance** di sidebar
2. Pilih barber dari dropdown
3. Klik tombol untuk absen:
   - **Check In**: Mulai kerja
   - **Check Out**: Selesai kerja
   - **Permission**: Izin
   - **Sick**: Sakit
4. Sistem akan mencatat timestamp otomatis

#### Setup Periode Gaji
1. Klik menu **Salaries** di sidebar
2. Pilih barber
3. Klik **"Setup Periode Gaji"**
4. Pilih tipe periode:
   - Mingguan (Senin-Minggu)
   - Bulanan (1-30/31)
   - Custom
5. Atur tanggal mulai dan akhir
6. Klik **"Simpan"**

### 4.3 Proses Booking Pelanggan

#### Cara 1: Walk-in Customer
1. Buka menu **POS** (Point of Sale)
2. Pilih Barber yang melayani
3. Pilih Layanan (klik untuk menambah)
4. Tambah Produk jika ada (opsional)
5. Masukkan keterangan tambahan (opsional)
6. Pilih Metode Pembayaran:
   - TUNAI
   - QRIS
7. Klik **"Proses Transaksi"**
8. Transaksi selesai dan akan tercatat otomatis

#### Cara 2: Booking Terjadwal (Future Feature)
*Fitur ini dapat ditambahkan sesuai kebutuhan*

### 4.4 Manajemen Transaksi

#### Melihat Riwayat Transaksi
1. Buka menu **Transactions**
2. Filter transaksi berdasarkan:
   - Tanggal
   - Barber
   - Kasir
   - Metode Pembayaran
3. Klik transaksi untuk melihat detail

#### Detail Transaksi
Setiap transaksi menampilkan:
- Nomor transaksi
- Tanggal dan waktu
- Barber yang melayani
- Kasir
- Item yang dibeli (layanan/produk)
- Subtotal
- Total komisi barber
- Metode pembayaran
- Total pembayaran

#### Cetak Struk
1. Buka detail transaksi
2. Klik tombol **"Cetak Struk"**
3. Struk akan dicetak menggunakan printer yang terhubung

#### Pembatalan Transaksi
1. Buka detail transaksi
2. Klik tombol **"Batalkan Transaksi"**
3. Masukkan alasan pembatalan
4. Konfirmasi pembatalan
5. Transaksi akan ditandai sebagai dibatalkan

### 4.5 Manajemen Produk (Inventory)

#### Tambah Produk Baru
1. Klik menu **Inventory** di sidebar
2. Klik tombol **"Tambah Produk"**
3. Isi data produk:
   - Nama Produk
   - Harga Beli
   - Harga Jual
   - Stok Awal
   - Status: Aktif/Non-aktif
4. Klik **"Simpan"**

#### Update Stok Produk
1. Buka menu **Inventory**
2. Klik produk yang akan di-update
3. Klik **"Update Stok"**
4. Masukkan jumlah stok baru atau penambahan/pengurangan
5. Klik **"Simpan"**

#### Monitoring Stok
Sistem akan memberikan peringatan jika stok produk:
- **Stok Rendah**: < 10 unit
- **Stok Kosong**: = 0 unit

### 4.6 Manajemen Keuangan (Cashflow)

#### Catat Pemasukan/Keluaran
1. Buka menu **Cashflow**
2. Klik **"Tambah Transaksi"**
3. Pilih jenis transaksi:
   - **Pemasukan**: Uang masuk ke kas
   - **Pengeluaran**: Uang keluar dari kas
   - **Transfer**: Pindah antar akun
4. Pilih akun sumber dan tujuan
5. Masukkan jumlah
6. Masukkan deskripsi/keterangan
7. Klik **"Simpan"**

#### Kategori Pengeluaran
- **RENT**: Sewa tempat
- **UTILITIES**: Listrik, air, internet
- **SUPPLIES**: Beli peralatan/material
- **OTHER**: Pengeluaran lainnya

#### Transfer Antar Akun
1. Buka menu **Cashflow**
2. Klik **"Transfer"**
3. Pilih akun sumber (misal: Kas Tunai)
4. Pilih akun tujuan (misal: Bank BCA)
5. Masukkan jumlah transfer
6. Masukkan deskripsi
7. Klik **"Simpan"**

### 4.7 Manajemen Gaji Barber

#### Generate Laporan Gaji
1. Buka menu **Salaries**
2. Pilih periode gaji
3. Pilih barber
4. Klik **"Generate Laporan Gaji"**
5. Sistem akan menghitung:
   - Gaji Pokok (jika ada)
   - Total Komisi (berdasarkan transaksi periode tsb)
   - Bonus (jika ada)
   - Potongan (jika ada)
   - Total Gaji

#### Pembayaran Gaji
1. Setelah laporan gaji di-generate
2. Klik **"Bayar Gaji"**
3. Tentukan pembagian pembayaran:
   - Kas Tunai
   - Bank
   - QRIS
4. Masukkan catatan (opsional)
5. Klik **"Proses Pembayaran"**
6. Gaji akan dicatat sebagai pengeluaran di Cashflow

#### Hutang Barber
1. Buka menu **Salaries**
2. Klik tab **"Hutang"**
3. Klik **"Tambah Hutang"**
4. Masukkan:
   - Barber
   - Jumlah hutang
   - Alasan
5. Klik **"Simpan"**

#### Potongan/Bonus Tambahan
1. Buka menu **Salaries**
2. Klik **"Tambah Adjustment"**
3. Pilih tipe:
   - **BONUS**: Tambahan gaji
   - **DEDUCTION**: Potongan gaji
4. Masukkan jumlah dan alasan
5. Klik **"Simpan"**

### 4.8 Generate Laporan

#### Laporan Penjualan
1. Buka menu **Dashboard** atau **Reports**
2. Pilih jenis laporan:
   - Harian
   - Mingguan
   - Bulanan
   - Custom range
3. Klik **"Generate Report"**
4. Laporan menampilkan:
   - Total pendapatan
   - Total transaksi
   - Layanan terpopuler
   - Produk terlaris
   - Perbandingan dengan periode sebelumnya

#### Laporan Kinerja Barber
1. Buka menu **Reports** → **Barber Performance**
2. Pilih periode dan barber
3. Laporan menampilkan:
   - Jumlah transaksi
   - Total pendapatan
   - Total komisi
   - Rata-rata per transaksi
   - Kehadiran

#### Laporan Keuangan
1. Buka menu **Cashflow**
2. Klik **"Laporan"**
3. Pilih periode
4. Laporan menampilkan:
   - Saldo awal
   - Total pemasukan
   - Total pengeluaran
   - Saldo akhir
   - Breakdown per kategori

#### Export Laporan
Semua laporan dapat di-export ke:
- **PDF**: Untuk arsip dan cetak
- **Excel**: Untuk analisis lebih lanjut
- **CSV**: Untuk import ke sistem lain

---

## 5. Troubleshooting

### 5.1 Masalah Umum dan Solusinya

#### Masalah 1: Aplikasi tidak bisa diakses

**Gejala:**
- Browser menampilkan "This site can't be reached"
- Error 502 Bad Gateway

**Solusi:**
```bash
# Cek status aplikasi
pm2 status

# Jika aplikasi stop, restart
pm2 restart baberv3

# Cek error log
pm2 logs baberv3

# Cek port yang digunakan
netstat -tulpn | grep :3000

# Restart Nginx
sudo systemctl restart nginx
```

#### Masalah 2: Database Connection Failed

**Gejala:**
- Error: "Can't reach database server"
- Error: "Connection refused"

**Solusi:**
```bash
# Cek status PostgreSQL
sudo systemctl status postgresql

# Jika tidak berjalan, start PostgreSQL
sudo systemctl start postgresql

# Cek apakah database ada
sudo -u postgres psql -l

# Test koneksi database
psql -U baberv3_user -d baberv3_db -h localhost

# Cek file .env
cat .env | grep DATABASE_URL

# Restart aplikasi
pm2 restart baberv3
```

#### Masalah 3: Build Error

**Gejala:**
- Error saat menjalankan `npm run build`
- Error: "Module not found"

**Solusi:**
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang dependencies
npm install

# Build ulang
npm run build

# Jika masih error, cek version compatibility
npm outdated

# Update dependencies yang outdated
npm update
```

#### Masalah 4: Permission Denied

**Gejala:**
- Error: "EACCES: permission denied"
- Tidak bisa write ke folder tertentu

**Solusi:**
```bash
# Cek owner folder
ls -la

# Ubah owner folder
sudo chown -R $USER:$USER /var/www/baberv3

# Set permission ulang
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Pastikan folder .next writable
chmod -R 755 .next
```

### 5.2 Error Database

#### Error: "PrismaClientInitializationError"

**Gejala:**
- Error saat inisialisasi database
- "P1001: Can't reach database server"

**Solusi:**
```bash
# Cek koneksi database
psql postgresql://baberv3_user:password@localhost:5432/baberv3_db

# Cek PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf

# Pastikan listen_addresses = '*'
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

# Regenerate Prisma Client
npm run db:generate

# Push schema ulang
npm run db:push
```

#### Error: "Unique constraint failed"

**Gejala:**
- Tidak bisa insert data karena duplicate

**Solusi:**
```bash
# Akses Prisma Studio
npm run db:studio

# Hapus data duplicate via Studio

# Atau gunakan query SQL
psql -U baberv3_user -d baberv3_db
DELETE FROM table_name WHERE condition;
```

#### Error: "Migration failed"

**Gejala:**
- Error saat menjalankan migration

**Solusi:**
```bash
# Reset database (PERHATIAN: Akan menghapus semua data)
npm run db:push -- --force-reset

# Atau resolve migration conflict
npx prisma migrate resolve --applied "migration_name"

# Buat migration baru
npm run db:migrate
```

### 5.3 Masalah Upload File

#### Error: "File too large"

**Gejala:**
- Tidak bisa upload file gambar

**Solusi:**
```bash
# Edit next.config.js
nano next.config.js

# Tambahkan konfigurasi
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

# Restart aplikasi
pm2 restart baberv3
```

#### Error: "Permission denied" saat upload

**Solusi:**
```bash
# Pastikan folder public/uploads ada
mkdir -p public/uploads

# Set permission
chmod 755 public/uploads
chown -R $USER:$USER public/uploads
```

### 5.4 Masalah Konektivitas

#### Error: "Network Error"

**Gejala:**
- Tidak bisa connect ke API

**Solusi:**
```bash
# Cek firewall
sudo ufw status

# Buka port 3000 jika perlu
sudo ufw allow 3000

# Cek apakah aplikasi berjalan
pm2 status

# Cek Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Error: "CORS Policy"

**Gejala:**
- Browser menolak request dari domain lain

**Solusi:**
```bash
# Edit next.config.js atau middleware
nano middleware.ts

# Tambahkan CORS config
export const config = {
  matcher: '/api/:path*',
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
```

### 5.5 Masalah Performa

#### Aplikasi Lambat

**Solusi:**
```bash
# Cek resource usage
pm2 monit

# Optimasi Next.js
npm run build

# Enable caching
# Edit next.config.js
module.exports = {
  compress: true,
  swcMinify: true,
  images: {
    formats: ['image/webp'],
  },
}

# Restart aplikasi
pm2 restart baberv3
```

#### Database Slow Query

**Solusi:**
```sql
-- Analisis query lambat
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Buat index jika perlu
CREATE INDEX idx_transactions_date ON "Transaction"(date);
CREATE INDEX idx_transactions_barber ON "Transaction"(barberId);

-- Vacuum database
VACUUM ANALYZE;
```

---

## 6. FAQ

### 6.1 Pertanyaan Umum Tentang Fitur

**Q: Apakah aplikasi ini mendukung multi-branch?**
A: Saat ini aplikasi mendukung single-location. Untuk multi-branch, perlu custom development.

**Q: Bisa tidak barcode/QR code untuk produk?**
A: Ya, Anda bisa menggunakan barcode scanner USB yang terhubung langsung ke komputer untuk scan produk di POS.

**Q: Apakah ada fitur booking online untuk pelanggan?**
A: Fitur booking online dapat ditambahkan sesuai kebutuhan. Hubungi tim development untuk implementasi.

**Q: Bagaimana cara backup data?**
A: Anda bisa backup database menggunakan:
```bash
pg_dump -U baberv3_user baberv3_db > backup_$(date +%Y%m%d).sql
```

**Q: Apakah data pelanggan disimpan?**
A: Saat ini aplikasi fokus pada transaksi. Fitur CRM (Customer Relationship Management) dapat ditambahkan.

**Q: Bisa tidak export laporan ke format lain?**
A: Saat ini mendukung PDF dan Excel. Format lain dapat ditambahkan sesuai kebutuhan.

**Q: Apakah ada mobile app?**
A: Saat ini web-based dan responsive untuk mobile. Native mobile app dapat dikembangkan.

### 6.2 Pertanyaan Teknis

**Q: Apa perbedaan antara User Role?**
A: 
- **Owner**: Akses penuh ke semua fitur (settings, laporan, keuangan, dll)
- **Cashier**: Akses terbatas ke POS dan melihat riwayat transaksi

**Q: Bagaimana cara reset password?**
A: 
1. Login sebagai Owner
2. Buka menu Settings → Users
3. Klik user yang akan di-reset
4. Klik "Reset Password"
5. Masukkan password baru

**Q: Apakah aplikasi offline-ready?**
A: Tidak sepenuhnya offline karena memerlukan koneksi database. Namun, fitur offline mode dapat ditambahkan.

**Q: Berapa banyak barber yang bisa di-manage?**
A: Tidak ada batasan. Anda bisa menambah unlimited barber.

**Q: Apakah support multi-language?**
A: Saat ini Bahasa Indonesia. Multi-language dapat diimplementasikan.

**Q: Bagaimana cara upgrade aplikasi?**
A: 
```bash
# Backup database
pg_dump -U baberv3_user baberv3_db > backup_before_upgrade.sql

# Pull latest code
git pull origin main

# Install/update dependencies
npm install

# Run migration jika ada
npm run db:migrate

# Build ulang
npm run build

# Restart aplikasi
pm2 restart baberv3
```

**Q: Apakah data aman?**
A: 
- Password di-hash dengan bcrypt
- Database dapat di-encrypted
- Support SSL untuk koneksi
- Backup regular disarankan

**Q: Bagaimana cara restore database dari backup?**
A: 
```bash
psql -U baberv3_user baberv3_db < backup_20231201.sql
```

### 6.3 Pertanyaan Tentang Pembaruan

**Q: Seberapa sering aplikasi di-update?**
A: Update rutin dilakukan setiap bulan untuk bug fixes dan security patches. Feature update setiap quarter.

**Q: Apakah update gratis?**
A: Minor update dan bug fix gratis. Major feature update mungkin memerlukan biaya tambahan.

**Q: Bagaimana cara mengetahui update terbaru?**
A: Cek GitHub repository atau subscribe ke newsletter update.

**Q: Apakah support akan terus tersedia?**
A: Ya, support tersedia dengan berbagai paket subscription.

---

## 7. Daftar Error Code

### 7.1 HTTP Status Codes

| Code | Deskripsi | Solusi |
|------|-----------|--------|
| 200 | OK | Sukses |
| 201 | Created | Data berhasil dibuat |
| 400 | Bad Request | Request tidak valid |
| 401 | Unauthorized | Login diperlukan |
| 403 | Forbidden | Tidak ada akses |
| 404 | Not Found | Data tidak ditemukan |
| 409 | Conflict | Data sudah ada |
| 422 | Unprocessable Entity | Data tidak valid |
| 500 | Internal Server Error | Error server |
| 502 | Bad Gateway | Server down |
| 503 | Service Unavailable | Maintenance |

### 7.2 Application Error Codes

| Code | Nama Error | Deskripsi | Solusi |
|------|------------|-----------|--------|
| ERR-001 | AUTH_FAILED | Login gagal | Cek username/password |
| ERR-002 | USER_LOCKED | Akun terkunci | Hubungi admin |
| ERR-003 | INVALID_TOKEN | Token tidak valid | Login ulang |
| ERR-004 | DB_CONNECTION | Database error | Cek koneksi DB |
| ERR-005 | VALIDATION_ERROR | Data tidak valid | Cek input form |
| ERR-006 | NOT_FOUND | Data tidak ada | Cek ID data |
| ERR-007 | DUPLICATE_ENTRY | Data sudah ada | Gunakan data lain |
| ERR-008 | INSUFFICIENT_STOCK | Stok tidak cukup | Tambah stok |
| ERR-009 | PAYMENT_FAILED | Pembayaran gagal | Coba lagi |
| ERR-010 | FILE_TOO_LARGE | File terlalu besar | Kompres file |
| ERR-011 | INVALID_FORMAT | Format salah | Gunakan format benar |
| ERR-012 | RATE_LIMITED | Terlalu banyak request | Tunggu beberapa saat |
| ERR-013 | MAINTENANCE | Sedang maintenance | Coba lagi nanti |

### 7.3 Prisma Error Codes

| Code | Deskripsi | Solusi |
|------|-----------|--------|
| P1000 | Auth failed | Cek DATABASE_URL |
| P1001 | Can't reach DB | Cek koneksi PostgreSQL |
| P1002 | Connection timeout | Cek network/firewall |
| P1003 | DB not found | Buat database dulu |
| P2002 | Unique constraint | Data duplicate |
| P2003 | Foreign key constraint | Referensi tidak valid |
| P2004 | Constraint failed | Data tidak valid |
| P2005 | Field value invalid | Cek tipe data |
| P2006 | Value too long | Kurangi panjang |
| P2007 | Data validation error | Cek schema |
| P2008 | Query parsing failed | Cek query syntax |
| P2009 | Query validation failed | Cek query |
| P2010 | Raw query failed | Cek SQL syntax |
| P2011 | Null constraint | Required field kosong |
| P2012 | Missing value | Value tidak diisi |
| P2013 | Required relation | Relasi tidak ada |
| P2014 | Change would violate | Constraint violation |
| P2015 | Record not found | Data tidak ada |
| P2016 | Interpretation error | Error internal |
| P2017 | Relation error | Relasi salah |
| P2018 | Record needed | Record diperlukan |
| P2019 | Input error | Input salah |
| P2021 | Table not found | Table tidak ada |
| P2022 | Column not found | Column tidak ada |
| P2023 | Inconsistent data | Data tidak konsisten |
| P2024 | Connection pool exhausted | Terlalu banyak koneksi |
| P2025 | Record not found | Data tidak ditemukan |

---

## 8. Kontak Support

### 8.1 Informasi Support

**Email Support**
- Email: support@baberv3.com
- Respon time: 24-48 jam kerja

**WhatsApp Support**
- WhatsApp: +62 812-3456-7890
- Jam: Senin - Jumat, 09:00 - 17:00 WIB

**Telepon Support**
- Telepon: +62 21-1234-5678
- Jam: Senin - Jumat, 09:00 - 17:00 WIB

**Documentation**
- Online: https://docs.baberv3.com
- GitHub: https://github.com/username/baberv3

### 8.2 Paket Support

| Paket | Respon Time | Availability | Fitur |
|-------|-------------|---------------|-------|
| **Community** | 48-72 jam | Email only | Forum support |
| **Basic** | 24-48 jam | Email + WhatsApp | Basic troubleshooting |
| **Premium** | 4-8 jam | Email + WhatsApp + Telepon | Priority support, remote assistance |
| **Enterprise** | 1-2 jam | All channels + Dedicated support | SLA guarantee, on-site support |

### 8.3 Cara Melaporkan Issue

#### Via Email
1. Kirim email ke support@baberv3.com
2. Subject: [ISSUE] Deskripsi singkat masalah
3. Isi email:
   - Versi aplikasi
   - Screenshot/error message
   - Langkah reproduksi
   - Environment (OS, browser, dll)

#### Via GitHub Issues
1. Buka https://github.com/username/baberv3/issues
2. Klik "New Issue"
3. Pilih template issue
4. Isi detail masalah
5. Submit issue

#### Via Form Support
1. Login ke aplikasi
2. Buka menu Help → Support
3. Isi form support
4. Submit ticket

### 8.4 Informasi yang Diperlukan Saat Melaporkan Issue

Untuk mempercepat penyelesaian issue, siapkan informasi berikut:

1. **Environment Info**
   - OS dan versi
   - Versi Node.js
   - Versi PostgreSQL
   - Browser dan versi

2. **Application Info**
   - Versi aplikasi (cek package.json)
   - Error log (pm2 logs)

3. **Issue Details**
   - Screenshot error
   - Langkah reproduksi
   - Expected behavior vs actual behavior

4. **Additional Info**
   - Apakah ada perubahan konfigurasi
   - Kapan issue mulai terjadi
   - Apakah error reproducible

---

## 9. Appendix

### 9.1 Konfigurasi Tambahan

#### Environment Variables Lengkap

```env
# === DATABASE ===
DATABASE_URL="postgresql://user:password@host:port/database"

# === NEXTAUTH ===
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-key-32-chars"

# === APPLICATION ===
NODE_ENV="development" # or "production"
APP_NAME="Barber Management System"
APP_URL="http://localhost:3000"

# === EMAIL ===
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"

# === REDIS (Opsional) ===
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# === PAYMENT GATEWAY (Opsional) ===
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"

# === WHATSAPP (Opsional) ===
WHATSAPP_API_URL="your-wa-gateway-url"
WHATSAPP_API_KEY="your-wa-api-key"
```

### 9.2 Useful Commands

```bash
# === Development ===
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# === Database ===
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to DB (dev)
npm run db:migrate       # Create and run migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# === PM2 ===
pm2 start ecosystem.config.js    # Start app
pm2 stop baberv3                # Stop app
pm2 restart baberv3             # Restart app
pm2 logs baberv3                # View logs
pm2 monit                       # Monitor
pm2 delete baberv3              # Remove app
pm2 save                        # Save config
pm2 startup                      # Setup startup script

# === Database Backup ===
pg_dump -U baberv3_user baberv3_db > backup.sql
psql -U baberv3_user baberv3_db < backup.sql

# === System ===
sudo systemctl restart nginx    # Restart Nginx
sudo systemctl restart postgresql # Restart PostgreSQL
sudo nginx -t                   # Test Nginx config
```

### 9.3 Default Credentials

**Akun Default (Setelah Seed):**
- Username: `admin`
- Password: `admin123`
- Role: Owner

**⚠️ PENTING:** Ganti password default setelah login pertama!

### 9.4 File Structure

```
baberv3/
├── app/                    # Next.js App Router
│   ├── (owner)/           # Owner-only routes
│   │   ├── dashboard/     # Dashboard
│   │   ├── transactions/  # Manajemen transaksi
│   │   ├── barbers/       # Manajemen barber
│   │   ├── inventory/     # Manajemen produk
│   │   ├── cashflow/      # Manajemen keuangan
│   │   ├── salaries/      # Manajemen gaji
│   │   ├── attendance/    # Manajemen absensi
│   │   └── settings/      # Pengaturan
│   ├── (cashier)/         # Cashier-only routes
│   │   └── pos/           # Point of Sale
│   ├── login/             # Halaman login
│   ├── api/               # API Routes
│   └── layout.tsx         # Root layout
├── components/            # React Components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed
├── public/               # Static assets
│   └── images/           # Images
├── .env.example          # Environment template
├── .env                  # Environment config (create this)
├── next.config.js        # Next.js config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
└── ecosystem.config.js   # PM2 config (for production)
```

### 9.5 Troubleshooting Checklist

Sebelum melaporkan issue, cek checklist ini:

- [ ] Node.js versi minimal 20.0.0
- [ ] PostgreSQL berjalan dan dapat diakses
- [ ] File .env sudah dikonfigurasi dengan benar
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] Database sudah di-setup (`npm run db:push`)
- [ ] Permissions folder sudah benar
- [ ] Port 3000 tidak di-block firewall
- [ ] Nginx sudah dikonfigurasi (untuk production)
- [ ] Prisma Client sudah di-generate
- [ ] Aplikasi sudah di-build (`npm run build`)

---

## 10. Change Log

### Version 1.0.0 (Initial Release)
- Core features: POS, Barber Management, Transactions
- Inventory Management
- Cashflow Management
- Salary Management
- Attendance System
- Basic Reports

---

**📄 Dokumen ini diperbarui terakhir: 2 Januari 2026**

**📧 Untuk pertanyaan lebih lanjut, hubungi support@baberv3.com**

---

*Copyright © 2026 Barber Management System. All rights reserved.*
