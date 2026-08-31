# 🎓 EventHub Kampus — Platform Terintegrasi Manajemen Event Kampus

[![Project Status](https://img.shields.io/badge/Project_Status-Sprint_7_Active-brightgreen.svg)](https://github.com/Adityabeckham/Mentorshi-Program-by-Ruang-Belajar-Team-1)
[![Backend](https://img.shields.io/badge/Backend-Express.js_v5-blue.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-green.svg)](https://supabase.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React.js_%2B_Tailwind_CSS-cyan.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)















---

<video src="https://github.com/user-attachments/assets/d0bd08cb-d39f-4ec8-87ef-af2c98448576" width="100%" controls></video>

##  1. Project Overview

**EventHub Kampus** adalah platform terintegrasi berbasis web yang dirancang khusus untuk menyederhanakan dan mengotomatiskan seluruh alur manajemen event di lingkungan kampus (UKM, BEM, Himpunan Mahasiswa). 

Platform ini memfasilitasi proses publikasi event resmi organisasi, pendaftaran peserta secara real-time, verifikasi event oleh admin, hingga pencatatan presensi/kehadiran peserta — menggantikan mekanisme manual berbasis Google Form dan Spreadsheet yang fragmentatif.

---

##  2. Problem Statement (Latar Belakang Masalah - WHY)

Pengelolaan event di tingkat kampus saat ini masih menghadapi kendala operasional yang signifikan:
- 📑 **Data Tersebar & Terfragmentasi:** Penggunaan Google Form dan Spreadsheet terpisah menyebabkan data pendaftaran peserta tersebar di banyak file tanpa database terpusat.
- 📊 **Ketiadaan Dashboard Terpusat:** Panitia tidak memiliki tools real-time untuk memantau tren pendaftaran, kuota peserta, dan statistik event secara efisien.
- 📝 **Absensi Manual & Vulnerable:** Pencatatan kehadiran berbasis kertas atau checklist manual rawan *human error*, memakan waktu lama, dan sulit direkap untuk laporan pertanggungjawaban.
- 📜 **Tidak Ada Riwayat Event Terstruktur:** Kampus dan organisasi tidak memiliki sistem rekam jejak (*history record*) event yang rapi antar periode kepengurusan.

---

##  3. Target User (WHO)

Aplikasi ini melayani 3 tingkatan peranan pengguna (*3-Tier User Role*):

| Role | Deskripsi & Kebutuhan Utama |
| --- | --- |
| 🎓 **Mahasiswa (Peserta)** | Mengeksplorasi katalog event publik, melihat detail acara, mendaftar event secara instan, dan memantau riwayat pendaftaran serta tiket digital. |
| 🚩 **Panitia (BEM / UKM / Himpunan)** | Mengelola event miliknya (*draft*, *edit*, *soft delete*), mengajukan verifikasi ke admin (*submit*), melihat daftar peserta terdaftar, dan melakukan marking presensi kehadiran. |
| 🛡️ **Admin (Platform-wide)** | Memiliki kontrol penuh atas platform: memverifikasi & menyetujui pengajuan event (*published* / *rejected*), mengelola akun panitia organisasi, dan memantau statistik global platform. |

---

##  4. Solusi & MVP Fitur (WHAT)

EventHub Kampus menyediakan satu platform terpusat dengan sistem autentikasi aman (JWT), kontrol akses berbasis peran (RBAC), serta database relational Supabase dengan *Row Level Security (RLS)*.

###  Fitur Utama (MVP Scope)

| No | Fitur | Deskripsi Singkat | Aktor Utama |
| --- | --- | --- | --- |
| 1 | **Autentikasi & Akun (Auth)** | Register mahasiswa, Login JWT untuk 3 roles, dan endpoint pembacaan profil (`/auth/me`). | All Users |
| 2 | **Katalog Event (Public Catalog)** | Listing event publik berstatus `published` dengan filter tanggal, pencarian, dan halaman detail event. | Mahasiswa |
| 3 | **Registrasi Peserta** | Pendaftaran mahasiswa ke event pilihan, validasi pencegahan pendaftaran ganda, dan halaman riwayat pendaftaran. | Mahasiswa |
| 4 | **Dashboard Panitia & Admin** | Ringkasan statistik real-time (total event, total peserta, event aktif, status pengajuan verifikasi). | Panitia & Admin |
| 5 | **Kelola Event (CRUD & Verifikasi)** | Panitia dapat membuat *draft* event & mengajukan verifikasi; Admin dapat melakukan peninjauan, persetujuan, atau penolakan event. | Panitia & Admin |
| 6 | **Pencatatan Kehadiran (Attendance)** | Tabel presensi peserta per event dengan fitur toggle status kehadiran (*attended* / *absent*) secara real-time. | Panitia |

###  Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios, Zustand/Context API
- **Backend:** Node.js, Express.js (v5), JWT, bcryptjs, express-validator
- **Database:** Supabase (PostgreSQL with Row Level Security - RLS)
- **Deployment:** Railway / Render (Backend), Vercel / Netlify (Frontend)

---

##  5. Arsitektur Platform (ARCHITECTURE)

Berikut adalah diagram arsitektur interaktif high-level untuk **EventHub Kampus** yang dikembangkan menggunakan **Archify** dan divalidasi langsung dari bukti kode sumber repositori:

###  Diagram Arsitektur Interaktif
-  **[Buka Diagram Arsitektur Interaktif (HTML)](docs_project/architecture.html)** - *Diagram SVG interaktif dengan tema Gelap/Terang, pencarian komponen, penelusuran hubungan (trace flow), dan guided views.*

###  Ringkasan Komponen Utama
- **Frontend App:** Aplikasi Single Page Application (SPA) berbasis Vite React. Menggunakan Axios client terpusat untuk komunikasi REST API ke backend.
- **Backend API Server:** Server Node.js Express melayani port `:5000` dengan perlindungan keamanan middleware (Helmet, express-rate-limit, input XSS sanitization) dan otorisasi RBAC (Mahasiswa, Panitia, Admin).
- **Authentication Service:** Modul otentikasi JWT yang memetakan Access & Refresh Tokens dengan enkripsi password menggunakan `bcryptjs`.
- **Database Layer:** PostgreSQL di-host secara aman di Supabase Cloud, terhubung langsung via Postgres Client Connection Pool serta API Client SDK.

###  Laporan Pengujian Visual & Screenshots
Hasil pengujian respon visual (*responsiveness*) diagram di berbagai ukuran layar desktop:

| Light Theme Viewport | Dark Theme Viewport |
| :---: | :---: |
| ![Light Theme (1440x900)](docs_project/archify-visual-checks/architecture.visual-check.1440x900.light.png) | ![Dark Theme (1440x900)](docs_project/archify-visual-checks/architecture.visual-check.1440x900.dark.png) |
| ![Light Theme (2048x1320)](docs_project/archify-visual-checks/architecture.visual-check.2048x1320.light.png) | ![Dark Theme (2048x1320)](docs_project/archify-visual-checks/architecture.visual-check.2048x1320.dark.png) |

*(Detail pengujian visual lengkap dapat diakses pada berkas [Laporan Visual Check](docs_project/archify-visual-checks/architecture.visual-check.html) dan data metrik [visual-check.json](docs_project/archify-visual-checks/architecture.visual-check.json)).*

---
## Security Testing (Strix AI autonomous pentesting) 
### Workflow 
<img width="2143" height="2143" alt="Flowchart" src="https://github.com/user-attachments/assets/7698fa22-459d-4c66-8c4d-5ed350d3ea4d" />

##  6. Cara Menjalankan Project (Local Development)

###  Prasyarat Sistem
- **Node.js**: v18.0.0 atau versi terbaru (direkomendasikan LTS)
- **npm**: v9.0.0 atau versi terbaru
- **Git**: v2.x

###  1. Clone Repository
```bash
git clone https://github.com/Adityabeckham/Mentorshi-Program-by-Ruang-Belajar-Team-1.git
cd Mentorship-Program-by-Ruang-Belajar-Team-1
```

### 2. Setup & Jalankan Backend Server
1. Masuk ke folder backend dan install dependensi:
```bash
cd backend
npm install
```
2. Buat file `.env` di folder `backend/` dan isi dengan konfigurasi berikut:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase Database & Auth Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.com:5432/postgres"

# JWT Secret & Token Expiration Policy
JWT_SECRET=your_super_secret_jwt_key_here_generate_with_openssl_rand_hex_64
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL Local
FRONTEND_URL=http://localhost:5173/
```
3. Jalankan backend server dalam development mode:
```bash
npm run dev
```
*Server Backend berjalan di:* `http://localhost:5000`

---

###  3. Setup & Jalankan Frontend App
1. Buka terminal baru, masuk ke folder frontend dan install dependensi:
```bash
cd frontend
npm install
```
2. Buat file `.env` di folder `frontend/` dan isi dengan konfigurasi berikut:
```env
# API Base URL for backend endpoint connection
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
3. Jalankan frontend development server:
```bash
npm run dev
```
*Aplikasi Frontend berjalan di:* `http://localhost:5173`

##  7. Tabel Seluruh Anggota Tim 1 (Mentorship Program)

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

##  Dokumentasi Terkait
- 📘 [Product Requirement Document (PRD)](docs_project/EventHub%20Kampus%20-%20PRD.md)
- 📐 [ERD & API Contract v2 Specification](docs_project/EventHub-Kampus-ERD-API-Contract-v2.md)
- 📊 [Kanban Task Board & Team Breakdown](docs_project/EventHub-Kampus-Kanban-FULL%20%281%29.md)
- 🤝 [Panduan Kontribusi (CONTRIBUTING.md)](docs_project/Contributing.md)
