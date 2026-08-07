# EventHub Kampus — ERD & API Contract v2 Specification

**Database:** Supabase (PostgreSQL 15+ with RLS)  
**Backend Framework:** Node.js / Express.js (v5)  
**Authentication:** JWT Bearer Token  
**Base URL:** `/api/v1`  
**Specification Version:** v2.0 (Revisi Role Panitia & Verifikasi Admin)

---

## 📌 0. Model Otorisasi Role (3-Tier RBAC)

| Role | Kategori Akun | Deskripsi & Hak Akses Otorisasi |
| --- | --- | --- |
| `mahasiswa` | Akun Publik (Self-Register) | Mencari event publik (`published`), mendaftar event, dan melihat tiket/riwayat pendaftaran diri sendiri. |
| `panitia` | 1 Akun Per Organisasi (UKM / BEM / Himpunan) | Mengelola event miliknya (`draft`), pengajuan verifikasi (`pending_verification`), memantau peserta, dan menandai kehadiran (`attendance`). |
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

### 1.1 Detail Tabel Database

#### 1. Tabel `users`
| Kolom | Tipe Data | Constraint | Deskripsi |
| --- | --- | --- | --- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique Identifier User |
| `nama` | `VARCHAR(255)` | NOT NULL | Nama Lengkap / Nama Organisasi |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Alamat Email unik |
| `password` | `VARCHAR(255)` | NOT NULL | Bcrypt Hashed Password |
| `role` | `VARCHAR(20)` | NOT NULL, Default `'mahasiswa'` | Enum: `'mahasiswa'`, `'panitia'`, `'admin'` |
| `organization_name` | `VARCHAR(255)` | NULLABLE | Nama Organisasi (Khusus `role = 'panitia'`) |
| `created_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Tanggal pendaftaran akun |
| `updated_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Waktu pembaruan akun terakhir |

#### 2. Tabel `events`
| Kolom | Tipe Data | Constraint | Deskripsi |
| --- | --- | --- | --- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique Identifier Event |
| `title` | `VARCHAR(255)` | NOT NULL | Judul Event |
| `description` | `TEXT` | NULLABLE | Deskripsi rincian event |
| `location` | `VARCHAR(255)` | NOT NULL | Lokasi pelaksanaan event |
| `event_date` | `TIMESTAMPTZ` | NOT NULL | Tanggal & waktu pelaksanaan event |
| `quota` | `INT` | NOT NULL, CHECK (`quota >= 0`) | Kuota maksimum peserta |
| `status` | `VARCHAR(20)` | Default `'draft'` | Enum: `'draft'`, `'pending_verification'`, `'published'`, `'rejected'`, `'completed'`, `'cancelled'` |
| `created_by` | `UUID` | FK → `users(id)` ON DELETE CASCADE | ID Panitia pembuat event |
| `verified_by` | `UUID` | FK → `users(id)` ON DELETE SET NULL | ID Admin verifikator event |
| `verified_at` | `TIMESTAMPTZ` | NULLABLE | Tanggal persetujuan admin |
| `rejection_reason` | `TEXT` | NULLABLE | Catatan alasan jika event ditolak Admin |
| `created_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Waktu pembuatan event |
| `updated_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Waktu pembaruan event |

#### 3. Tabel `registrations`
| Kolom | Tipe Data | Constraint | Deskripsi |
| --- | --- | --- | --- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique Identifier Registrasi |
| `user_id` | `UUID` | FK → `users(id)` ON DELETE CASCADE | ID Mahasiswa pendaftar |
| `event_id` | `UUID` | FK → `events(id)` ON DELETE CASCADE | ID Event yang didaftari |
| `status` | `VARCHAR(20)` | Default `'registered'` | Enum: `'registered'`, `'attended'`, `'cancelled'` |
| `registered_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Tanggal pendaftaran event |
| — | `UNIQUE` | `(user_id, event_id)` | Mencegah pendaftaran ganda |

#### 4. Tabel `attendance`
| Kolom | Tipe Data | Constraint | Deskripsi |
| --- | --- | --- | --- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique Identifier Presensi |
| `registration_id` | `UUID` | FK → `registrations(id)` UNIQUE | Unique Pendaftaran peserta |
| `is_present` | `BOOLEAN` | NOT NULL | `true` = Hadir, `false` = Tidak Hadir |
| `checked_by` | `UUID` | FK → `users(id)` ON DELETE CASCADE | ID Panitia yang melakukan marking |
| `checked_at` | `TIMESTAMPTZ` | Default `CURRENT_TIMESTAMP` | Waktu presensi dicatat |

---

## 📡 2. API Contract Specification (Base URL: `/api/v1`)

### 🔑 Standard Header Requests:
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

### 🔑 2.1 Modul Autentikasi (`/api/v1/auth`)

#### 1. Registrasi Mahasiswa Publik
- **HTTP Method:** `POST`
- **Endpoint:** `/api/v1/auth/register`
- **Otorisasi:** Public (Tanpa Token)
- **Request Body:**
```json
{
  "nama": "Aditya Beckham",
  "email": "aditya@student.kampus.ac.id",
  "password": "Password123!"
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Registrasi berhasil",
  "data": {
    "id": "e8a9172b-8a4e-4b1a-96c2-8418f77341e9",
    "nama": "Aditya Beckham",
    "email": "aditya@student.kampus.ac.id",
    "role": "mahasiswa",
    "created_at": "2026-08-07T14:00:00.000Z"
  }
}
```
- **Response Error (400 Bad Request):**
```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Email sudah terdaftar"
}
```

#### 2. Login User (Semua Role)
- **HTTP Method:** `POST`
- **Endpoint:** `/api/v1/auth/login`
- **Otorisasi:** Public (Tanpa Token)
- **Request Body:**
```json
{
  "email": "aditya@student.kampus.ac.id",
  "password": "Password123!"
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e8a9172b-8a4e-4b1a-96c2-8418f77341e9",
    "nama": "Aditya Beckham",
    "email": "aditya@student.kampus.ac.id",
    "role": "mahasiswa"
  }
}
```
- **Response Error (401 Unauthorized):**
```json
{
  "status": "fail",
  "statusCode": 401,
  "message": "Kredensial tidak valid (email/password salah)"
}
```

#### 3. GET Current User Profile
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/auth/me`
- **Otorisasi:** Bearer Token (Semua Role)
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "e8a9172b-8a4e-4b1a-96c2-8418f77341e9",
    "nama": "Aditya Beckham",
    "email": "aditya@student.kampus.ac.id",
    "role": "mahasiswa",
    "organization_name": null
  }
}
```

---

### 🎈 2.2 Modul Katalog Event & Registrasi Peserta

#### 1. Listing Public Published Events
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/events`
- **Query Parameters:** `?search=webinar&page=1&limit=10`
- **Otorisasi:** Public / Mahasiswa
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_data": 25,
    "total_pages": 3
  },
  "data": [
    {
      "id": "c1f729b4-3a91-49b2-9d83-11b415a772f1",
      "title": "Webinar Nasional AI & Tech Trends 2026",
      "description": "Pembahasan tren AI terkini bersama pakar industri.",
      "location": "Auditorium Utama & Zoom",
      "event_date": "2026-09-15T09:00:00.000Z",
      "quota": 200,
      "registered_count": 45,
      "organizer": "UKM Robotika"
    }
  ]
}
```

#### 2. Detail Published Event
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/events/:id`
- **Otorisasi:** Public / Mahasiswa
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "id": "c1f729b4-3a91-49b2-9d83-11b415a772f1",
    "title": "Webinar Nasional AI & Tech Trends 2026",
    "description": "Detail lengkap seputar materi dan fasilitator.",
    "location": "Auditorium Utama",
    "event_date": "2026-09-15T09:00:00.000Z",
    "quota": 200,
    "remaining_quota": 155,
    "status": "published",
    "organization_name": "UKM Robotika"
  }
}
```

#### 3. Pendaftaran Mahasiswa ke Event
- **HTTP Method:** `POST`
- **Endpoint:** `/api/v1/events/:id/register`
- **Otorisasi:** Bearer Token (Role: `mahasiswa`)
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Pendaftaran event berhasil",
  "data": {
    "registration_id": "f51a2e38-92bc-418b-8217-1092471b0284",
    "event_id": "c1f729b4-3a91-49b2-9d83-11b415a772f1",
    "status": "registered",
    "registered_at": "2026-08-07T14:10:00.000Z"
  }
}
```
- **Response Error (400 Bad Request / Quota Exceeded):**
```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Anda sudah terdaftar pada event ini atau kuota telah penuh"
}
```

#### 4. Riwayat Pendaftaran Event Mahasiswa
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/registrations/me`
- **Otorisasi:** Bearer Token (Role: `mahasiswa`)
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "registration_id": "f51a2e38-92bc-418b-8217-1092471b0284",
      "event_title": "Webinar Nasional AI & Tech Trends 2026",
      "event_date": "2026-09-15T09:00:00.000Z",
      "location": "Auditorium Utama",
      "status": "registered",
      "is_present": false
    }
  ]
}
```

---

### 🚩 2.3 Modul Kelola Event (Panitia)

#### 1. Buat Draft Event Baru
- **HTTP Method:** `POST`
- **Endpoint:** `/api/v1/events`
- **Otorisasi:** Bearer Token (Role: `panitia`)
- **Request Body:**
```json
{
  "title": "Workshop React & Tailwind CSS",
  "description": "Hands-on coding dari nol hingga deploy.",
  "location": "Lab Komputer 3",
  "event_date": "2026-10-01T13:00:00.000Z",
  "quota": 50
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Draft event berhasil dibuat",
  "data": {
    "id": "a91823b1-912f-45b9-b811-192847b2019a",
    "title": "Workshop React & Tailwind CSS",
    "status": "draft",
    "created_at": "2026-08-07T14:15:00.000Z"
  }
}
```

#### 2. Submit Event Draft untuk Verifikasi Admin
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/v1/events/:id/submit`
- **Otorisasi:** Bearer Token (Role: `panitia` & Owner Event)
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil diajukan untuk verifikasi Admin",
  "data": {
    "id": "a91823b1-912f-45b9-b811-192847b2019a",
    "status": "pending_verification"
  }
}
```

#### 3. Update Event Panitia
- **HTTP Method:** `PUT`
- **Endpoint:** `/api/v1/events/:id`
- **Otorisasi:** Bearer Token (Role: `panitia` & Owner Event)
- **Request Body:**
```json
{
  "title": "Workshop React 19 & Tailwind CSS v4",
  "description": "Materi terupdate React 19.",
  "location": "Lab Komputer 3",
  "event_date": "2026-10-01T13:00:00.000Z",
  "quota": 60
}
```

#### 4. Listing Event Milik Panitia
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/panitia/events`
- **Otorisasi:** Bearer Token (Role: `panitia`)
- **Query Parameters:** `?status=pending_verification`

---

### 📝 2.4 Modul Marking Presensi Kehadiran (Panitia)

#### 1. Daftar Peserta Terdaftar Event
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/events/:id/participants`
- **Otorisasi:** Bearer Token (Role: `panitia` & Owner Event)
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": [
    {
      "registration_id": "f51a2e38-92bc-418b-8217-1092471b0284",
      "student_name": "Aditya Beckham",
      "student_email": "aditya@student.kampus.ac.id",
      "registered_at": "2026-08-07T14:10:00.000Z",
      "is_present": false
    }
  ]
}
```

#### 2. Marking Presensi Kehadiran Peserta
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/v1/attendance/:registration_id`
- **Otorisasi:** Bearer Token (Role: `panitia` & Owner Event)
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
  "message": "Presensi peserta berhasil diperbarui",
  "data": {
    "registration_id": "f51a2e38-92bc-418b-8217-1092471b0284",
    "is_present": true,
    "checked_at": "2026-08-07T14:20:00.000Z"
  }
}
```

---

### 🛡️ 2.5 Modul Verifikasi & Manajemen Akun (Admin Platform)

#### 1. GET Dashboard Stats Admin Platform Global
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/admin/dashboard/stats`
- **Otorisasi:** Bearer Token (Role: `admin`)
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "total_organizations": 8,
    "total_panitia_accounts": 8,
    "total_events_all": 45,
    "pending_verification_count": 3,
    "total_participants_platform": 1420
  }
}
```

#### 2. Listing Event Pengajuan Verifikasi
- **HTTP Method:** `GET`
- **Endpoint:** `/api/v1/admin/events`
- **Query Parameters:** `?status=pending_verification`
- **Otorisasi:** Bearer Token (Role: `admin`)

#### 3. Verifikasi Approval / Rejection Event
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/v1/admin/events/:id/verify`
- **Otorisasi:** Bearer Token (Role: `admin`)
- **Request Body (Approve):**
```json
{
  "decision": "approve"
}
```
- **Request Body (Reject):**
```json
{
  "decision": "reject",
  "rejection_reason": "Tanggal event bentrok dengan acara Dies Natalis di lokasi yang sama."
}
```
- **Response Success (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Event berhasil diverifikasi (Status: published)",
  "data": {
    "id": "a91823b1-912f-45b9-b811-192847b2019a",
    "status": "published",
    "verified_at": "2026-08-07T14:25:00.000Z"
  }
}
```

#### 4. Buat Akun Panitia Organisasi (UKM / BEM)
- **HTTP Method:** `POST`
- **Endpoint:** `/api/v1/admin/panitia`
- **Otorisasi:** Bearer Token (Role: `admin`)
- **Request Body:**
```json
{
  "nama": "Panitia BEM KM",
  "email": "bem@kampus.ac.id",
  "password": "SecurePassword123!",
  "organization_name": "BEM KM"
}
```
- **Response Success (201 Created):**
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Akun Panitia Organisasi berhasil dibuat",
  "data": {
    "id": "d19283b4-1920-412b-a192-918274192bca",
    "nama": "Panitia BEM KM",
    "email": "bem@kampus.ac.id",
    "role": "panitia",
    "organization_name": "BEM KM"
  }
}
```
