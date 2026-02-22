# 🚀 SmartWarga dengan Railway - Panduan Deploy

## Kenapa Railway?

| Fitur | Railway | Render | Vercel |
|-------|---------|--------|--------|
| SQLite Persisten | ✅ | ✅ | ❌ |
| Setup Mudah | ✅ Auto-detect | ⚠️ Manual | ✅ Auto-detect |
| Cold Start | ❌ Tidak ada | ⚠️ Ada (30-60s) | ❌ Tidak ada |
| Gratis | $5/bulan | Ya | Ya |
| Performa | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Kesimpulan**: Railway paling mudah untuk SmartWarga karena auto-detect dan SQLite langsung bekerja!

---

## 📋 LANGKAH DEPLOY KE RAILWAY

### LANGKAH 1: Buat Akun Railway
1. Buka **https://railway.app**
2. Klik **"Start a New Project"**
3. Pilih **"Login with GitHub"**
4. Authorize Railway untuk akses GitHub Anda

### LANGKAH 2: Deploy dari GitHub
1. Setelah login, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Cari dan pilih repository: `smartwarga-rt03`
4. Klik **"Deploy Now"**

Railway akan otomatis:
- ✅ Detect Next.js
- ✅ Setup environment
- ✅ Install dependencies
- ✅ Build aplikasi
- ✅ Setup database SQLite

### LANGKAH 3: Tunggu Build
Build akan memakan waktu 2-5 menit. Anda bisa melihat progress di:
- **Deploy Logs** - proses build
- **Build Logs** - detail teknis

### LANGKAH 4: Dapatkan URL
Setelah deploy selesai:
1. Klik **"Settings"** di panel atas
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. URL akan muncul seperti: `smartwarga-rt03-production-abc123.up.railway.app`

### LANGKAH 5: Login
Buka URL dan login dengan:
- **Username**: `admin`
- **Password**: `admin123`

---

## ⚙️ KONFIGURASI TAMBAHAN (Opsional)

### Environment Variables
Di Railway dashboard, klik **"Variables"** tab:

| Variable | Value | Keterangan |
|----------|-------|------------|
| NODE_ENV | production | Production mode |

### Custom Domain
1. Klik **"Settings"** → **"Domains"**
2. Klik **"Add Custom Domain"**
3. Masukkan domain Anda (contoh: `rt03.yourdomain.com`)
4. Update DNS sesuai instruksi Railway

---

## 💰 BIAYA

### Free Tier (Hobby)
- **$5 credit/bulan** gratis
- Cukup untuk aplikasi kecil seperti SmartWarga
- No credit card required

### Pro Tier ($20/bulan)
- More resources
- Better support
- Custom domains

---

## 🔧 TROUBLESHOOTING

### Build Failed
1. Cek build logs untuk error
2. Pastikan `package.json` valid
3. Cek syntax error di kode

### Database Error
1. Railway membuat SQLite baru setiap deploy
2. Data akan tetap ada selama volume tidak dihapus
3. Backup data secara berkala

### App Not Loading
1. Cek deploy logs
2. Pastikan port benar (Railway auto-assign)
3. Cek environment variables

---

## 📱 MONITORING

### View Logs
1. Buka project di Railway
2. Klik **"Deployments"**
3. Pilih deployment
4. Klik **"Logs"**

### Metrics
1. Klik **"Metrics"** tab
2. Lihat CPU, Memory, Network usage

---

## 🔄 UPDATE APLIKASI

### Otomatis (Auto-Deploy)
Setiap push ke branch `master` akan otomatis trigger deploy baru:
```
git add .
git commit -m "Update fitur"
git push origin master
```

### Manual
1. Buka Railway dashboard
2. Klik **"Deployments"**
3. Klik **"Redeploy"** di deployment terbaru

---

## ✅ CHECKLIST DEPLOY

- [ ] Repository sudah di-push ke GitHub
- [ ] Akun Railway sudah dibuat
- [ ] Project sudah dibuat dari GitHub repo
- [ ] Build sudah selesai
- [ ] Domain sudah di-generate
- [ ] Login test berhasil
- [ ] Data warga bisa ditambah

---

## 🔗 LINKS

- Railway: https://railway.app
- GitHub Repo: https://github.com/videoeven22-a11y/smartwarga-rt03
- Dokumentasi Railway: https://docs.railway.app
