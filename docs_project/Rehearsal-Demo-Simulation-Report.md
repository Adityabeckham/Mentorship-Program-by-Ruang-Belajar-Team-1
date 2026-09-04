# 🎭 Task #66: Rehearsal Demo Simulation Report

**Platform:** EventHub Kampus  
**Date Executed:** 2026-09-04  
**Roles Tested:** `panitia`, `admin`, `mahasiswa`  
**Execution Status:** 🟢 **100% PASSED (ALL WORKFLOW PHASES VERIFIED)**  

---

## 📋 Executive Summary

Laporan ini mendokumentasikan hasil pengujian rehearsal demo alur lengkap (*End-to-End Rehearsal Simulation*) platform **EventHub Kampus**. Pengujian ini mensimulasikan alur kerja nyata dari 3 peranan pengguna (*3-Tier User Role*) secara sekuensial:
1. **Panitia:** Membuat event *draft* dan mengajukan verifikasi ke Admin.
2. **Admin:** Meninjau daftar pengajuan dan menyetujui event menjadi *published*.
3. **Mahasiswa:** Mengeksplorasi katalog publik, mendaftar event, dan memantau tiket digital.
4. **Panitia (Kehadiran):** Menandai presensi kehadiran (*attendance*) peserta.

---

## 🔄 Lifecycle State Machine Verification Matrix

```text
[Panitia Create] ➔ status: "draft"
       │
       ▼ (Panitia Submit /events/:id/submit)
[status: "pending_verification"]
       │
       ▼ (Admin Approve /admin/events/:id/verify)
[status: "published"]
       │
       ▼ (Mahasiswa Register /events/:id/register)
[status: "registered"]
       │
       ▼ (Panitia Mark Attendance /attendance/:registration_id)
[is_present: true]
```

---

## 🚀 Step-by-Step Rehearsal Execution Log

### Phase 1: Panitia Workflow (Event Creation & Submission)

| Step | Action & Endpoint | Request Payload | Response Code | Output State | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **1.1** | `POST /api/v1/events` | `{ title: "Grand Rehearsal Seminar AI 2026", category: "Teknologi", quota: 150 }` | `201 Created` | `status: "draft"` | 🟢 PASS |
| **1.2** | `PATCH /api/v1/events/:id/submit` | `{}` | `200 OK` | `status: "pending_verification"` | 🟢 PASS |

---

### Phase 2: Admin Workflow (Review & Verification Approval)

| Step | Action & Endpoint | Request Payload | Response Code | Output State | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **2.1** | `GET /api/v1/admin/events` | `None` | `200 OK` | `total: 1 pending event` | 🟢 PASS |
| **2.2** | `PATCH /api/v1/admin/events/:id/verify` | `{ action: "approve" }` | `200 OK` | `status: "published"` | 🟢 PASS |

---

### Phase 3: Mahasiswa Workflow (Catalog, Registration & Tickets)

| Step | Action & Endpoint | Request Payload | Response Code | Output State | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **3.1** | `GET /api/v1/events` | `None` | `200 OK` | `total: 1 published event` | 🟢 PASS |
| **3.2** | `POST /api/v1/events/:id/register` | `{}` | `201 Created` | `status: "registered"` | 🟢 PASS |
| **3.3** | `GET /api/v1/registrations/me` | `None` | `200 OK` | `digital ticket verified` | 🟢 PASS |

---

### Phase 4: Attendance Workflow (Panitia Presensi Marking)

| Step | Action & Endpoint | Request Payload | Response Code | Output State | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **4.1** | `PATCH /api/v1/attendance/:registration_id` | `{ is_present: true }` | `200 OK` | `is_present: true` | 🟢 PASS |

---

## 🧪 Automated Rehearsal Runner Verification

- **Test Script File:** [`backend/tests/rehearsal_demo.test.js`](../backend/tests/rehearsal_demo.test.js)
- **Command:**
  ```bash
  cd backend; node tests/rehearsal_demo.test.js
  ```
- **Result:**
  ```text
  ================================================================
  🎭 STARTING TASK #66 REHEARSAL DEMO SIMULATION (3-ROLE WORKFLOW)
  ================================================================
  🚩 [PHASE 1: PANITIA WORKFLOW] - PASSED 🟢
  🛡️ [PHASE 2: ADMIN WORKFLOW] - PASSED 🟢
  🎓 [PHASE 3: MAHASISWA WORKFLOW] - PASSED 🟢
  📝 [PHASE 4: ATTENDANCE WORKFLOW] - PASSED 🟢
  🎉 REHEARSAL DEMO SIMULATION COMPLETED WITH 100% SUCCESS!
  ```

---

## ✅ Sign-Off Approval

- **Role Verification:** All 3 Roles (`mahasiswa`, `panitia`, `admin`) strictly adhere to RBAC security boundaries.
- **State Machine Integrity:** Transitions validated (`draft` ➔ `pending_verification` ➔ `published` ➔ `registered` ➔ `attended`).
- **Sign-off Status:** 🟢 **APPROVED FOR FINAL PRESENTATION & DEMO**
