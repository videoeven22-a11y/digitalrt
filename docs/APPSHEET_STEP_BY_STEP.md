# 🎯 PANDUAN LENGKAP APPSHEET - SMARTWARGA RT 03

## 📋 LANGKAH 1: Buat Google Spreadsheet

### 1.1 Buka Google Sheets
1. Kunjungi **https://sheets.google.com**
2. Klik **"+ Blank"** untuk buat spreadsheet baru
3. Beri nama: **"SmartWarga RT 03"**

### 1.2 Buat Tab 1: DataWarga
Rename "Sheet1" menjadi "DataWarga", lalu buat header di baris 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | NIK | NoKK | Nama | TempatLahir | TanggalLahir | JenisKelamin | Agama | Pekerjaan | GolonganDarah | StatusPerkawinan | Provinsi | Kabupaten | Kecamatan | Kelurahan | Alamat | RT | RW | StatusWarga | TanggalStatus | KeteranganStatus | TanggalDaftar | UpdatedAt |

### 1.3 Isi Sample Data (Baris 2-3)
```
WG-001 | 3601234567890001 | 3601234567890001 | Ahmad Budiman | Tangerang | 15/05/1985 | Laki-laki | Islam | Wiraswasta | A | Kawin | Banten | Kota Tangerang | Jatiuwung | Jati | Jl. Mawar No. 5 | 003 | 002 | AKTIF | | | 15/01/2024 | 15/01/2024
WG-002 | 3601234567890002 | 3601234567890001 | Siti Aminah | Tangerang | 20/08/1988 | Perempuan | Islam | IRT | B | Kawin | Banten | Kota Tangerang | Jatiuwung | Jati | Jl. Mawar No. 5 | 003 | 002 | AKTIF | | | 15/01/2024 | 15/01/2024
```

### 1.4 Buat Tab 2: PengajuanSurat
Klik **"+"** di pojok kiri bawah untuk buat tab baru, rename menjadi "PengajuanSurat":

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| ID | NIK | NamaPemohon | JenisSurat | Keperluan | Status | TanggalPengajuan | TanggalSelesai | Catatan |

Sample Data:
```
REQ-001 | 3601234567890001 | Ahmad Budiman | SKTM | Pengajuan KIP Kuliah anak | Menunggu | 15/01/2024 | |
```

### 1.5 Buat Tab 3: DetailKematian
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| ID | RequestID | NIKAlmarhum | NamaAlmarhum | TanggalKematian | Hari | Pasaran | WaktuKematian | TempatKematian | TempatPemakaman | PenyebabKematian |

Sample Data:
```
DK-001 | REQ-001 | 3601234567890001 | Ahmad Budiman | 15/01/2024 | Senin | Legi | 08:00 | RS Tangerang | TPU Jati | Sakit
```

### 1.6 Buat Tab 4: RTConfig
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| NamaRT | NoHP | Email | NamaApp | AlamatRT | LogoURL |

Sample Data:
```
Pak RT Budiman | 628123456789 | rt03@smartwarga.id | SmartWarga RT 03 Kp. Jati | RT 03 / RW 02, Kelurahan Jati, Kecamatan Jatiuwung, Kota Tangerang | https://upload.wikimedia.org/wikipedia/commons/b/bc/Logo_RT_RW.png
```

### 1.7 Buat Tab 5: AdminUsers
| A | B | C | D | E |
|---|---|---|---|---|
| Username | Password | Nama | Role | Aktif |

Sample Data:
```
admin | admin123 | Pak RT | Super Admin | TRUE
sekretaris | secret123 | Bu Ani | Sekretaris | TRUE
```

---

## 📱 LANGKAH 2: Buat Aplikasi AppSheet

### 2.1 Buka AppSheet
1. Kunjungi **https://appsheet.com**
2. Klik **"Sign In"** → pilih **"Sign in with Google"**
3. Gunakan akun Google yang sama dengan Google Sheets

### 2.2 Buat App Baru
1. Klik **"Create"** di pojok kiri atas
2. Pilih **"App"**
3. Pilih **"Start with Google Sheets"**
4. Pilih spreadsheet **"SmartWarga RT 03"**
5. Pilih tab **"DataWarga"**
6. Klik **"Create App"**

### 2.3 Tunggu Proses
AppSheet akan otomatis:
- Menganalisis data
- Membuat views dasar
- Mendeteksi tipe kolom

---

## ⚙️ LANGKAH 3: Tambah Data Sources Lainnya

### 3.1 Buka Data Panel
Di editor AppSheet, klik **"Data"** (icon database di panel kiri)

### 3.2 Tambah Tabel PengajuanSurat
1. Klik **"+"** di pojok kanan atas panel Data
2. Pilih **"Add Table"**
3. Pilih **"Google Sheets"**
4. Pilih tab **"PengajuanSurat"**
5. Klik **"Add Table"**

### 3.3 Ulangi untuk Tab Lainnya
Lakukan hal sama untuk:
- **DetailKematian**
- **RTConfig**
- **AdminUsers**

---

## 🎨 LANGKAH 4: Konfigurasi Views

### 4.1 Buka UX Panel
Klik **"UX"** (icon tampilan di panel kiri)

### 4.2 Atur Menu Utama
1. Klik **"Primary Menu"**
2. Akan ada beberapa view default, kita akan modifikasi

### 4.3 Buat View: Beranda (Dashboard)
1. Klik **"+"** untuk buat view baru
2. Isi:
   - **View name**: `Beranda`
   - **View type**: `Dashboard`
   - **Position**: `Top`
3. Di section "Contents", tambahkan:
   - **DataWarga_View** (Gallery)
   - **PengajuanSurat_View** (Table)

### 4.4 Buat View: Daftar Warga
1. Klik **"+"** untuk buat view baru
2. Isi:
   - **View name**: `Daftar Warga`
   - **View type**: `Gallery`
   - **Data**: `DataWarga`
   - **Sort by**: `Nama` (Ascending)
3. Di **"Column settings"**:
   - Show columns: `Nama`, `NIK`, `Alamat`, `StatusWarga`
4. Aktifkan **"Search"** dan **"Sort"**

### 4.5 Buat View: Detail Warga
1. Buat view baru:
   - **View name**: `Detail Warga`
   - **View type**: `Detail`
   - **Data**: `DataWarga`

### 4.6 Buat View: Tambah Warga (Form)
1. Buat view baru:
   - **View name**: `Tambah Warga`
   - **View type**: `Form`
   - **Data**: `DataWarga`
2. Di **"Column settings"**:
   - Hide: `ID`, `TanggalDaftar`, `UpdatedAt` (auto-generated)

### 4.7 Buat View: Pengajuan Surat
1. Buat view baru:
   - **View name**: `Pengajuan Surat`
   - **View type**: `Table`
   - **Data**: `PengajuanSurat`
   - **Sort by**: `TanggalPengajuan` (Descending)
   - **Filter**: `Status = "Menunggu"`

### 4.8 Buat View: Form Pengajuan
1. Buat view baru:
   - **View name**: `Ajukan Surat`
   - **View type**: `Form`
   - **Data**: `PengajuanSurat`
2. Di **"Column settings"**:
   - Hide: `ID`, `TanggalPengajuan`, `TanggalSelesai`
   - Set default `Status`: `Menunggu`

---

## 🔐 LANGKAH 5: Atur Security

### 5.1 Buka Security Panel
Klik **"Security"** (icon gembok di panel kiri)

### 5.2 Aktifkan Login
1. Di **"Authentication"**:
   - Ceklis **"Require sign-in"**
   - Pilih **"Google"** sebagai provider

### 5.3 Buat Roles
1. Klik **"Roles"**
2. Buat role: `Admin` dan `User`

### 5.4 Atur Permissions
Klik **"Security Filters"** untuk setiap tabel:

**DataWarga**:
```
OR(
  USERROLE() = "Admin",
  AND(
    USERROLE() = "User",
    [StatusWarga] = "AKTIF"
  )
)
```

**PengajuanSurat**:
```
OR(
  USERROLE() = "Admin",
  [NIK] = USEREMAIL()
)
```

---

## 🎯 LANGKAH 6: Atur Auto-Generate Values

### 6.1 ID Auto-Generate
Di **Data** → **DataWarga** → **Columns**:
1. Pilih kolom `ID`
2. Di **"Auto-compute"**:
   - **Initial value**: `CONCATENATE("WG-", TEXT(NOW(), "YYYYMMDDHHMMSS"))`

### 6.2 TanggalDaftar Auto-Generate
1. Pilih kolom `TanggalDaftar`
2. Di **"Auto-compute"**:
   - **Initial value**: `NOW()`

### 6.3 NamaPemohon dari NIK
Di **PengajuanSurat**:
1. Pilih kolom `NamaPemohon`
2. Di **"App formula"**:
   ```
   LOOKUP([NIK], "DataWarga", "NIK", "Nama")
   ```

---

## 🎨 LANGKAH 7: Branding

### 7.1 Buka Settings
Klik **"Settings"** (icon gear) → **"App Info"**

### 7.2 Atur Informasi App
- **App name**: `SmartWarga RT 03`
- **App ID**: `SmartWargaRT03`
- **Description**: `Sistem Administrasi RT 03 Kp. Jati`

### 7.3 Atur Tampilan
- **App icon**: Upload logo RT
- **Launch mode**: `Default`
- **Theme**: `Light` atau `Dark`

### 7.4 Warna Theme
1. Klik **"Theme"**
2. Pilih warna utama: **Blue** (#2563eb)
3. Logo: Upload logo RT

---

## 🧪 LANGKAH 8: Test Aplikasi

### 8.1 Buka Preview
1. Klik **"Test"** icon di kanan atas (icon play)
2. Aplikasi akan terbuka di preview mode

### 8.2 Test Fitur
- ✅ Tambah warga baru
- ✅ Lihat detail warga
- ✅ Ajukan surat
- ✅ Edit data
- ✅ Search/filter

### 8.3 Test di Mobile
1. Install **AppSheet** app dari Play Store / App Store
2. Login dengan akun Google sama
3. Aplikasi akan muncul di list

---

## 🚀 LANGKAH 9: Deploy

### 9.1 Deploy Aplikasi
1. Klik **"Manage"** → **"Deploy"**
2. Klik **"Move to Deployed"**
3. Konfirmasi deploy

### 9.2 Share ke Warga
Cara share:
1. Klik **"Share"** di kanan atas
2. Masukkan email warga
3. Atau copy link share

### 9.3 Akses Aplikasi
Warga bisa akses via:
- 📱 **Mobile App**: Install AppSheet app
- 💻 **Web Browser**: Link dari share

---

## 📊 BONUS: Validasi Data

### Validasi NIK (16 digit)
Di kolom NIK, tambahkan **"Valid if"**:
```
LEN([NIK]) = 16
```

### Validasi Umur (Minimal 17 tahun)
Di kolom TanggalLahir, tambahkan **"Valid if"**:
```
YEARS([TanggalLahir], TODAY()) >= 17
```

---

## 🔧 BONUS: Kalkulasi Hari Pasaran

### Tambah Virtual Column untuk Hari
1. Di **DetailKematian**, buat **Virtual Column** baru:
   - **Name**: `HariKematian`
   - **App Formula**: `TEXT([TanggalKematian], "dddd")`

### Virtual Column untuk Pasaran
1. Buat **Virtual Column** baru:
   - **Name**: `Pasaran`
   - **App Formula**:
   ```
   INDEX(
     LIST("Legi", "Pahing", "Pon", "Wage", "Kliwon"),
     MOD(
       NUMBER([TanggalKematian] - DATE("1900-01-01")) + 1,
       5
     ) + 1
   )
   ```

---

## ✅ CHECKLIST FINAL

Sebelum deploy, pastikan:

- [ ] Semua tab sudah dibuat di Google Sheets
- [ ] Sample data sudah diisi minimal 2-3 baris
- [ ] Semua tabel sudah ditambah di AppSheet
- [ ] Views sudah dikonfigurasi dengan benar
- [ ] Security sudah diaktifkan
- [ ] Auto-generate sudah diatur
- [ ] Branding sudah disesuaikan
- [ ] Testing sudah berhasil
- [ ] Aplikasi sudah di-deploy

---

## 📞 BUTUH BANTUAN?

Jika ada masalah:
1. Buka **"Monitor"** di AppSheet untuk lihat error
2. Cek **"Help"** di pojok kanan atas
3. Kunjungi: https://help.appsheet.com

---

**Selamat! Aplikasi SmartWarga RT 03 Anda sudah siap digunakan!** 🎉
