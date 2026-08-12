# Laporan Hasil Pengujian & Security Review (Task #79)

## 1. Automated Testing (Unit Tests)
**Status:** ✅ Lulus (Passed)
Semua endpoint autentikasi telah diuji menggunakan Jest dan Supertest.

**Cakupan Endpoint:**
- **POST `/auth/register`**: 
  - Menguji input valid menghasilkan status HTTP 201.
  - Memverifikasi respon jika email sudah ada (status 400).
- **POST `/auth/login`**:
  - Menguji kredensial valid (berhasil mengembalikan JWT).
  - Menguji kredensial salah (password / email tidak cocok) dengan respon 401.
- **GET `/auth/me`**:
  - Tervalidasi keamanannya dengan *authorization header*. (Sudah dicek bersama middleware `verifyToken`).

## 2. Security Review (Celah Keamanan)

### A. Password Hashing
- **Metode**: Menggunakan `bcryptjs`.
- **Konfigurasi**: *Salt rounds* dikonfigurasi ke 10 (`bcrypt.genSalt(10)`).
- **Status**: ✅ **Aman**. Salt round sebesar 10 telah sesuai standar modern dan memakan waktu wajar untuk mencegah metode peretasan *brute-force* atau *rainbow table*.

### B. JWT Token Expiration
- **Metode**: `jsonwebtoken`.
- **Konfigurasi Expired**: `process.env.JWT_EXPIRES_IN || '1d'`.
- **Kondisi Secret**: `process.env.JWT_SECRET || 'supersecretjwtkey123'`.
- **Status**: ⚠️ **Aman (dengan catatan)**. Expiration `1d` cukup aman, tetapi `secret` memiliki *fallback string* secara *hardcode* di dalam repository.

### C. Proteksi Brute-force & XSS
- **Metode**: `express-rate-limit` dan `express-xss-sanitizer`.
- **Status**: ✅ **Aman**. Sistem membatasi jumlah login/register berulang pada endpoint `/auth` dan memfilter input XSS secara global.

## 3. Rekomendasi Perbaikan (Action Items)

Meskipun sistem sudah berjalan dengan baik, ini adalah beberapa celah minor yang kami rekomendasikan untuk di-update di masa mendatang:

1. **Hapus Hardcode Secret JWT**: 
   - Di file `authController.js`, hindari menggunakan fallback `'supersecretjwtkey123'`. Jika `.env` tidak menyertakan `JWT_SECRET`, server harus langsung `throw Error` agar tim menyadari bahwa variabel tidak ada (mencegah server berjalan di *production* tanpa kredensial yang aman).
2. **Kombinasi Refresh Token (Advanced)**:
   - Jika sistem di-scaling lebih besar, ubah *token expiration* dari `1d` menjadi lebih singkat (misal `15m` atau `1h`), dan implementasikan sistem *Refresh Token* via HttpOnly Cookies agar lebih tahan dari serangan XSS secara absolut.
3. **Password Strength Validation**:
   - Belum ada validasi *regex* untuk tingkat kesulitan password (misalnya harus mengandung angka/karakter khusus). Saat ini password minimum apa pun bisa lolos selama *required*. 

---
**Reviewer:** Ahmad Kurnia (@AhmadKurnia13)
**Role:** Full Stack Developer
**Terkait Issue:** #79
