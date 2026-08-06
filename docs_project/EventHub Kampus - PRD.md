# EventHub Kampus — Dokumentasi Project \(Mentorship Program\)

**Team Lead:** Aditya Beckham



---



## Product Requirement Document \(PRD\)

### 1\.1 Overview

EventHub Kampus adalah platform terintegrasi untuk mengelola event kampus \(UKM, BEM, Himpunan\) mulai dari publikasi event, registrasi peserta, hingga absensi — menggantikan proses manual berbasis Google Form dan Spreadsheet\.

### 1\.2 Latar Belakang Masalah \(WHY\)

Pengelolaan event kampus saat ini masih manual menggunakan Google Form, Spreadsheet, dan pencatatan kertas\. Hal ini menyebabkan:

- Data peserta tersebar di banyak file/form berbeda\.

- Tidak ada dashboard terpusat untuk panitia memantau pendaftaran\.

- Absensi manual rawan human error dan sulit direkap\.

- Tidak ada riwayat event yang terdokumentasi rapi antar organisasi\.

### 1\.3 Target User \(WHO\)

|**User**|**Kebutuhan Utama**|
|---|---|
|Mahasiswa|Cari \& daftar event dengan mudah|
|Panitia Event UKM / BEM / Himpunan|Kelola event \& pantau peserta,Publikasi event resmi organisasi|
|Admin|Kontrol penuh atas seluruh event \& user|

### 1\.4 Solusi \(WHAT\)

Web platform dengan role **Mahasiswa \(Peserta\)** dan **Admin/Panitia**, mencakup: autentikasi, listing event, registrasi peserta, dashboard admin, manajemen event, dan pencatatan kehadiran — dalam satu sistem terintegrasi\.

### 1\.5 Goals \& Success Metrics \(MVP\)

|**Goal**|**Metric**|
|---|---|
|Mempermudah pendaftaran event|Waktu registrasi peserta \< 2 menit|
|Sentralisasi data event|100% event tercatat di sistem \(tidak ada lagi Google Form\)|
|Mempermudah rekap kehadiran|Admin bisa export/lihat data kehadiran real\-time|
|Adopsi oleh minimal 1 UKM/BEM|Digunakan pada 1 event pilot sebelum akhir program|

### 1\.6 Fitur Utama / MVP

|**No**|**Fitur**|**Deskripsi Singkat**|**Actor**|
|---|---|---|---|
|1|Login \& Register|Autentikasi user \(mahasiswa \& admin\)|Semua user|
|2|Daftar Event|Listing event yang tersedia, detail event|Mahasiswa|
|3|Registrasi Peserta|Mahasiswa mendaftar ke event tertentu|Mahasiswa|
|4|Dashboard Admin|Ringkasan event, jumlah peserta, statistik|Admin/Panitia|
|5|Kelola Event|CRUD event \(create, edit, delete, publish\)|Admin/Panitia|
|6|Kehadiran Peserta|Pencatatan hadir/tidak hadir per peserta<br>|Admin/Panitia|

### 1\.7 Out of Scope \(Non\-MVP / Fase 2\)

- QR Code Attendance

- E\-Certificate otomatis

- Notifikasi Event \(email/push\)

- Export ke Excel

### 1\.8 Tech Stack

|**Layer**|**Teknologi**|
|---|---|
|Frontend|React\.js|
|Styling|Tailwind CSS|
|Backend|Node\.js / Express\.js|
|Database|Supabase \(PostgreSQL\)|
|Deploy FE|Vercel |
|Deploy BE|Railway / Render|

### 1\.9 Asumsi \& Batasan

- Tidak ada payment gateway \(event gratis\)\.

- Satu event hanya punya satu panitia pengelola \(multi\-role masuk fase 2\)\.

- Autentikasi sederhana \(email/password\), tanpa SSO kampus di MVP\.

- Data disimpan di Supabase, tidak ada integrasi SIAKAD\.

### 1\.10 Timeline \(mengikuti Dokumen Sprint Planning Tim — 8 Sprint / 8 Minggu\)

|**Sprint**|**Fase SDLC**|**Sprint Goal**|
|---|---|---|
|Sprint 1 \(Minggu 1\)|Team Alignment \& Project Planning|Menyamakan pemahaman tim, menentukan proyek, MVP scope, role, setup GitHub/Lark|
|Sprint 2 \(Minggu 2\)|Requirement Analysis \& System Design|Menyusun PRD, Functional Requirement, ERD, API Contract, Wireframe, boilerplate FE/BE|
|Sprint 3 \(Minggu 3\)|Core Development I|Implementasi Authentication, setup database, setup tech stack FE/BE, code review|
|Sprint 4 \(Minggu 4\)|Core Development II|Implementasi fitur inti MVP \(\~50–60%\), integrasi FE\-BE|
|Sprint 5 \(Minggu 5\)|Core Development III|Menyelesaikan seluruh fitur MVP, validasi input, error handling, optimasi|
|Sprint 6 \(Minggu 6\)|Testing \& Refinement|Integration \& E2E testing, bug fixing, UI refinement, performance optimization|
|Sprint 7 \(Minggu 7\)|Deployment \& Documentation|Deploy production, setup env variable, finalisasi README|
|Sprint 8 \(Minggu 8\)|Review \& Release|Demo Day, evaluasi tim|



---



## User Stories

### Epic 1 — Authentication

- **US\-01**: Sebagai mahasiswa, saya ingin mendaftar akun baru, agar saya bisa mengakses fitur registrasi event\.

    - AC: Form register \(nama, email, password, konfirmasi password\), validasi email unik, redirect ke login setelah sukses\.

- **US\-02**: Sebagai user, saya ingin login dengan email \& password, agar saya bisa masuk ke akun saya\.

    - AC: Validasi kredensial, error message jika salah, redirect sesuai role \(mahasiswa → home, admin → dashboard\)\.

- **US\-03**: Sebagai user, saya ingin logout, agar sesi saya aman setelah selesai menggunakan aplikasi\.

### Epic 2 — Daftar Event

- **US\-04**: Sebagai mahasiswa, saya ingin melihat daftar event yang tersedia, agar saya tahu event apa saja yang bisa saya ikuti\.

    - AC: List event menampilkan nama, tanggal, penyelenggara, kuota; bisa difilter/sort by tanggal\.

- **US\-05**: Sebagai mahasiswa, saya ingin melihat detail event, agar saya tahu informasi lengkap sebelum mendaftar\.

    - AC: Halaman detail menampilkan deskripsi, lokasi, waktu, kuota tersisa, tombol daftar\.

### Epic 3 — Registrasi Peserta

- **US\-06**: Sebagai mahasiswa, saya ingin mendaftar ke sebuah event, agar saya tercatat sebagai peserta\.

    - AC: Tombol daftar nonaktif jika kuota penuh atau sudah terdaftar; muncul konfirmasi sukses\.

- **US\-07**: Sebagai mahasiswa, saya ingin melihat riwayat event yang saya ikuti, agar saya bisa memantau status pendaftaran saya\.

### Epic 4 — Dashboard Admin

- **US\-08**: Sebagai admin/panitia, saya ingin melihat ringkasan jumlah event \& peserta, agar saya bisa memantau performa event secara cepat\.

    - AC: Menampilkan total event aktif, total peserta terdaftar, event terbaru\.

### Epic 5 — Kelola Event

- **US\-09**: Sebagai admin/panitia, saya ingin membuat event baru, agar event bisa dipublikasikan ke mahasiswa\.

    - AC: Form create event \(nama, deskripsi, tanggal, lokasi, kuota\), validasi field wajib\.

- **US\-10**: Sebagai admin/panitia, saya ingin mengedit/menghapus event, agar informasi event tetap akurat\.

### Epic 6 — Kehadiran Peserta

- **US\-11**: Sebagai admin/panitia, saya ingin menandai peserta hadir/tidak hadir, agar data kehadiran event tercatat dengan benar\.

    - AC: List peserta per event dengan toggle hadir/tidak hadir, tersimpan real\-time ke database\.



---



## User Flow / User Journey

### 3\.1 Flow Mahasiswa \(Peserta\)

![Image](https://internal-api-drive-stream-jp.larksuite.com/space/api/box/stream/download/authcode/?code=OTY4OWZmYWUwYWRmMWUwNDYyNmY2YTlmYjcxYmUzMGNfMThkN2MyMWI0NjBmODMwZTZjNTJhMmUyNWQyZjdhOGZfSUQ6NzY2OTQ5NzY2MzIxMzA5NjQ3MV8xNzg2MDE5NzQ5OjE3ODYxMDYxNDlfVjM)

### 3\.2 Flow Admin / Panitia

![Image](https://internal-api-drive-stream-jp.larksuite.com/space/api/box/stream/download/authcode/?code=YzQ0MzgyNTIwOTIzYmY0MThmYTY4Mjc5ZTg0NDllODNfZGZiMmIwMmRjZjQ0MzI2YzAzMGU2MjM5MzFkMzQ0YzFfSUQ6NzY2OTQ5NzAyNDMzMjU5ODgxMF8xNzg2MDE5NzQ5OjE3ODYxMDYxNDlfVjM)



---



## Setup Task Management — GitHub Projects

**Struktur Board \(Board View\)** — sesuai dokumen Sprint Planning tim:

|**Urutan**|**Status Kolom**|**Keterangan**|
|---|---|---|
|1|Backlog|Daftar task sprint yang belum dimulai|
|2|Todo|Task sprint yang sedang berjalan / siap dikerjakan|
|3|In Progress|Task yang sedang dikerjakan|
|4|In Review|Task menunggu code review|
|5|Done|Task selesai dan sudah merge|

**Labels yang disarankan:**

- Tipe: feature, bug, docs, design

- Role: frontend, backend, ui\-ux

- Prioritas: priority: high, priority: medium, priority: low

- Status khusus: blocked, needs\-review

**Milestones:** buat 1 milestone per sprint mengikuti 8 sprint di Bab 1\.10 \(Sprint 1 s\.d\. Sprint 8\), bukan sprint generik — supaya progress board bisa langsung dibandingkan dengan Sprint Goal \& Definition of Done yang sudah kamu tetapkan di dokumen sprint planning\.

**Workflow terkait \(mengikuti dokumen tim\):** Source Code → Commit → Push → Pull Request → Code Review → Merge, dengan setiap Pull Request idealnya di\-link ke Issue/task terkait di board\.

**Issue Template \(disarankan dibuat di ****\.github/ISSUE\_TEMPLATE/****\):**

## User Story

Sebagai \[role\], saya ingin \[aksi\], agar \[manfaat\]\.



## Acceptance Criteria

- \[ \]

- \[ \]

## Role

Frontend / Backend / UI\-UX



## Sprint

Sprint X



**Cara kerja:**

1. Setiap user story di atas \(US\-01 s\.d\. US\-11\) dijadikan 1 Issue\.

2. Issue dipecah lagi jadi sub\-task teknis jika perlu \(misal US\-06 → task FE \+ task BE terpisah, di\-link via checklist\)\.

3. Assign issue ke PIC sesuai tabel pembagian task di Bab 6\.

4. Gunakan Milestone untuk mengelompokkan issue per sprint\.



---



## Setup Task Management — Kanban di Lark

Sesuai arahan tim, **kolom kanban di Lark mengikuti persis \(mirror 1:1\) struktur kanban GitHub Projects** di Bab 4 — bukan struktur terpisah\. Tujuannya supaya semua anggota tim, termasuk yang lebih terbiasa dengan Lark daripada GitHub, tetap melihat status task yang konsisten di kedua tempat\.

**Kolom Kanban \(sama persis dengan GitHub Projects\):**

|**Urutan**|**Status Kolom**|**Keterangan**|
|---|---|---|
|1|Backlog|Daftar task sprint yang belum dimulai|
|2|Todo|Task sprint yang sedang berjalan / siap dikerjakan|
|3|In Progress|Task yang sedang dikerjakan|
|4|In Review|Task menunggu code review|
|5|Done|Task selesai dan sudah merge|

**Custom Fields per Card \(disarankan, agar setara dengan Issue GitHub\):**

|**Field**|**Tipe**|**Keterangan**|
|---|---|---|
|Assignee|Person|Anggota tim yang bertanggung jawab|
|Role|Single Select|Frontend / Backend / UI\-UX|
|Priority|Single Select|High / Medium / Low|
|Sprint|Single Select|Sprint 1–8|
|Due Date|Date|Deadline task|
|Link GitHub Issue|Text/URL|Sinkronisasi manual ke issue terkait di GitHub Project|

**Fungsi Lark Workspace lainnya \(sesuai dokumen tim\):** Selain kanban board, Lark Workspace tim juga dipakai untuk:

- **Docs Project \(PRD\)** — versi Lark Docs dari PRD di Bab 1, agar mudah diakses/dikomentari anggota non\-teknis\.

- **Meeting Notes** — notulen tiap meeting tim maupun meeting dengan mentor\.

- **Sprint Planning** — dokumen tracking 8 sprint \(sumber acuan Bab 1\.10\)\.

- **Chat** — komunikasi harian tim\.

**Cara sinkronisasi GitHub ↔ Lark:**

1. Setiap Issue baru di GitHub Project → dibuat card yang sama persis \(nama, deskripsi, kolom status\) di Lark kanban\.

2. Update status card \(Todo → In Progress → In Review → Done\) dilakukan di kedua tempat oleh masing\-masing PIC saat status berubah\.

3. GitHub Projects tetap jadi **source of truth teknis** \(terhubung ke commit/PR\); Lark jadi **tampilan yang lebih ramah** untuk laporan ke mentor dan koordinasi non\-teknis\.

4. Team Lead melakukan pengecekan konsistensi kedua board minimal 1x per hari kerja atau saat standup\.



---





