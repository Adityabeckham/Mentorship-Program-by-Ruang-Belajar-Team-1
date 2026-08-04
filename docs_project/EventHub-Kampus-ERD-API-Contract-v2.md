# EventHub\-Kampus\-ERD\-API\-Contract\-v2

# EventHub Kampus — ERD \& API Contract \(Sprint 2 — Revisi v2: Role Panitia\)

**Database:** Supabase \(PostgreSQL\)
**Backend:** Node\.js / Express\.js
**Auth:** JWT \(Bearer Token\)

> **Catatan revisi:** Dokumen ini adalah update dari `EventHub-Kampus-ERD-API-Contract.md` \(Sprint 2 awal\) mengikuti hasil meeting tim mengenai struktur role\. Perubahan utama: model role naik dari 2 \(`mahasiswa`, `admin`\) menjadi 3 \(`mahasiswa`, `panitia`, `admin`\), dengan alur verifikasi event oleh admin sebelum tayang ke publik\. Bagian yang berubah ditandai **\[REVISI\]**\.

---

## 0\. Ringkasan Perubahan Role **\[REVISI\]**

|Role|Jenis Akun|Kewenangan|
|---|---|---|
|`mahasiswa`|Per individu|Cari \& daftar event|
|`panitia`|1 akun per organisasi \(BEM, UKM, Himpunan\)|CRUD event miliknya, lihat \& tandai kehadiran peserta miliknya|
|`admin`|1–beberapa akun platform|Lihat \& verifikasi event dari panitia, kelola akun panitia \(UKM/BEM/Himpunan\)|

Implikasi ke seluruh dokumen: di versi Sprint 2 awal, role `admin` yang mengelola CRUD event \& kehadiran sekarang digantikan oleh role `panitia`\. Role `admin` yang baru murni untuk verifikasi event lintas\-organisasi dan manajemen akun panitia — **bukan** pemilik event\.

---

## 1\. Entity Relationship Diagram \(ERD\)

![Image](https://internal-api-drive-stream-jp.larksuite.com/space/api/box/stream/download/authcode/?code=MDY5ZDIwMzJhZjUyMjM4OWIzYThiNzUyNzMxNzYyOTJfNGIwMzA2ZmQ5YWQzMzViNjkwOTE2MDIzNzMwZThjYTZfSUQ6NzY3MDE3ODQ4NzI0Nzg2NzQxOV8xNzg1ODUyODQzOjE3ODU5MzkyNDNfVjM)

### 1\.1 Detail Skema Tabel

**`users`**

|Kolom|Tipe|Constraint|
|---|---|---|
|id|uuid|PK, default `gen_random_uuid()`|
|name|varchar\(100\)|not null|
|email|varchar\(150\)|unique, not null|
|password\_hash|text|not null|
|role|varchar\(20\)|not null, default `'mahasiswa'`, check in \(`mahasiswa`, `panitia`, `admin`\) **\[REVISI\]**|
|organization\_name|varchar\(100\)|nullable, hanya diisi jika `role = 'panitia'` \(mis\. "BEM", "UKM Robotika"\) **\[BARU\]**|
|created\_at|timestamptz|default `now()`|

> Keputusan tim: organisasi disimpan sebagai kolom `organization_name` langsung di `users`, bukan tabel `organizations` terpisah — sesuai skala MVP \(1 akun = 1 organisasi, tidak butuh relasi many\-to\-many\)\.

**`events`**

|Kolom|Tipe|Constraint|
|---|---|---|
|id|uuid|PK, default `gen_random_uuid()`|
|created\_by|uuid|FK → `users.id` \(role `panitia`\), not null **\[REVISI: sebelumnya merujuk admin\]**|
|title|varchar\(150\)|not null|
|description|text|nullable|
|location|varchar\(150\)|nullable|
|event\_date|timestamptz|not null|
|quota|int|not null, check `quota >= 0`|
|status|varchar\(20\)|default `'draft'`, check in \(`draft`, `pending_verification`, `published`, `rejected`, `closed`\) **\[REVISI\]**|
|verified\_by|uuid|FK → `users.id` \(role `admin`\), nullable **\[BARU\]**|
|verified\_at|timestamptz|nullable **\[BARU\]**|
|rejection\_reason|text|nullable, diisi admin jika `status = 'rejected'` **\[BARU\]**|
|created\_at|timestamptz|default `now()`|
|updated\_at|timestamptz|default `now()`|
|—|index|`idx_events_status_date` on \(`status`, `event_date`\)|

**Alur status event \[BARU\]:**

```Plaintext
draft --(panitia submit)--> pending_verification --(admin approve)--> published --(lewat tanggal/ditutup)--> closed
                                     |
                                     +--(admin reject)--> rejected --(panitia edit & submit ulang)--> pending_verification
```

**`registrations`** — tidak berubah dari dokumen Sprint 2 awal\.

|Kolom|Tipe|Constraint|
|---|---|---|
|id|uuid|PK, default `gen_random_uuid()`|
|event\_id|uuid|FK → `events.id`, not null|
|user\_id|uuid|FK → `users.id`, not null|
|status|varchar\(20\)|default `'registered'`, check in \(`registered`, `cancelled`\)|
|registered\_at|timestamptz|default `now()`|
|—|unique|\(`event_id`, `user_id`\)|
|—|index|`idx_registrations_event_id`|

**`attendance`** — tidak berubah dari dokumen Sprint 2 awal\.

|Kolom|Tipe|Constraint|
|---|---|---|
|id|uuid|PK, default `gen_random_uuid()`|
|registration\_id|uuid|FK → `registrations.id`, unique, not null|
|is\_present|boolean|default `false`|
|checked\_at|timestamptz|nullable|
|checked\_by|uuid|FK → `users.id` \(role `panitia`\), nullable **\[REVISI: sebelumnya admin\]**|

### 1\.2 Row Level Security \(RLS\) **\[REVISI\]**

|Tabel|Policy \(ringkas\)|
|---|---|
|`users`|User hanya bisa `SELECT`/`UPDATE` baris miliknya sendiri \(`auth.uid() = id`\)\. Hanya `admin` yang boleh `INSERT` baris baru dengan `role = 'panitia'`\. Tidak ada `DELETE` lewat client\.|
|`events`|`SELECT` untuk status `published` terbuka untuk semua\. `INSERT`/`UPDATE`/`DELETE` hanya untuk role `panitia` dan `created_by = auth.uid()`\. Update kolom `status` ke `published`/`rejected`/`verified_by`/`verified_at` hanya boleh oleh role `admin`\.|
|`registrations`|User hanya bisa `INSERT`/`SELECT` baris miliknya sendiri \(`user_id = auth.uid()`\)\. Panitia bisa `SELECT` baris pada event yang `created_by`\-nya dia\. Admin bisa `SELECT` semua \(untuk keperluan verifikasi/monitoring\)\.|
|`attendance`|Hanya panitia pemilik event terkait yang bisa `INSERT`/`UPDATE`\. Mahasiswa hanya boleh `SELECT` baris miliknya sendiri\.|

---

## 2\. API Contract

**Base URL:** `/api/v1`

Format response, pagination, rate limiting, JWT expiry — sama seperti dokumen Sprint 2 awal \(tidak berubah\)\.

### 2\.1 Modul Auth

**POST ****`/auth/register`** — tidak berubah, tetap **selalu** membuat akun `role: mahasiswa`\. Akun `panitia` dan `admin` tidak bisa self\-register \(lihat Bab 2\.6 **\[BARU\]**\)\.

**POST ****`/auth/login`**, **GET ****`/auth/me`** — tidak berubah secara struktur, hanya `data.user.role` sekarang bisa bernilai `mahasiswa`, `panitia`, atau `admin`\.

### 2\.2 Modul Daftar Event \& Registrasi

**GET ****`/events`**, **GET ****`/events/:id`** — tidak berubah, tetap hanya mengambil event `status = 'published'`\.

**POST ****`/events/:id/register`**, **GET ****`/registrations/me`** — tidak berubah\.

### 2\.3 Modul Kelola Event / CRUD **\[REVISI: role admin → panitia\]**

**POST ****`/events`**

- Auth: Bearer Token \(role: **panitia**\)

- Event baru otomatis dibuat dengan `status: 'draft'` — tidak langsung tayang\.

- Response `201`: data event baru\.

**PATCH ****`/events/:id/submit`** **\[BARU\]**

- Auth: Bearer Token \(role: panitia\) \+ ownership check \(`created_by === req.user.id`\)

- Mengubah `status` dari `draft` \(atau `rejected`\) menjadi `pending_verification`, menandakan event siap direview admin\.

- Error `409` \(`code: INVALID_STATUS_TRANSITION`\): dipanggil saat status bukan `draft`/`rejected`\.

**PUT ****`/events/:id`**

- Auth: Bearer Token \(role: **panitia**\) \+ ownership check eksplisit \(`created_by === req.user.id`\)\.

- Jika event sudah `published`, edit field non\-kritis \(deskripsi, lokasi\) diperbolehkan; edit `event_date`/`quota` mengembalikan status ke `pending_verification` \(perlu re\-verifikasi\) — *keputusan bisnis ini perlu dikonfirmasi ke tim, belum final*\.

- Error `403` \(`code: FORBIDDEN_NOT_OWNER`\)\.

**DELETE ****`/events/:id`**

- Auth: Bearer Token \(role: **panitia**\) \+ ownership check sama seperti `PUT`\.

- Soft delete tetap berlaku sesuai dokumen awal\.

**GET ****`/admin/events`** **\[REVISI: scope berubah total\]**

- Auth: Bearer Token \(role: **panitia**\)

- Menampilkan daftar event **milik panitia yang login saja** \(termasuk semua status: draft, pending\_verification, published, rejected, closed\) — untuk dashboard panitia\.

- Query params: `?status=&page=1&limit=20`

### 2\.4 Modul Kehadiran Peserta **\[REVISI: role admin → panitia\]**

**GET ****`/events/:id/participants`**, **PATCH ****`/attendance/:registration_id`**

- Auth: Bearer Token \(role: **panitia**\) \+ ownership check \(`event.created_by === req.user.id`\)\.

- Struktur request/response tidak berubah dari dokumen Sprint 2 awal\.

### 2\.5 Modul Dashboard **\[REVISI: dipecah jadi 2 — panitia \& admin\]**

**GET ****`/panitia/dashboard/stats`** **\[BARU, menggantikan ****`/admin/dashboard/stats`**** lama\]**

- Auth: Bearer Token \(role: panitia\)

- Scope: hanya event milik panitia yang login \(`created_by = req.user.id`\)\.

- Response: sama seperti `GET /admin/dashboard/stats` versi lama \(total\_events, total\_participants, upcoming\_events\)\.

**GET ****`/admin/dashboard/stats`** **\[BARU, definisi ulang untuk role admin\]**

- Auth: Bearer Token \(role: admin\)

- Response `200`:

```JSON
{
  "success": true,
  "data": {
    "total_organizations": 6,
    "total_panitia_accounts": 6,
    "total_events_all": 42,
    "pending_verification_count": 5,
    "total_participants_platform": 1280
  }
}
```

- Scope: **lintas seluruh organisasi/panitia**, bukan hanya milik satu akun — beda konsep dengan dashboard panitia\.

### 2\.6 Modul Verifikasi Event \(Admin\) **\[BARU\]**

**GET ****`/admin/events`**

- Auth: Bearer Token \(role: admin\)

- Query params: `?status=pending_verification&page=1&limit=20`

- Menampilkan event dari **semua panitia**, dengan info `organization_name` panitia pembuat, untuk keperluan review\.

**PATCH ****`/admin/events/:id/verify`**

- Auth: Bearer Token \(role: admin\)

- Request Body \(approve\):

```JSON
{ "decision": "approve" }
```

- Request Body \(reject\):

```JSON
{ "decision": "reject", "rejection_reason": "Tanggal event bentrok dengan event lain di lokasi yang sama" }
```

- Efek: `approve` → `status = 'published'`, isi `verified_by`/`verified_at`\. `reject` → `status = 'rejected'`, isi `rejection_reason`\.

- Error `400` \(`code: VALIDATION_ERROR`\): `decision` bukan `approve`/`reject`, atau `rejection_reason` kosong saat reject\.

- Error `409` \(`code: INVALID_STATUS_TRANSITION`\): event yang di\-target bukan berstatus `pending_verification`\.

### 2\.7 Modul Kelola Akun Panitia \(Admin\) **\[BARU, menggantikan Bab 3 dokumen lama\]**

**POST ****`/admin/panitia`**

- Auth: Bearer Token \(role: admin\)

- Request Body:

```JSON
{
  "name": "Panitia BEM",
  "email": "bem@kampus.ac.id",
  "password": "TempPassword123!",
  "organization_name": "BEM"
}
```

- Membuat akun baru dengan `role: 'panitia'` langsung \(bukan lewat `/auth/register` publik\)\.

- Response `201`: data akun panitia baru\.

- Error `409` \(`code: EMAIL_EXISTS`\)\.

**GET ****`/admin/panitia`**

- Auth: Bearer Token \(role: admin\)

- Response: daftar semua akun panitia beserta `organization_name`\.

**PUT ****`/admin/panitia/:id`**

- Auth: Bearer Token \(role: admin\)

- Untuk update `organization_name` atau nonaktifkan akun panitia \(mis\. field `is_active`, perlu ditambahkan ke skema `users` jika opsi ini dipakai — *belum masuk ERD di atas, perlu diputuskan tim*\)\.

---

## 3\. Security Checklist Tambahan **\[BARU\]**

* [ ] Endpoint POST /admin/panitia hanya bisa diakses role admin — dites eksplisit agar panitia tidak bisa membuat akun panitia lain\.

* [ ] Endpoint PATCH /admin/events/:id/verify memvalidasi status transition \(tidak bisa verify event yang belum pending\_verification\)\.

* [ ] rejection\_reason disanitasi dari tag HTML/script \(sama seperti description di Bab Security Checklist dokumen awal\)\.

---

## 4\. Yang Perlu Didiskusikan Tim \(Belum Final\)

1. Apakah edit `event_date`/`quota` pada event yang sudah `published` otomatis menurunkan status ke `pending_verification` lagi, atau dibiarkan langsung berubah tanpa re\-verifikasi?

2. Apakah akun panitia perlu bisa dinonaktifkan \(`is_active`\) oleh admin, atau cukup dihapus manual lewat Supabase Table Editor untuk skala MVP?

3. Siapa yang membuat akun admin pertama \(superadmin\)? Rekomendasi: tetap seed manual lewat Supabase Table Editor, sama seperti opsi yang direkomendasikan di dokumen Sprint 2 awal untuk akun admin di model lama\.

---

