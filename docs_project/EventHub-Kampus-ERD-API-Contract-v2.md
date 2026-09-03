# 📘 EventHub Kampus — ERD & API Contract v2 Specification

**Database:** Supabase (PostgreSQL 15+ dengan RLS)  
**Backend Framework:** Node.js / Express.js (v5)  
**Authentication:** JWT Bearer Token (`Authorization: Bearer <token>`)  
**Base URL:** `/api/v1`  
**Specification Version:** v2.0 (Alur State Machine Lifecycle Event, Presensi & RBAC 3-Tier)  
**Last Updated:** 2026-09-04  

---

## 🔑 0. Model Otorisasi Role (3-Tier RBAC)

| Role | Kategori Akun | Deskripsi & Hak Akses Otorisasi |
| :--- | :--- | :--- |
| `mahasiswa` | Akun Publik (Self-Register) | Mencari event publik (`published`), mendaftar event, dan melihat tiket/riwayat pendaftaran diri sendiri. |
| `panitia` | 1 Akun Per Organisasi (UKM / BEM / Himpunan) | Mengelola event miliknya (`draft`), pengajuan verifikasi (`pending_verification`), memantau peserta, dan menandai presensi kehadiran (`attendance`). |
| `admin` | Admin Platform | Memiliki akses penuh platform: meninjau & memverifikasi event (`published` / `rejected`), memantau statistik platform global, dan mengelola akun panitia organisasi. |

---

## 📐 1. Entity Relationship Diagram (ERD) & Skema Tabel

```text
       +-------------------+
       |       users       |
       +-------------------+
       | id (PK)           |
       | nama              |<-----------------------+
       | email             |                        |
       | password          |                        |
       | role              |                        |
       | organization_name |                        |
       +-------------------+                        |
         |               |                          |
         | (1:N)         | (1:N created_by)         | (1:N checked_by)
         v               v                          |
+------------------+   +-------------------+        |
|  registrations   |   |      events       |        |
+------------------+   +-------------------+        |
| id (PK)          |   | id (PK)           |        |
| user_id (FK)     |   | created_by (FK)   |        |
| event_id (FK)    |---| title             |        |
| status           |   | description       |        |
| registered_at    |   | location          |        |
+------------------+   | event_date        |        |
         |             | quota             |        |
         | (1:1)       | status            |        |
         v             | verified_by (FK)  |        |
+------------------+   | rejection_reason  |        |
|    attendance    |   +-------------------+        |
+------------------+                                |
| id (PK)          |                                |
| registration_id  |--------------------------------+
| is_present       |
| checked_by (FK)  |
| checked_at       |
+------------------+
```

---

## 🔄 2. Event Lifecycle State Machine Rules

```text
[Panitia Create] ➔ status: "draft"
       │
       ▼ (Panitia Submit /events/:id/submit)
[status: "pending_verification"]
       │
       ├───────────────────────────────┐
       ▼ (Admin Approve)               ▼ (Admin Reject + Reason)
[status: "published"]            [status: "rejected"]
```

1. **`draft`**: Event baru dibuat oleh Panitia. Hanya dapat dilihat dan diedit oleh Panitia pembuat.
2. **`pending_verification`**: Panitia mengajukan event untuk diverifikasi Admin. Event terkunci dari pengeditan Panitia.
3. **`published`**: Admin menyetujui event. Event tampil secara publik untuk mahasiswa.
4. **`rejected`**: Admin menolak pengajuan event disertai `rejection_reason`. Event kembali dapat diedit oleh Panitia untuk perbaikan dan diajukan ulang.

---

## 🚀 3. REST API Contract Endpoints (`/api/v1`)

### 3.1 System & Health Check

#### 1. `GET /api/v1/health`
- **Auth:** Public
- **Description:** Memeriksa status kesehatan server backend Express dan koneksi database Supabase.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "message": "Server Express & Supabase berjalan dengan baik!",
  "databaseConnected": true,
  "timestamp": "2026-09-04T02:45:00.000Z"
}
```

---

### 3.2 Authentication Module (`/api/v1/auth`)

#### 1. `POST /api/v1/auth/register`
- **Auth:** Public (Rate Limited)
- **Description:** Pendaftaran mandiri akun publik `mahasiswa`.
- **Request Body:**
```json
{
  "nama": "Budi Santoso",
  "email": "budi@student.ac.id",
  "password": "Password123!"
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Registrasi akun mahasiswa berhasil.",
  "data": {
    "user": {
      "id": "uuid-mahasiswa-1",
      "nama": "Budi Santoso",
      "email": "budi@student.ac.id",
      "role": "mahasiswa"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### 2. `POST /api/v1/auth/login`
- **Auth:** Public (Rate Limited)
- **Description:** Autentikasi akun (`mahasiswa`, `panitia`, `admin`).
- **Request Body:**
```json
{
  "email": "budi@student.ac.id",
  "password": "Password123!"
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "uuid-user-1",
      "nama": "Budi Santoso",
      "email": "budi@student.ac.id",
      "role": "mahasiswa",
      "organization_name": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### 3. `POST /api/v1/auth/refresh`
- **Auth:** Public / Refresh Token (Rate Limited)
- **Description:** Memperbarui JWT Access Token.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token berhasil di-refresh"
}
```

#### 4. `GET /api/v1/auth/me`
- **Auth:** Bearer Token (`mahasiswa`, `panitia`, `admin`)
- **Description:** Mengambil data profil user yang sedang login.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "uuid-user-1",
    "nama": "Budi Santoso",
    "email": "budi@student.ac.id",
    "role": "mahasiswa"
  }
}
```

---

### 3.3 Event Management Module (`/api/v1/events`)

#### 1. `GET /api/v1/events`
- **Auth:** Public
- **Description:** Menampilkan daftar event publik berstatus `published`.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "total": 1,
  "data": [
    {
      "id": "uuid-event-1",
      "title": "Seminar AI Kampus",
      "description": "Pembahasan Agentic AI",
      "location": "Auditorium Utama",
      "event_date": "2026-10-15T09:00:00Z",
      "quota": 100,
      "status": "published",
      "created_by": "uuid-panitia-1"
    }
  ]
}
```

#### 2. `GET /api/v1/events/manage`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Menampilkan daftar event kelolaan (Panitia melihat miliknya, Admin melihat semua).
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "total": 2,
  "data": [
    { "id": "uuid-event-1", "title": "Event Draft", "status": "draft" },
    { "id": "uuid-event-2", "title": "Event Verified", "status": "published" }
  ]
}
```

#### 3. `GET /api/v1/events/:id`
- **Auth:** Public
- **Description:** Menampilkan detail rincian event.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "uuid-event-1",
    "title": "Seminar AI Kampus",
    "description": "Pembahasan Agentic AI",
    "location": "Auditorium Utama",
    "event_date": "2026-10-15T09:00:00Z",
    "quota": 100,
    "status": "published"
  }
}
```

#### 4. `POST /api/v1/events`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Membuat event baru (Default status: `draft`).
- **Request Body:**
```json
{
  "title": "Workshop Web Development",
  "description": "Pengenalan React & Node.js",
  "location": "Lab Komputer 3",
  "event_date": "2026-11-01T10:00:00Z",
  "quota": 50
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Event berhasil dibuat dengan status draft.",
  "data": {
    "id": "uuid-event-new",
    "title": "Workshop Web Development",
    "status": "draft",
    "created_by": "uuid-panitia-1"
  }
}
```

#### 5. `PUT /api/v1/events/:id`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Memperbarui detail rincian event. Panitia hanya dapat mengedit event miliknya berstatus `draft` atau `rejected`. Parameter `status` diabaikan untuk menjamin keamanan state machine.
- **Request Body:**
```json
{
  "title": "Workshop Web Development Updated",
  "quota": 60
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil diperbarui.",
  "data": {
    "id": "uuid-event-1",
    "title": "Workshop Web Development Updated",
    "status": "draft"
  }
}
```

#### 6. `DELETE /api/v1/events/:id`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Menghapus event (Soft Delete / `deleted_at`).
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil dihapus."
}
```

#### 7. `PATCH /api/v1/events/:id/submit`
- **Auth:** Bearer Token (`panitia`)
- **Description:** Mengajukan event `draft` / `rejected` untuk diverifikasi Admin (status berubah menjadi `pending_verification`).
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil diajukan untuk verifikasi admin.",
  "data": {
    "id": "uuid-event-1",
    "status": "pending_verification"
  }
}
```

#### 8. `GET /api/v1/admin/events`
- **Auth:** Bearer Token (`admin`)
- **Description:** Menampilkan daftar event yang menunggu persetujuan verifikasi (`pending_verification`).
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "total": 1,
  "data": [
    {
      "id": "uuid-event-1",
      "title": "Workshop Web Development",
      "status": "pending_verification"
    }
  ]
}
```

#### 9. `PATCH /api/v1/admin/events/:id/verify`
- **Auth:** Bearer Token (`admin`)
- **Description:** Memproses keputusan verifikasi Admin (`approve` ➔ `published`, `reject` ➔ `rejected`). Terproteksi dengan database atomic predicate.
- **Request Body (Approve):**
```json
{
  "action": "approve"
}
```
- **Request Body (Reject):**
```json
{
  "action": "reject",
  "rejection_reason": "Lokasi dan tanggal belum jelas."
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil disetujui dan dipublikasikan.",
  "data": {
    "id": "uuid-event-1",
    "status": "published"
  }
}
```

---

### 3.4 Event Registration Module (`/api/v1/registrations`)

#### 1. `POST /api/v1/events/:id/register`
- **Auth:** Bearer Token (`mahasiswa`)
- **Description:** Mendaftar ke event publik yang kuotanya masih tersedia.
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Berhasil mendaftar event.",
  "data": {
    "id": "uuid-registration-1",
    "event_id": "uuid-event-1",
    "user_id": "uuid-mahasiswa-1",
    "status": "registered"
  }
}
```

#### 2. `GET /api/v1/registrations/me`
- **Auth:** Bearer Token (`mahasiswa`)
- **Description:** Menampilkan daftar tiket dan riwayat pendaftaran event milik diri sendiri.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-registration-1",
      "status": "registered",
      "event": {
        "title": "Seminar AI Kampus",
        "event_date": "2026-10-15T09:00:00Z",
        "location": "Auditorium Utama"
      }
    }
  ]
}
```

---

### 3.5 Attendance Module (`/api/v1/attendance`)

#### 1. `PATCH /api/v1/attendance/:registration_id`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Menandai presensi kehadiran peserta pada event.
- **Request Body:**
```json
{
  "is_present": true
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Presensi kehadiran peserta berhasil diperbarui.",
  "data": {
    "id": "uuid-attendance-1",
    "registration_id": "uuid-registration-1",
    "is_present": true,
    "checked_at": "2026-10-15T09:15:00Z"
  }
}
```

---

### 3.6 Dashboard Module (`/api/v1/dashboard`)

#### 1. `GET /api/v1/panitia/dashboard/stats`
- **Auth:** Bearer Token (`panitia`, `admin`)
- **Description:** Menampilkan statistik ringkasan event & peserta milik organisasi Panitia.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "totalEvents": 5,
    "publishedEvents": 3,
    "pendingEvents": 1,
    "totalRegistrations": 120,
    "totalAttended": 95
  }
}
```

#### 2. `GET /api/v1/admin/dashboard/stats`
- **Auth:** Bearer Token (`admin`)
- **Description:** Menampilkan statistik global seluruh platform EventHub Kampus.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "totalUsers": 450,
    "totalPanitia": 15,
    "totalEvents": 30,
    "pendingVerifications": 3,
    "totalRegistrations": 890
  }
}
```

---

### 3.7 Admin & User Management Module (`/api/v1/admin`)

#### 1. `POST /api/v1/admin/panitia`
- **Auth:** Bearer Token (`admin`)
- **Description:** Membuat akun perwakilan Panitia Organisasi baru.
- **Request Body:**
```json
{
  "nama": "Panitia BEM Fasilkom",
  "email": "bem.fasilkom@kampus.ac.id",
  "password": "PasswordPanitia123!",
  "organization_name": "BEM Fasilkom"
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Akun panitia berhasil dibuat.",
  "data": {
    "id": "uuid-panitia-new",
    "nama": "Panitia BEM Fasilkom",
    "email": "bem.fasilkom@kampus.ac.id",
    "role": "panitia",
    "organization_name": "BEM Fasilkom"
  }
}
```

#### 2. `GET /api/v1/admin/panitia`
- **Auth:** Bearer Token (`admin`)
- **Description:** Menampilkan daftar seluruh akun Panitia Organisasi.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-panitia-1",
      "nama": "Panitia BEM Fasilkom",
      "email": "bem.fasilkom@kampus.ac.id",
      "role": "panitia",
      "organization_name": "BEM Fasilkom"
    }
  ]
}
```

#### 3. `GET /api/v1/admin/users`
- **Auth:** Bearer Token (`admin`)
- **Description:** Monitoring seluruh pengguna terdaftar di platform.
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "total": 450,
  "data": [
    { "id": "uuid-1", "nama": "Budi", "role": "mahasiswa" },
    { "id": "uuid-2", "nama": "Admin", "role": "admin" }
  ]
}
```

---

## ⚠️ 4. Format Respons Error Standar

Semua error yang ditangkap oleh Express Centralized Error Handler mengembalikan format JSON konsisten:

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Deskripsi rincian kesalahan request atau akses terlarang."
}
```

| HTTP Code | Status Message | Skenario Penyebab |
| :--- | :--- | :--- |
| `400 Bad Request` | `fail` | Input tidak valid, pelanggaran status event transition, kuota habis. |
| `401 Unauthorized` | `fail` | Token JWT tidak ditemukan, kedaluwarsa, atau tidak valid. |
| `403 Forbidden` | `fail` | Akses ditolak karena peranan (role) tidak sesuai. |
| `404 Not Found` | `fail` | Resource (event, user, pendaftaran, route) tidak ditemukan. |
| `409 Conflict` | `fail` | Pendaftaran ganda pada event yang sama. |
| `500 Internal Error` | `error` | Kesalahan internal pada server atau koneksi database. |
