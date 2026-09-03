# 🚀 EventHub Kampus — Platform Terintegrasi Manajemen Event Kampus

[![Project Status](https://img.shields.io/badge/Project_Status-Sprint_7_Active-brightgreen.svg)](https://github.com/Adityabeckham/Mentorship-Program-by-Ruang-Belajar-Team-1)
[![Backend](https://img.shields.io/badge/Backend-Express.js_v5-blue.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-green.svg)](https://supabase.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vite_%2B_React.js-cyan.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

---

## 📹 Architecture & Demo Preview

https://github.com/user-attachments/assets/87e7fa19-69f9-4759-8f7c-dc94cf9b94ce

---

## 📋 1. Project Overview & Value Proposition

**EventHub Kampus** adalah platform terintegrasi berbasis web yang dirancang khusus untuk menyederhanakan dan mengotomatiskan seluruh alur manajemen event di lingkungan kampus (UKM, BEM, Himpunan Mahasiswa). 

Platform ini memfasilitasi proses publikasi event resmi organisasi, pendaftaran peserta secara real-time, verifikasi event oleh admin, hingga pencatatan presensi/kehadiran peserta — menggantikan mekanisme manual berbasis Google Form dan Spreadsheet yang fragmentatif.

---

## 🛠️ 2. Tech Stack & Dependencies

### Backend
- **Core Runtime:** Node.js (v18+) & Express.js (v5)
- **Database & Auth Storage:** Supabase PostgreSQL 15+ dengan Row Level Security (RLS)
- **Authentication & Security:** JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Input Sanitization:** `sanitize-html`
- **Testing:** Jest & Supertest

### Frontend
- **Framework & Build Tool:** React.js (v18) + Vite
- **Styling & UI:** Tailwind CSS + Lucide Icons
- **State & HTTP Client:** Axios / Fetch API

---

## 📁 3. Project Structure

```text
Mentorship-Program-by-Ruang-Belajar-Team-1/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Supabase & Environment Config
│   │   ├── controllers/    # API Request Handlers (Auth, Events, Registrations, Attendance, Admin)
│   │   ├── middlewares/    # Auth JWT, Role RBAC, Rate Limit, Input Sanitizer, Error Handler
│   │   ├── routes/         # Express Router Definitions (/api/v1)
│   │   ├── utils/          # Helper Functions & AppError Class
│   │   └── validators/     # Input Validation Schemas
│   ├── tests/              # Jest Automated Security & Integration Test Suite
│   ├── .env.example        # Environment Variables Template
│   └── server.js           # Server Entry Point & Express App Export
├── docs_project/           # Comprehensive Technical Documentation
│   ├── architecture.html                                 # Interactive Archify Diagram
│   ├── archify-visual-checks/                            # Visual Inspection Screenshots
│   ├── EventHub-Kampus-ERD-API-Contract-v2.md            # Complete API Contract v2 Specs
│   └── Security-Review-Signoff-Sprint-6.md              # Security Audit Sign-off Report
└── README.md
```

---

## ⚡ 4. Cara Menjalankan Project (Local Development)

### 4.1 Backend Setup (`backend/`)

1. **Masuk ke Direktori Backend:**
   ```bash
   cd backend
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (`backend/.env`):**
   Salin file `.env.example` atau buat file `.env` baru di direktori `backend/`:
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

4. **Jalankan Backend Server:**
   ```bash
   npm run dev
   # Atau run normal:
   npm start
   ```

5. **Jalankan Automated Security & Integration Tests:**
   ```bash
   npm test
   ```

---

## 🏛️ 5. Arsitektur Platform (ARCHITECTURE)

### 5.1 Diagram Arsitektur Interaktif (HTML)
Arsitektur lengkap EventHub Kampus digenerate dan diverifikasi menggunakan **Archify CLI**:
- 🔗 **Diagram HTML Interaktif:** [`docs_project/architecture.html`](docs_project/architecture.html)

### 5.2 Bukti Visual Check Archify (Screenshot Evidence)
Tersimpan di direktori [`docs_project/archify-visual-checks/`](docs_project/archify-visual-checks/):
- `screenshot-1024x768.png`
- `screenshot-1280x800.png`
- `screenshot-1440x900.png`
- `screenshot-1920x1080.png`

---

## 📘 6. Ringkasan API Contract v2

Seluruh endpoint backend diproteksi dengan kontrol akses 3-Tier RBAC (`mahasiswa`, `panitia`, `admin`) dan diakses melalui base URL `/api/v1`.

Dokumentasi API Contract v2 lengkap dengan contoh payload request/response dapat dibaca di:
👉 **[EventHub-Kampus-ERD-API-Contract-v2.md](docs_project/EventHub-Kampus-ERD-API-Contract-v2.md)**

---

## 🛡️ 7. Ringkasan Security Audit & Sign-off (Sprint 6)

Status Audit Keamanan: 🟢 **PASSED & APPROVED FOR DEPLOYMENT**  
Dokumen Sign-off: 👉 **[Security-Review-Signoff-Sprint-6.md](docs_project/Security-Review-Signoff-Sprint-6.md)**

| Domain Keamanan | Status | Keterangan Verifikasi |
| :--- | :---: | :--- |
| **JWT Authentication** | 🟢 PASS | Memverifikasi Bearer Token pada endpoint terproteksi. |
| **RBAC Authorization** | 🟢 PASS | Membatasi hak akses peranan (`mahasiswa`, `panitia`, `admin`). |
| **Event State Machine** | 🟢 PASS | Mencegah panitia merubah status event `published` atau melompati verifikasi admin. Terproteksi atomic update predicate. |
| **Input Sanitization** | 🟢 PASS | Membersihkan tag XSS berbahaya (`<script>`, `onerror`). |
