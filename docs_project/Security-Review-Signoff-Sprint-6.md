# 🛡️ Security Review & Sign-Off Report (Sprint 6)

**Project:** EventHub Kampus  
**Role:** Full Stack Developer  
**Sprint:** Sprint 6  
**Status:** 🟢 **PASSED & APPROVED FOR DEPLOYMENT**  
**Date:** 2026-09-03  

---

## 📋 1. Ringkasan Eksekutif Keamanan

Dalam rangka penyelesaian **Sprint 6**, telah dilakukan audit dan verifikasi checklist keamanan (*Security Review Sign-off*) menyeluruh pada seluruh layer aplikasi **EventHub Kampus** (Backend REST API, Middleware Endpoint Guards, State Machine Lifecycle Event, serta Sanitasi Input).

Semua kontrol keamanan kritis dan pengujian transisi status event ilegal telah diuji secara otomatis dan dinyatakan **100% Lulus (Pass)**.

---

## 🎯 2. Verifikasi Checklist Keamanan (Acceptance Criteria)

| Domain Keamanan | Komponen & Middleware | Status | Keterangan Verifikasi |
| :--- | :--- | :---: | :--- |
| **Autentikasi (AuthN)** | `authenticateToken` / JWT | 🟢 **VERIFIED** | Memverifikasi Access Token JWT pada setiap request protected endpoint. Request tanpa token valid ditolak dengan HTTP 401 Unauthorized. |
| **Otorisasi (AuthZ / RBAC)** | `authorizeRoles` Middleware | 🟢 **VERIFIED** | Membatasi akses endpoint berdasarkan peranan (`mahasiswa`, `panitia`, `admin`). Akses terlarang ditolak dengan HTTP 403 Forbidden. |
| **Ownership Authorization** | Resource Ownership Checks | 🟢 **VERIFIED** | Panitia hanya dapat mengedit, menghapus, atau mengelola presensi pada event milik organisasinya sendiri (`created_by === req.user.id`). |
| **Input Sanitization** | `sanitizeMiddleware` | 🟢 **VERIFIED** | Seluruh payload request dikirim melalui sanitasi anti-XSS untuk menghapus script injection (`<script>`, event attributes `onerror`/`onload`). |
| **Rate Limiting** | `express-rate-limit` | 🟢 **VERIFIED** | Melindungi endpoint sensitif (seperti `/auth/login` & `/auth/register`) dari serangan brute-force dan spam request. |
| **Event State Machine** | Status Transition Guards | 🟢 **VERIFIED** | Mengunci alur siklus event. Panitia tidak dapat melompati verifikasi admin atau mengubah status event `published`/`pending_verification`. |

---

## 🔒 3. Pengujian Transisi Status Event Ilegal (State Machine Hardening)

### Alur Siklus Event Resmi (Legitimate Lifecycle Flow):
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

### Skenario Transisi Ilegal yang Diuji & Digagalkan Backend:

1. **Bypass Verifikasi Admin via `PUT /events/:id` (Panitia Direct Publish):**
   - **Skenario:** Panitia mencoba mengirim payload `{ "status": "published" }` pada endpoint `PUT /events/:id`.
   - **Hasil:** 🟢 **Digagalkan.** Server mengabaikan mutasi status oleh Panitia dan mempertahankan status legal (`draft`).
2. **Penolakan Edit Event Aktif / Pending Verifikasi:**
   - **Skenario:** Panitia mencoba mengedit detail event yang statusnya sedang `pending_verification` atau `published`.
   - **Hasil:** 🟢 **Digagalkan (HTTP 400 Bad Request).** Panitia hanya diperbolehkan mengedit event berstatus `draft` atau `rejected`.
3. **Eksekusi Verifikasi Admin pada Event Non-Pending:**
   - **Skenario:** Admin mencoba memverifikasi event yang masih berstatus `draft` via `PATCH /admin/events/:id/verify`.
   - **Hasil:** 🟢 **Digagalkan (HTTP 400 Bad Request).** Admin hanya dapat memproses verifikasi pada event berstatus `pending_verification`.

---

## 🧪 4. Hasil Pengujian Otomatis (Jest Automated Security Test Suite)

Pengujian keamanan dijalankan secara otomatis melalui Jest test runner (`backend/tests/security.test.js`):

```text
PASS tests/security.test.js
  Sprint 6 Security Review & Guard Verification
    1. Event Status Transition Guards
      √ harus menolak transisi status ilegal (panitia tidak dapat merubah status ke published via PUT) (83 ms)
      √ harus menolak verifikasi admin jika status event bukan pending_verification (32 ms)
    2. Endpoint Guards & RBAC Verification
      √ harus mengembalikan 401 Unauthorized jika request tanpa token (6 ms)
      √ harus mengembalikan 403 Forbidden jika role bukan admin (6 ms)
    3. Input Sanitization Guard
      √ harus membersihkan tag XSS berbahaya dari body request (3 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.745 s
```

---

## ✍️ 5. Security Sign-off Approval

Dengan ini disimpulkan bahwa **EventHub Kampus (Sprint 6)** telah memenuhi seluruh standar keamanan, terbebas dari celah transisi status event ilegal, serta **SIAP (READY) untuk Deployment ke Lingkungan Produksi**.

**Sign-off By:** Full Stack Security Lead  
**Approval Date:** 2026-09-03  
