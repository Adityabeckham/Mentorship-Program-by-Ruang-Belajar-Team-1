# EventHub-Kampus-Kanban-FULL (1)

# EventHub Kampus - Kanban Task Management (Updated v2: Role Panitia & Verifikasi Admin)

> Dokumen ini diperbarui berdasarkan revisi spesifikasi arsitektur **EventHub-Kampus-ERD-API-Contract-v2.md** (Sprint 2 - Revisi Role Panitia & Verifikasi Event).

## Ringkasan Proyek

**Project:** EventHub Kampus

Platform manajemen event kampus yang mendukung 3 tingkatan role pengguna:
1. **Mahasiswa:** Eksplorasi event publik (`published`), pendaftaran peserta, dan melihat riwayat pendaftaran.
2. **Panitia (1 akun per organisasi BEM/UKM/Himpunan):** Pengelolaan event miliknya (status `draft`), pengajuan verifikasi ke admin (`pending_verification`), melihat daftar peserta, dan penandaan kehadiran (`attendance`).
3. **Admin (Platform-wide):** Verifikasi & persetujuan event dari panitia (`published`/`rejected`), pemantauan statistik platform global, dan pembuatan/manajemen akun panitia.

---

# Ringkasan Tim

|Nama|Role|Kehadiran|Jumlah Task|
|---|---|---|---|
|Salsa|Backend Developer|Hadir|15|
|Hazril|Backend Developer|Tidak Hadir|11|
|Ahmad|Full Stack Developer|Tidak Hadir|9|
|Reza|UI/UX Designer|Hadir|3|
|Afra|Frontend Developer|Hadir|7|
|Amirrul|Frontend Developer|Hadir|7|
|Asad|Frontend Developer|Hadir|6|
|Aditya|Team Lead|Hadir|7|
|Tim|Semua Anggota|Hadir|2|

---

# Kanban Task Board Lengkap

|No|Sprint|Fase|Task|Role|Assignee|Priority|Status|
|---|---|---|---|---|---|---|---|
|1|Sprint 1|Planning|Brainstorming ide & MVP scope|Team Lead|Aditya|High|Done|
|2|Sprint 1|Planning|Menentukan role & pembagian anggota|Team Lead|Aditya|High|Done|
|3|Sprint 1|Planning|Setup GitHub Repository & Project Board|Team Lead|Aditya|High|Done|
|4|Sprint 1|Planning|Setup Lark Workspace|Team Lead|Aditya|High|Done|
|5|Sprint 2|Analysis & Design|Finalisasi PRD & Functional Requirement|Team Lead|Aditya|High|Done|
|6|Sprint 2|Analysis & Design|ERD Supabase (Users 3-Roles, Events Status Flow, Registrations, Attendance)|Backend|Salsa|High|Backlog|
|7|Sprint 2|Analysis & Design|API Contract Modul Auth & Kelola Akun Panitia (Admin)|Backend|Salsa|High|Backlog|
|8|Sprint 2|Analysis & Design|API Contract Modul Event (Panitia CRUD & Admin Verifikasi)|Backend|Hazril|High|Backlog|
|9|Sprint 2|Analysis & Design|API Contract Registrasi, Kehadiran & Stats Dashboard (Panitia & Admin)|Full Stack|Ahmad|Medium|Backlog|
|10|Sprint 2|Analysis & Design|Wireframe UI Auth & Event Catalog (Mahasiswa)|UI/UX|Reza|High|Backlog|
|11|Sprint 2|Analysis & Design|Wireframe UI Dashboard Panitia & Form Event Submission|UI/UX|Reza|High|Backlog|
|12|Sprint 2|Analysis & Design|Wireframe UI Dashboard Admin, Verifikasi Event & Kelola Akun Panitia|UI/UX|Reza|High|Backlog|
|13|Sprint 2|Analysis & Design|Boilerplate Frontend React + Tailwind|Frontend|Afra|Medium|Backlog|
|14|Sprint 2|Analysis & Design|Setup Router, Layout & Theme Provider FE|Frontend|Amirrul|Medium|Backlog|
|15|Sprint 2|Analysis & Design|Setup Global State & API Service Base|Frontend|Asad|Medium|Backlog|
|16|Sprint 2|Analysis & Design|Boilerplate Backend Express.js & Middleware Core|Backend|Salsa|Medium|Backlog|
|17|Sprint 3|Core Dev I|Setup Database Supabase & Migration Schema (v2 Roles & Enums)|Backend|Salsa|High|Backlog|
|18|Sprint 3|Core Dev I|Setup RLS Policy Supabase (Users, Events, Registrations, Attendance)|Backend|Salsa|High|Backlog|
|19|Sprint 3|Core Dev I|Endpoint Register Mahasiswa & Login JWT (All Roles)|Backend|Salsa|High|Backlog|
|20|Sprint 3|Core Dev I|Endpoint GET /auth/me & Role Guard Middleware|Backend|Hazril|High|Backlog|
|21|Sprint 3|Core Dev I|Setup Rate Limiting & Security Headers Auth|Backend|Hazril|Medium|Backlog|
|22|Sprint 3|Core Dev I|UI Login & Register Mahasiswa + Integrasi API Auth|Frontend|Afra|High|Backlog|
|23|Sprint 3|Core Dev I|Setup Protected Route & Role-based Guard FE|Frontend|Amirrul|Medium|Backlog|
|24|Sprint 3|Core Dev I|Axios Interceptor & Token Refresh Service FE|Frontend|Asad|Medium|Backlog|
|25|Sprint 3|Core Dev I|Testing Endpoint Auth & Security Review Auth|Full Stack|Ahmad|Medium|Backlog|
|26|Sprint 3|Core Dev I|Code Review Backend Sprint 3|Full Stack|Ahmad|Medium|Backlog|
|27|Sprint 4|Core Dev II|Endpoint Public Events (GET /events, GET /events/:id - Only Published)|Backend|Hazril|High|Backlog|
|28|Sprint 4|Core Dev II|Endpoint Registrasi Peserta & GET /registrations/me|Backend|Salsa|High|Backlog|
|29|Sprint 4|Core Dev II|Endpoint CRUD Event Panitia (POST draft, PUT edit, DELETE soft delete)|Backend|Hazril|High|Backlog|
|30|Sprint 4|Core Dev II|Endpoint Submit Event Panitia (PATCH /events/:id/submit -> pending_verification)|Backend|Hazril|High|Backlog|
|31|Sprint 4|Core Dev II|Endpoint GET /admin/events (Scope Panitia Dashboard)|Backend|Salsa|Medium|Backlog|
|32|Sprint 4|Core Dev II|Endpoint Stats Dashboard Panitia (GET /panitia/dashboard/stats)|Backend|Salsa|Medium|Backlog|
|33|Sprint 4|Core Dev II|UI Katalog & Detail Event (Mahasiswa)|Frontend|Amirrul|High|Backlog|
|34|Sprint 4|Core Dev II|UI Registrasi Event & Riwayat Pendaftaran (Mahasiswa)|Frontend|Amirrul|High|Backlog|
|35|Sprint 4|Core Dev II|UI Dashboard Panitia (Statistik & List Event)|Frontend|Asad|High|Backlog|
|36|Sprint 4|Core Dev II|UI Form Buat & Edit Event (Panitia)|Frontend|Asad|High|Backlog|
|37|Sprint 4|Core Dev II|Code Review & Merge PR Sprint 4|Full Stack|Ahmad|Medium|Backlog|
|38|Sprint 4|Core Dev II|Daily Progress Sync FE-BE Sprint 4|Full Stack|Ahmad|Low|Backlog|
|39|Sprint 5|Core Dev III|Endpoint Admin Verifikasi Event (GET /admin/events & PATCH /admin/events/:id/verify)|Backend|Hazril|High|Backlog|
|40|Sprint 5|Core Dev III|Endpoint Admin Kelola Akun Panitia (POST/GET/PUT /admin/panitia)|Backend|Salsa|High|Backlog|
|41|Sprint 5|Core Dev III|Endpoint Stats Dashboard Admin Platform (GET /admin/dashboard/stats)|Backend|Salsa|High|Backlog|
|42|Sprint 5|Core Dev III|Endpoint Kehadiran Peserta (GET /events/:id/participants & PATCH /attendance/:registration_id)|Full Stack|Ahmad|High|Backlog|
|43|Sprint 5|Core Dev III|UI Dashboard Admin Platform & Stats Global|Frontend|Afra|High|Backlog|
|44|Sprint 5|Core Dev III|UI Verifikasi Event Admin (Review, Approve, Reject + Reason Modal)|Frontend|Afra|High|Backlog|
|45|Sprint 5|Core Dev III|UI Manajemen Akun Panitia Admin (Form Tambah Akun Panitia & List Orgas)|Frontend|Afra|High|Backlog|
|46|Sprint 5|Core Dev III|UI Marking Kehadiran Peserta & Table Peserta (Panitia)|Frontend|Asad|High|Backlog|
|47|Sprint 5|Core Dev III|Validasi Input FE (Sanitasi Rejection Reason, Form Validations)|Frontend|Amirrul|Medium|Backlog|
|48|Sprint 5|Core Dev III|Validasi Input BE & Sanitasi Input (HTML/Script Tag Removal)|Backend|Salsa|Medium|Backlog|
|49|Sprint 5|Core Dev III|Ownership Check Event & Attendance Security Validation|Backend|Hazril|High|Backlog|
|50|Sprint 5|Core Dev III|Transaction Lock Kuota Registrasi Event|Backend|Salsa|High|Backlog|
|51|Sprint 5|Core Dev III|Optimasi Query Database Indexing (idx_events_status_date, idx_registrations_event_id)|Backend|Hazril|Low|Backlog|
|52|Sprint 5|Core Dev III|Optimasi & Cleanup State FE|Frontend|Amirrul|Low|Backlog|
|53|Sprint 6|Testing|Integration Testing FE-BE (Mahasiswa -> Panitia -> Admin Flow)|Full Stack|Ahmad|High|Backlog|
|54|Sprint 6|Testing|End-to-End Testing (Role-based access & verification workflow)|Frontend|Asad|High|Backlog|
|55|Sprint 6|Testing|Bug Fixing Frontend|Frontend|Afra|High|Backlog|
|56|Sprint 6|Testing|Bug Fixing Backend|Backend|Salsa|High|Backlog|
|57|Sprint 6|Testing|Performance Optimization Backend|Backend|Hazril|Medium|Backlog|
|58|Sprint 6|Testing|Security Review Checklist (Endpoint Guard Admin/Panitia, Status Transition Check)|Full Stack|Ahmad|High|Backlog|
|59|Sprint 7|Deployment|Deploy Backend Railway/Render & Environment Config|Backend|Salsa|High|Backlog|
|60|Sprint 7|Deployment|Deploy Frontend Vercel/Netlify & Domain Setup|Frontend|Afra|High|Backlog|
|61|Sprint 7|Deployment|Setup Production Supabase RLS & Environment Variables|Backend|Hazril|High|Backlog|
|62|Sprint 7|Deployment|README & Dokumentasi Teknis API Contract v2 Update|Full Stack|Ahmad|Medium|Backlog|
|63|Sprint 7|Deployment|Smoke Test Production All Roles|Frontend|Amirrul|Medium|Backlog|
|64|Sprint 7|Deployment|npm audit & Dependency Security Check|Backend|Salsa|Medium|Backlog|
|65|Sprint 8|Release|Materi Demo Day & Slide Presentasi|Team Lead|Tim|High|Backlog|
|66|Sprint 8|Release|Rehearsal Demo (Simulasi Workflow Mahasiswa, Panitia, Admin)|Semua Anggota|Tim|High|Backlog|
|67|Sprint 8|Release|Evaluasi Tim & Retrospective Sprint|Team Lead|Aditya|Medium|Backlog|

---

# SOP Workflow

## Coding Task

1. Ambil task dari GitHub Project.
2. Assign ke diri sendiri.
3. Create branch.
4. Pindahkan ke In Progress.
5. Development.
6. Push branch.
7. Buat Pull Request.
8. Review.
9. Merge.
10. Done.

```Bash
git checkout main
git pull origin main

git fetch origin
git checkout nama-branch

git add .
git commit -m "feat: add feature"
git push origin nama-branch
```

## Design Task

- Dikerjakan di Figma.
- Update status melalui Lark.
- Review melalui komentar Figma.
- Approve → Done.

## Non-Teknis

- Dikerjakan di Lark Docs / Google Docs.
- Review oleh Team Lead.
- Untuk README, ERD, API Contract final tetap dibuat PR ke repository.

---

# Tech Stack

## Frontend

- React
- Tailwind CSS
- React Router
- Axios / Fetch

## Backend

- Express.js
- JWT
- bcrypt
- dotenv
- cors

## Database

- Supabase (PostgreSQL with Row Level Security - RLS)

## Deployment

- Railway / Render
- Vercel / Netlify

---

# Status Project

✅ Sprint 1 selesai
✅ Finalisasi PRD & ERD/API Contract v2 selesai
⏳ Sprint 2 sedang berjalan (Analysis & Design v2)
🎯 Target akhir: Demo Day Sprint 8
