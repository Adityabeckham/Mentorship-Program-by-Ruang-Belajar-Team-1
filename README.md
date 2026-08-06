# 🎓 EventHub Kampus — Platform Terintegrasi Manajemen Event Kampus

[![Project Status](https://img.shields.io/badge/Project_Status-Sprint_2_Active-brightgreen.svg)](https://github.com/Adityabeckham/Mentorshi-Program-by-Ruang-Belajar-Team-1)
[![Backend](https://img.shields.io/badge/Backend-Express.js_v5-blue.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-green.svg)](https://supabase.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React.js_%2B_Tailwind_CSS-cyan.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

---

## 📌 1. Project Overview

**EventHub Kampus** adalah platform terintegrasi berbasis web yang dirancang khusus untuk menyederhanakan dan mengotomatiskan seluruh alur manajemen event di lingkungan kampus (UKM, BEM, Himpunan Mahasiswa). 

Platform ini memfasilitasi proses publikasi event resmi organisasi, pendaftaran peserta secara real-time, verifikasi event oleh admin, hingga pencatatan presensi/kehadiran peserta — menggantikan mekanisme manual berbasis Google Form dan Spreadsheet yang fragmentatif.

---

## 💥 2. Problem Statement (Latar Belakang Masalah - WHY)

Pengelolaan event di tingkat kampus saat ini masih menghadapi kendala operasional yang signifikan:
- 📑 **Data Tersebar & Terfragmentasi:** Penggunaan Google Form dan Spreadsheet terpisah menyebabkan data pendaftaran peserta tersebar di banyak file tanpa database terpusat.
- 📊 **Ketiadaan Dashboard Terpusat:** Panitia tidak memiliki tools real-time untuk memantau tren pendaftaran, kuota peserta, dan statistik event secara efisien.
- 📝 **Absensi Manual & Vulnerable:** Pencatatan kehadiran berbasis kertas atau checklist manual rawan *human error*, memakan waktu lama, dan sulit direkap untuk laporan pertanggungjawaban.
- 📜 **Tidak Ada Riwayat Event Terstruktur:** Kampus dan organisasi tidak memiliki sistem rekam jejak (*history record*) event yang rapi antar periode kepengurusan.

---

## 👥 3. Target User (WHO)

Aplikasi ini melayani 3 tingkatan peranan pengguna (*3-Tier User Role*):

| Role | Deskripsi & Kebutuhan Utama |
| --- | --- |
| 🎓 **Mahasiswa (Peserta)** | Mengeksplorasi katalog event publik, melihat detail acara, mendaftar event secara instan, dan memantau riwayat pendaftaran serta tiket digital. |
| 🚩 **Panitia (BEM / UKM / Himpunan)** | Mengelola event miliknya (*draft*, *edit*, *soft delete*), mengajukan verifikasi ke admin (*submit*), melihat daftar peserta terdaftar, dan melakukan marking presensi kehadiran. |
| 🛡️ **Admin (Platform-wide)** | Memiliki kontrol penuh atas platform: memverifikasi & menyetujui pengajuan event (*published* / *rejected*), mengelola akun panitia organisasi, dan memantau statistik global platform. |

---

## 💡 4. Solusi & MVP Fitur (WHAT)

EventHub Kampus menyediakan satu platform terpusat dengan sistem autentikasi aman (JWT), kontrol akses berbasis peran (RBAC), serta database relational Supabase dengan *Row Level Security (RLS)*.

### 📋 Fitur Utama (MVP Scope)

| No | Fitur | Deskripsi Singkat | Aktor Utama |
| --- | --- | --- | --- |
| 1 | **Autentikasi & Akun (Auth)** | Register mahasiswa, Login JWT untuk 3 roles, dan endpoint pembacaan profil (`/auth/me`). | All Users |
| 2 | **Katalog Event (Public Catalog)** | Listing event publik berstatus `published` dengan filter tanggal, pencarian, dan halaman detail event. | Mahasiswa |
| 3 | **Registrasi Peserta** | Pendaftaran mahasiswa ke event pilihan, validasi pencegahan pendaftaran ganda, dan halaman riwayat pendaftaran. | Mahasiswa |
| 4 | **Dashboard Panitia & Admin** | Ringkasan statistik real-time (total event, total peserta, event aktif, status pengajuan verifikasi). | Panitia & Admin |
| 5 | **Kelola Event (CRUD & Verifikasi)** | Panitia dapat membuat *draft* event & mengajukan verifikasi; Admin dapat melakukan peninjauan, persetujuan, atau penolakan event. | Panitia & Admin |
| 6 | **Pencatatan Kehadiran (Attendance)** | Tabel presensi peserta per event dengan fitur toggle status kehadiran (*attended* / *absent*) secara real-time. | Panitia |

### 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios, Zustand/Context API
- **Backend:** Node.js, Express.js (v5), JWT, bcryptjs, express-validator
- **Database:** Supabase (PostgreSQL with Row Level Security - RLS)
- **Deployment:** Railway / Render (Backend), Vercel / Netlify (Frontend)

---

## 🛠️ 5. Cara Menjalankan Project (Local Development)

### 📋 Prasyarat Sistem
- **Node.js**: v18.0.0 atau versi terbaru
- **npm**: v9.0.0 atau versi terbaru
- **Git**: v2.x

### 📥 1. Clone Repository
```bash
git clone https://github.com/Adityabeckham/Mentorshi-Program-by-Ruang-Belajar-Team-1.git
cd Mentorship-Program-by-Ruang-Belajar-Team-1
```

### ⚙️ 2. Setup Backend Server
```bash
# Masuk ke direktori backend
cd backend

# Install dependensi backend
npm install

# Buat file lingkungan (.env) di dalam folder backend
# Salin konfigurasi berikut ke file backend/.env:
```

Contoh variabel lingkungan di `backend/.env`:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=supersecretjwtkey123
```

### 🚀 3. Jalankan Server Backend
```bash
# Menjalankan backend dengan Nodemon (Development Mode)
npm run dev

# Atau menjalankan mode produksi
npm start
```
*Server Backend akan berjalan di:* `http://localhost:5000/api/v1`

#### 🧪 Uji Coba Health Check Endpoint:
Akses melalui browser atau Postman: `GET http://localhost:5000/api/v1/health`

Response:
```json
{
  "status": "success",
  "message": "Backend EventHub Kampus API siap digunakan!",
  "timestamp": "2026-08-06T12:00:00.000Z"
}
```

---

## 👥 6. Tabel Seluruh Anggota Tim 1 (Mentorship Program)

| Nama Lengkap | GitHub Username | Role | Kontribusi / Scope Task |
| --- | --- | --- | --- |
| **Aditya Beckham** | [`@Adityabeckham`](https://github.com/Adityabeckham) | **Team Lead** | Project Management, Sprint Planning, PRD & Requirements |
| **Salsa Nur Maulani** | [`@salsanrm`](https://github.com/salsanrm) | **Backend Developer** | Boilerplate Express.js, Schema Migration, RLS, Auth API & Admin API |
| **Mohdhazril** | [`@mohdhazril6168-design`](https://github.com/mohdhazril6168-design) | **Backend Developer** | Event CRUD API, Rate Limiting, Verification API & Security |
| **Ahmad Kurnia** | [`@AhmadKurnia13`](https://github.com/AhmadKurnia13) | **Full Stack Developer** | Attendance API, Integration Testing, Code Review & Docs |
| **Afra Awwalun Naima** | [`@Afrawwalun`](https://github.com/Afrawwalun) | **Frontend Developer** | Boilerplate React + Tailwind, UI Login/Register, Dashboard Admin |
| **Amirrul Salam** | [`@Amirrul24`](https://github.com/Amirrul24) | **Frontend Developer** | Setup Router & Theme, UI Event Catalog, Form Validation FE |
| **As'ad Miftahul Haq** | [`@asadmh59`](https://github.com/asadmh59) | **Frontend Developer** | Global State, Axios Interceptors, Dashboard Panitia & Attendance UI |
| **Zaa (Reza)** | [`@Muhammad-Reza351119`](https://github.com/Muhammad-Reza351119) | **UI/UX Designer** | Wireframe Figma UI Auth, Catalog, Dashboard Panitia & Admin |
| **Yuda Aditya** | [`@yudaadiitya`](https://github.com/yudaadiitya) | **Delivery Manager at Talentyica** | Mentor |

---

## 📄 Dokumentasi Terkait
- 📘 [Product Requirement Document (PRD)](docs_project/EventHub%20Kampus%20-%20PRD.md)
- 📐 [ERD & API Contract v2 Specification](docs_project/EventHub-Kampus-ERD-API-Contract-v2.md)
- 📊 [Kanban Task Board & Team Breakdown](docs_project/EventHub-Kampus-Kanban-FULL%20%281%29.md)
- 🤝 [Panduan Kontribusi (CONTRIBUTING.md)](docs_project/Contributing.md)
