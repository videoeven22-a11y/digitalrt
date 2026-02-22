# 📋 SmartWarga AppSheet - Template & Panduan

## 🗂️ STRUKTUR GOOGLE SHEETS

Buat Google Spreadsheet baru dengan nama "SmartWarga RT 03" dan tab berikut:

---

### TAB 1: Data Warga
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| ID | Text | Auto-generate: CONCATENATE("WG-", ROW()) |
| NIK | Text | 16 digit |
| NoKK | Text | Nomor Kartu Keluarga |
| Nama | Text | Nama lengkap |
| TempatLahir | Text | Tempat lahir |
| TanggalLahir | Date | Format: YYYY-MM-DD |
| JenisKelamin | Enum | Laki-laki, Perempuan |
| Agama | Enum | Islam, Kristen, Katolik, Hindu, Buddha, Konghucu |
| Pekerjaan | Text | Pekerjaan |
| GolonganDarah | Enum | A, B, AB, O, - |
| StatusPerkawinan | Enum | Belum Kawin, Kawin, Cerai Hidup, Cerai Mati |
| Provinsi | Text | |
| Kabupaten | Text | |
| Kecamatan | Text | |
| Kelurahan | Text | |
| Alamat | Text | Alamat lengkap |
| RT | Text | 003 |
| RW | Text | 002 |
| StatusWarga | Enum | AKTIF, PINDAH, MENINGGAL |
| TanggalStatus | Date | Tanggal pindah/meninggal |
| KeteranganStatus | Text | Keterangan tambahan |
| TanggalDaftar | DateTime | NOW() |
| UpdatedAt | DateTime | NOW() |

---

### TAB 2: Pengajuan Surat
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| ID | Text | Auto: CONCATENATE("REQ-", TEXT(NOW(), "YYYYMMDD"), "-", ROW()) |
| NIK | Ref | Reference ke Data Warga |
| NamaPemohon | Text | Auto dari reference |
| JenisSurat | Enum | SKTM, Domisili, Pengantar, Kematian, Nikah, Pindah, Usaha |
| Keperluan | LongText | |
| Status | Enum | Menunggu, Diproses, Selesai, Ditolak |
| TanggalPengajuan | DateTime | NOW() |
| TanggalSelesai | Date | |
| Catatan | Text | Catatan admin |

---

### TAB 3: Detail Surat Kematian
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| ID | Text | |
| RequestID | Ref | Reference ke Pengajuan Surat |
| NIKAlmarhum | Ref | Reference ke Data Warga |
| NamaAlmarhum | Text | |
| TanggalKematian | Date | |
| Hari | Text | Auto dari TanggalKematian |
| Pasaran | Text | Auto kalkulasi |
| WaktuKematian | Time | |
| TempatKematian | Text | |
| TempatPemakaman | Text | |
| PenyebabKematian | Text | |

---

### TAB 4: Detail Surat Pindah
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| ID | Text | |
| RequestID | Ref | |
| NIK | Ref | |
| AlamatAsal | Text | |
| RTAsal | Text | |
| RWAsal | Text | |
| KelurahanAsal | Text | |
| KecamatanAsal | Text | |
| KabupatenAsal | Text | |
| ProvinsiAsal | Text | |
| AlamatTujuan | Text | |
| RTTujuan | Text | |
| RWTujuan | Text | |
| KelurahanTujuan | Text | |
| KecamatanTujuan | Text | |
| KabupatenTujuan | Text | |
| ProvinsiTujuan | Text | |
| AlasanPindah | Enum | Pekerjaan, Pendidikan, Kesehatan, Keamanan, Keluarga, Perumahan, Lainnya |
| KlasifikasiPindah | Enum | Dalam desa, Antar desa, Antar kecamatan, Antar kabupaten, Antar provinsi |
| KeluargaPindah | Text | NIK anggota keluarga yang ikut |

---

### TAB 5: RT Config
| Kolom | Tipe Data | Nilai |
|-------|-----------|-------|
| NamaRT | Text | Pak RT Budiman |
| NoHP | Text | 628123456789 |
| Email | Text | rt03@smartwarga.id |
| NamaApp | Text | SmartWarga RT 03 Kp. Jati |
| AlamatRT | Text | RT 03 / RW 02, Kelurahan Jati, Kecamatan Jatiuwung, Kota Tangerang |
| LogoURL | URL | (link logo) |

---

### TAB 6: Admin Users
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| Username | Text | |
| Password | Text | Simpan aman |
| Nama | Text | |
| Role | Enum | Super Admin, Sekretaris, Staf |
| Aktif | Yes/No | |

---

### TAB 7: Audit Log
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| Timestamp | DateTime | NOW() |
| Aksi | Text | Tambah Warga, Edit Warga, Hapus Warga, Login, dll |
| User | Text | |
| Target | Text | NIK/Nama yang diubah |
| Tipe | Enum | CREATE, UPDATE, DELETE, LOGIN |

---

## 🎯 FORMULA PENTING

### Auto-generate ID Warga (Kolom A):
```
=ARRAYFORMULA(IF(B2:B<>"", "WG-"&TEXT(ROW(B2:B)-1,"000"), ""))
```

### Auto-fill Hari dari Tanggal Kematian:
```
=TEXT(E2, "dddd")
```
(E2 = kolom TanggalKematian)

### Auto-fill Pasaran Jawa:
```
=INDEX({"Legi","Pahing","Pon","Wage","Kliwon"}, MOD(INT((E2-DATE(1900,1,1)))+2,5)+1)
```

### Auto-fill Tanggal Daftar:
```
=IF(B2<>"", NOW(), "")
```

---

## 📱 PANDUAN SETUP APPSHEET

### LANGKAH 1: Persiapan Spreadsheet
1. Buka Google Drive
2. Buat Google Spreadsheet baru
3. Beri nama: "SmartWarga RT 03 Database"
4. Buat semua tab sesuai struktur di atas
5. Isi sample data (2-3 baris per tab)

### LANGKAH 2: Buat Aplikasi AppSheet
1. Buka https://appsheet.com
2. Login dengan akun Google
3. Klik **"Create"** → **"App"** → **"Start with Google Sheets"**
4. Pilih spreadsheet yang sudah dibuat
5. Pilih tab "DataWarga" sebagai data utama
6. Klik **"Create App"**

### LANGKAH 3: Tambah Data Sources
Di AppSheet Editor:
1. Klik **"Data"** (panel kiri)
2. Klik **"+"** → **"Add Table"**
3. Pilih tab lain: PengajuanSurat, DetailKematian, dll
4. Ulangi untuk semua tab

### LANGKAH 4: Buat Views

#### A. View Menu Utama
- Name: `Menu Utama`
- View type: `Menu`
- Show: Semua menu utama

#### B. View Daftar Warga
- Name: `Daftar Warga`
- View type: `Gallery` atau `Table`
- Data: `DataWarga`
- Sort by: `Nama` (Ascending)
- Search: Enable
- Column order: Nama, NIK, Alamat, StatusWarga

#### C. View Detail Warga
- Name: `Detail Warga`
- View type: `Detail`
- Data: `DataWarga`
- Show all columns

#### D. View Form Tambah Warga
- Name: `Tambah Warga`
- View type: `Form`
- Data: `DataWarga`
- Hide columns: ID, TanggalDaftar, UpdatedAt (auto)

#### E. View Pengajuan Surat
- Name: `Pengajuan Surat`
- View type: `Table`
- Data: `PengajuanSurat`
- Filter: `Status = "Menunggu"`

#### F. View Form Pengajuan
- Name: `Ajukan Surat`
- View type: `Form`
- Data: `PengajuanSurat`

### LANGKAH 5: Atur Security
1. Klik **"Security"** (panel kiri)
2. Enable **"Require sign-in"**
3. Buat role: `Admin`, `User`
4. Atur permissions:
   - Admin: Full access semua tabel
   - User: Read DataWarga, Create PengajuanSurat

### LANGKAH 6: Branding
1. Klik **"Settings"** → **"App Info"**
2. App name: `SmartWarga RT 03`
3. App icon: Upload logo RT
4. Theme color: `#2563eb` (blue)
5. Launch mode: `Default`

### LANGKAH 7: Test & Deploy
1. Klik **"Test"** icon (kanan atas)
2. Test semua fitur di preview
3. Klik **"Deploy"** → **"Move to Deployed"**
4. Share link aplikasi ke warga

---

## 🔧 SCRIPTS GOOGLE APPS SCRIPT (Opsional)

Buka Extensions → Apps Script, paste kode berikut:

```javascript
// Kalkulasi Hari Pasaran Jawa
function hitungPasaran(tanggal) {
  const pasaran = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const referensi = new Date(1900, 0, 1); // 1 Jan 1900 = Pahing
  const selisih = Math.floor((tanggal - referensi) / (1000 * 60 * 60 * 24));
  const index = ((selisih % 5) + 5 + 1) % 5;
  return pasaran[index];
}

function hariPasaran(tanggal) {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hari[tanggal.getDay()];
}

// Auto-trigger saat edit
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Jika edit di kolom TanggalKematian (E) di sheet DetailKematian
  if (sheet.getName() === "DetailKematian" && range.getColumn() === 5) {
    const tanggal = range.getValue();
    if (tanggal instanceof Date) {
      const row = range.getRow();
      sheet.getRange(row, 6).setValue(hariPasaran(tanggal)); // Hari
      sheet.getRange(row, 7).setValue(hitungPasaran(tanggal)); // Pasaran
    }
  }
}
```

---

## 📊 SAMPLE DATA UNTUK TESTING

### Data Warga (2 sample):
```
WG-001 | 3601234567890001 | 3601234567890001 | Ahmad Budiman | Tangerang | 1985-05-15 | Laki-laki | Islam | Wiraswasta | A | Kawin | Banten | Kota Tangerang | Jatiuwung | Jati | Jl. Mawar No. 5 | 003 | 002 | AKTIF | | | 2024-01-15 08:00:00 | 2024-01-15 08:00:00
WG-002 | 3601234567890002 | 3601234567890001 | Siti Aminah | Tangerang | 1988-08-20 | Perempuan | Islam | Ibu Rumah Tangga | B | Kawin | Banten | Kota Tangerang | Jatiuwung | Jati | Jl. Mawar No. 5 | 003 | 002 | AKTIF | | | 2024-01-15 08:00:00 | 2024-01-15 08:00:00
```

### Admin Users:
```
admin | admin123 | Pak RT | Super Admin | TRUE
sekretaris | sekretaris123 | Bu Ani | Sekretaris | TRUE
```

---

## ✅ CHECKLIST SEBELUM DEPLOY

- [ ] Semua tab sudah dibuat di Google Sheets
- [ ] Sample data sudah diisi
- [ ] Formula sudah berfungsi
- [ ] AppSheet sudah connect ke semua tab
- [ ] Semua views sudah dikonfigurasi
- [ ] Security sudah diatur
- [ ] Branding sudah disesuaikan
- [ ] Test semua fitur
- [ ] Deploy aplikasi

---

## 🔗 LINK TERKAIT

- AppSheet: https://appsheet.com
- Dokumentasi: https://help.appsheet.com
- Tutorial Video: https://www.youtube.com/results?search_query=appsheet+tutorial
