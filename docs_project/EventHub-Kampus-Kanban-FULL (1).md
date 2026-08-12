# EventHub Kampus - Kanban Task Management (Updated v2: Role Panitia & Verifikasi Admin)

> Dokumen ini diperbarui berdasarkan revisi spesifikasi arsitektur **EventHub-Kampus-ERD-API-Contract-v2.md** dan acuan Design System UI Prototype **docs_project/prototype/eventhub-kampus-prototype.html** (Corkboard & Sticky Paper Theme).

## Ringkasan Proyek

**Project:** EventHub Kampus

Platform manajemen event kampus yang mendukung 3 tingkatan role pengguna:
1. **Mahasiswa:** Eksplorasi event publik (`published`), pendaftaran peserta, dan melihat riwayat pendaftaran.
2. **Panitia (1 akun per organisasi BEM/UKM/Himpunan):** Pengelolaan event miliknya (status `draft`), pengajuan verifikasi ke admin (`pending_verification`), melihat daftar peserta, dan penandaan kehadiran (`attendance`).
3. **Admin (Platform-wide):** Verifikasi & persetujuan event dari panitia (`published`/`rejected`), pemantauan statistik platform global, dan pembuatan/manajemen akun panitia.

---

# Ringkasan Tim

|Nama Lengkap|GitHub Username|Role|Kehadiran|Jumlah Task|
|---|---|---|---|---|
|Salsa Nur Maulani|`@salsanrm`|Backend Developer|Hadir|15|
|Mohdhazril|`@mohdhazril6168-design`|Backend Developer|Tidak Hadir|11|
|Ahmad Kurnia|`@AhmadKurnia13`|Full Stack Developer|Tidak Hadir|9|
|Zaa (Reza)|`@Muhammad-Reza351119`|UI/UX Designer|Hadir|3|
|Afra Awwalun Naima|`@Afrawwalun`|Frontend Developer|Hadir|7|
|Amirrul Salam|`@Amirrul24`|Frontend Developer|Hadir|7|
|As'ad Miftahul Haq|`@asadmh59`|Frontend Developer|Hadir|6|
|Aditya Beckham|`@Adityabeckham`|Team Lead|Hadir|7|
|Yuda Aditya|`@yudaadiitya`|Full Stack Developer|Hadir|0|
|Tim (Semua Anggota)|- |Semua Anggota|Hadir|2|

---

# 🎨 Standar Design System & Acceptance Criteria Slicing UI (Corkboard Bulletin Theme)

Seluruh pengerjaan **Task Slicing UI (Frontend)** WAJIB mengikuti acuan visual dan spesifikasi **[docs_project/prototype/eventhub-kampus-prototype.html](file:///d:/Mentorshi-Program-by-Ruang-Belajar-Team-1/docs_project/prototype/eventhub-kampus-prototype.html)** dengan standar berikut:

### 📌 1. Tema Visual & Aesthetics (Corkboard & Sticky Notes)
- **Background Board:** Tekstur Papan Gabus Campus Bulletin Board (`--cork: #7a5230`, `--cork-dark: #5c3e23`, `--cork-darker: #4a331e`).
- **Sticky Paper Cards:** Kartu kertas event berwarna-warni (`--paper-yellow: #f6c945`, `--paper-coral: #ef6f4e`, `--paper-sky: #5fa8d3`, `--paper-mint: #6fbf97`, `--paper-lavender: #a78bfa`, `--paper-white: #f4ede0`).
- **Visual Accents:** Efek Pin Tekan Push-Pin (`--shadow-pin`), kemiringan kartu/rotasi halus (`rotate(-1deg)` / `rotate(1deg)`), dan bayangan karton 3D (`--shadow-card`).

### 🔤 2. Tipografi & Font Family Hierarchy
- **Header & Display Title:** Google Font `'Anton', sans-serif` (Judul retro tebal uppercase, brand tag, dan stamp status).
- **Body Text:** Google Font `'Work Sans', sans-serif` (Teks deskripsi utama dan form input).
- **Badges, Eyebrows & Code:** Google Font `'Space Mono', monospace` (Status badge, timestamp, statistik angka, dan metadata).

### 🏷️ 3. Status Stamp Badges (Retro Rubber Stamp Effect)
- **Status Event Badges:**
  - `published` ➔ **OK Green Stamp** (`--ok-green: #2f7a4f`, border tebal & font monospace tebal).
  - `pending_verification` ➔ **Warn Orange Stamp** (`--warn-orange: #d97706`).
  - `rejected` ➔ **Stamp Red Stamp** (`--stamp-red: #b5342a`).
  - `draft` ➔ **Paper Lavender / Muted Badge** (`--paper-lavender: #a78bfa`).

### 🔘 4. Button & Component System
- **Btn Primary:** Warna `--paper-yellow` (`#f6c945`) dengan 3D bottom shadow `#b8912b`.
- **Btn Navy:** Warna `--navy` (`#1e3a5f`) dengan 3D bottom shadow `#132840`.
- **Btn Danger:** Warna `--stamp-red` (`#b5342a`) dengan 3D bottom shadow `#87231c`.
- **Btn Success:** Warna `--ok-green` (`#2f7a4f`) dengan 3D bottom shadow `#1e5234`.

---

# Kanban Task Board Lengkap

|No|Sprint|Fase|Task|Role|Assignee|Priority|Status|
|---|---|---|---|---|---|---|---|
|1|Sprint 1|Planning|Brainstorming ide & MVP scope|Team Lead|Aditya (`@Adityabeckham`)|High|Done|
|2|Sprint 1|Planning|Menentukan role & pembagian anggota|Team Lead|Aditya (`@Adityabeckham`)|High|Done|
|3|Sprint 1|Planning|Setup GitHub Repository & Project Board|Team Lead|Aditya (`@Adityabeckham`)|High|Done|
|4|Sprint 1|Planning|Setup Lark Workspace|Team Lead|Aditya (`@Adityabeckham`)|High|Done|
|5|Sprint 2|Analysis & Design|Finalisasi PRD & Functional Requirement|Team Lead|Aditya (`@Adityabeckham`)|High|Done|
|6|Sprint 2|Analysis & Design|ERD Supabase (Users 3-Roles, Events Status Flow, Registrations, Attendance)|Backend|Salsa (`@salsanrm`)|High|Done|
|7|Sprint 2|Analysis & Design|API Contract Modul Auth & Kelola Akun Panitia (Admin)|Backend|Salsa (`@salsanrm`)|High|Done|
|8|Sprint 2|Analysis & Design|API Contract Modul Event (Panitia CRUD & Admin Verifikasi)|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|9|Sprint 2|Analysis & Design|API Contract Registrasi, Kehadiran & Stats Dashboard (Panitia & Admin)|Full Stack|Ahmad (`@AhmadKurnia13`)|Medium|Done|
|10|Sprint 2|Analysis & Design|Wireframe UI Auth & Event Catalog (Mahasiswa)|UI/UX|Reza (`@Muhammad-Reza351119`)|High|Done|
|11|Sprint 2|Analysis & Design|Wireframe UI Dashboard Panitia & Form Event Submission|UI/UX|Reza (`@Muhammad-Reza351119`)|High|Done|
|12|Sprint 2|Analysis & Design|Wireframe UI Dashboard Admin, Verifikasi Event & Kelola Akun Panitia|UI/UX|Reza (`@Muhammad-Reza351119`)|High|Done|
|13|Sprint 2|Analysis & Design|Boilerplate Frontend React + Tailwind|Frontend|Afra (`@Afrawwalun`)|Medium|Done|
|14|Sprint 2|Analysis & Design|Setup Router, Layout & Theme Provider FE|Frontend|Amirrul (`@Amirrul24`)|Medium|Done|
|15|Sprint 2|Analysis & Design|Setup Global State & API Service Base|Frontend|Asad (`@asadmh59`)|Medium|Done|
|16|Sprint 2|Analysis & Design|Boilerplate Backend Express.js & Middleware Core|Backend|Salsa (`@salsanrm`)|Medium|Done|
|17|Sprint 3|Core Dev I|Setup Database Supabase & Migration Schema (v2 Roles & Enums)|Backend|Salsa (`@salsanrm`)|High|Done|
|18|Sprint 3|Core Dev I|Setup RLS Policy Supabase (Users, Events, Registrations, Attendance)|Backend|Salsa (`@salsanrm`)|High|Done|
|19|Sprint 3|Core Dev I|Endpoint Register Mahasiswa & Login JWT (All Roles)|Backend|Salsa (`@salsanrm`)|High|Done|
|20|Sprint 3|Core Dev I|Endpoint GET /auth/me & Role Guard Middleware|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|21|Sprint 3|Core Dev I|Setup Rate Limiting & Security Headers Auth|Backend|Hazril (`@mohdhazril6168-design`)|Medium|Done|
|22|Sprint 3|Core Dev I|UI Login & Register Mahasiswa + Integrasi API Auth (Corkboard Prototype Aesthetic)|Frontend|Afra (`@Afrawwalun`)|High|Done|
|23|Sprint 3|Core Dev I|Setup Protected Route & Role-based Guard FE|Frontend|Amirrul (`@Amirrul24`)|Medium|Done|
|24|Sprint 3|Core Dev I|Axios Interceptor & Token Refresh Service FE|Frontend|Asad (`@asadmh59`)|Medium|Done|
|25|Sprint 3|Core Dev I|Testing Endpoint Auth & Security Review Auth|Full Stack|Ahmad (`@AhmadKurnia13`)|Medium|Done|
|26|Sprint 3|Core Dev I|Code Review Backend Sprint 3|Full Stack|Ahmad (`@AhmadKurnia13`)|Medium|Done|
|27|Sprint 4|Core Dev II|Endpoint Public Events (GET /events, GET /events/:id - Only Published)|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|28|Sprint 4|Core Dev II|Endpoint Registrasi Peserta & GET /registrations/me|Backend|Salsa (`@salsanrm`)|High|Done|
|29|Sprint 4|Core Dev II|Endpoint CRUD Event Panitia (POST draft, PUT edit, DELETE soft delete)|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|30|Sprint 4|Core Dev II|Endpoint Submit Event Panitia (PATCH /events/:id/submit -> pending_verification)|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|31|Sprint 4|Core Dev II|Endpoint GET /admin/events (Scope Panitia Dashboard)|Backend|Salsa (`@salsanrm`)|Medium|Done|
|32|Sprint 4|Core Dev II|Endpoint Stats Dashboard Panitia (GET /panitia/dashboard/stats)|Backend|Salsa (`@salsanrm`)|Medium|Done|
|33|Sprint 4|Core Dev II|UI Katalog & Detail Event (Mahasiswa) - Corkboard Prototype|Frontend|Amirrul (`@Amirrul24`)|High|In Progress|
|34|Sprint 4|Core Dev II|UI Registrasi Event & Riwayat Pendaftaran (Mahasiswa) - Corkboard Prototype|Frontend|Amirrul (`@Amirrul24`)|High|In Progress|
|35|Sprint 4|Core Dev II|UI Dashboard Panitia (Statistik & List Event) - Corkboard Prototype|Frontend|Asad (`@asadmh59`)|High|In Progress|
|36|Sprint 4|Core Dev II|UI Form Buat & Edit Event (Panitia) - Corkboard Prototype|Frontend|Asad (`@asadmh59`)|High|In Progress|
|37|Sprint 4|Core Dev II|Code Review & Merge PR Sprint 4|Full Stack|Ahmad (`@AhmadKurnia13`)|Medium|In Progress|
|38|Sprint 4|Core Dev II|Daily Progress Sync FE-BE Sprint 4|Full Stack|Ahmad (`@AhmadKurnia13`)|Low|In Progress|
|39|Sprint 5|Core Dev III|Endpoint Admin Verifikasi Event (GET /admin/events & PATCH /admin/events/:id/verify)|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|40|Sprint 5|Core Dev III|Endpoint Admin Kelola Akun Panitia (POST/GET/PUT /admin/panitia)|Backend|Salsa (`@salsanrm`)|High|Done|
|41|Sprint 5|Core Dev III|Endpoint Stats Dashboard Admin Platform (GET /admin/dashboard/stats)|Backend|Salsa (`@salsanrm`)|High|Done|
|42|Sprint 5|Core Dev III|Endpoint Kehadiran Peserta (GET /events/:id/participants & PATCH /attendance/:registration_id)|Full Stack|Ahmad (`@AhmadKurnia13`)|High|Done|
|43|Sprint 5|Core Dev III|UI Dashboard Admin Platform & Stats Global - Corkboard Prototype|Frontend|Afra (`@Afrawwalun`)|High|In Progress|
|44|Sprint 5|Core Dev III|UI Verifikasi Event Admin (Review, Approve, Reject + Reason Modal) - Corkboard Prototype|Frontend|Afra (`@Afrawwalun`)|High|In Progress|
|45|Sprint 5|Core Dev III|UI Manajemen Akun Panitia Admin (Form Tambah Akun Panitia & List Orgas) - Corkboard Prototype|Frontend|Afra (`@Afrawwalun`)|High|In Progress|
|46|Sprint 5|Core Dev III|UI Marking Kehadiran Peserta & Table Peserta (Panitia) - Corkboard Prototype|Frontend|Asad (`@asadmh59`)|High|In Progress|
|47|Sprint 5|Core Dev III|Validasi Input FE (Sanitasi Rejection Reason, Form Validations)|Frontend|Amirrul (`@Amirrul24`)|Medium|Done|
|48|Sprint 5|Core Dev III|Validasi Input BE & Sanitasi Input (HTML/Script Tag Removal)|Backend|Salsa (`@salsanrm`)|Medium|Done|
|49|Sprint 5|Core Dev III|Ownership Check Event & Attendance Security Validation|Backend|Hazril (`@mohdhazril6168-design`)|High|Done|
|50|Sprint 5|Core Dev III|Transaction Lock Kuota Registrasi Event|Backend|Salsa (`@salsanrm`)|High|Done|
|51|Sprint 5|Core Dev III|Optimasi Query Database Indexing (idx_events_status_date, idx_registrations_event_id)|Backend|Hazril (`@mohdhazril6168-design`)|Low|Done|
|52|Sprint 5|Core Dev III|Optimasi & Cleanup State FE|Frontend|Amirrul (`@Amirrul24`)|Low|In Progress|
|53|Sprint 6|Testing|Integration Testing FE-BE (Mahasiswa -> Panitia -> Admin Flow)|Full Stack|Ahmad (`@AhmadKurnia13`)|High|Backlog|
|54|Sprint 6|Testing|End-to-End Testing (Role-based access & verification workflow)|Frontend|Asad (`@asadmh59`)|High|Backlog|
|55|Sprint 6|Testing|Bug Fixing Frontend|Frontend|Afra (`@Afrawwalun`)|High|Backlog|
|56|Sprint 6|Testing|Bug Fixing Backend|Backend|Salsa (`@salsanrm`)|High|Backlog|
|57|Sprint 6|Testing|Performance Optimization Backend|Backend|Hazril (`@mohdhazril6168-design`)|Medium|Backlog|
|58|Sprint 6|Testing|Security Review Checklist (Endpoint Guard Admin/Panitia, Status Transition Check)|Full Stack|Ahmad (`@AhmadKurnia13`)|High|Backlog|
|59|Sprint 7|Deployment|Deploy Backend Railway/Render & Environment Config|Backend|Salsa (`@salsanrm`)|High|Backlog|
|60|Sprint 7|Deployment|Deploy Frontend Vercel/Netlify & Domain Setup|Frontend|Afra (`@Afrawwalun`)|High|Backlog|
|61|Sprint 7|Deployment|Setup Production Supabase RLS & Environment Variables|Backend|Hazril (`@mohdhazril6168-design`)|High|Backlog|
|62|Sprint 7|Deployment|README & Dokumentasi Teknis API Contract v2 Update|Full Stack|Ahmad (`@AhmadKurnia13`)|Medium|Backlog|
|63|Sprint 7|Deployment|Smoke Test Production All Roles|Frontend|Amirrul (`@Amirrul24`)|Medium|Backlog|
|64|Sprint 7|Deployment|npm audit & Dependency Security Check|Backend|Salsa (`@salsanrm`)|Medium|Backlog|
|65|Sprint 8|Release|Materi Demo Day & Slide Presentasi|Team Lead|Tim|High|Backlog|
|66|Sprint 8|Release|Rehearsal Demo (Simulasi Workflow Mahasiswa, Panitia, Admin)|Semua Anggota|Tim|High|Backlog|
|67|Sprint 8|Release|Evaluasi Tim & Retrospective Sprint|Team Lead|Aditya (`@Adityabeckham`)|Medium|Backlog|

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

---

# Status Project

✅ Sprint 1 selesai  
✅ Finalisasi PRD & ERD/API Contract v2 selesai  
✅ Sprint 2, 3, 4 Core Backend & Auth Core Selesai  
⏳ Sprint 4 & 5 Slicing UI (Frontend) sedang berlangsung (Acuan Design System: `docs_project/prototype/eventhub-kampus-prototype.html`)  
🎯 Target akhir: Demo Day Sprint 8  
