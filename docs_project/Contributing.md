# 🤝 Panduan Kontribusi (CONTRIBUTING.md)

Terima kasih telah berkontribusi pada proyek ini. Untuk menjaga kualitas kode dan meminimalkan konflik saat pengembangan, seluruh anggota tim wajib mengikuti panduan berikut.

---

# 📌 Kanban Workflow

Seluruh task dikelola menggunakan **GitHub Projects (Kanban)** dengan alur berikut:

```text
To Do
   ↓
In Progress
   ↓
In Review
   ↓
Done
```

### 📝 To Do
Task siap dikerjakan pada sprint berjalan.

### 🚧 In Progress
Task sedang dikerjakan oleh developer.

> **Catatan:** Setiap anggota hanya diperbolehkan mengerjakan **1 task** pada status **In Progress** agar fokus dan mengurangi bottleneck.

### 👀 In Review
Task telah selesai dikerjakan dan **Pull Request (PR)** sudah dibuat. Menunggu proses code review.

### ✅ Done
Pull Request telah disetujui dan berhasil di-merge ke branch `main`.

---

# 🏆 Golden Rules

- ❌ Dilarang melakukan **push langsung** ke branch `main`.
- 🌿 Seluruh pekerjaan wajib menggunakan **feature branch**.
- 🔀 Semua perubahan harus melalui **Pull Request (PR)**.
- 👨‍💻 Minimal **1 reviewer** harus menyetujui PR sebelum di-merge.
- ✅ Branch `main` harus selalu dalam kondisi stabil dan dapat dijalankan tanpa error.

---

# 🔄 Daily Development Workflow

## 1. Ambil Task

- Buka **GitHub Projects**.
- Pilih task pada kolom **To Do**.
- Assign task kepada diri sendiri.
- Buat branch dari Issue (**Create branch**).
- Pindahkan task ke **In Progress**.

---

## 2. Sinkronisasi Branch `main`

Sebelum mulai coding, pastikan kode lokal sudah menggunakan versi terbaru.

```bash
git checkout main
git pull origin main
```

---

## 3. Checkout Branch

Karena branch sudah dibuat melalui GitHub, jalankan:

```bash
git fetch origin
git checkout nama-branch
```

---

## 4. Mulai Development

Kerjakan task sesuai requirement.

Lakukan commit secara berkala menggunakan Conventional Commits.

Contoh:

```bash
git add .
git commit -m "feat: add login page"
```

atau

```bash
git commit -m "fix: validate login form"
```

---

## 5. Push Branch

Setelah task selesai:

```bash
git push origin nama-branch
```

---

## 6. Buat Pull Request

Buat Pull Request menuju branch **main**.

Target:

```
feature/login
      ↓
     main
```

Pada deskripsi PR, tambahkan:

```
Closes #ID_ISSUE
```

Contoh:

```
Closes #12
```

Agar Issue otomatis ditutup setelah PR di-merge.

Setelah membuat PR, pindahkan task ke kolom **In Review**.

---

## 7. Code Review

Reviewer akan memeriksa:

- Kode sesuai requirement
- Tidak ada conflict
- Build berhasil
- Tidak ada bug yang terlihat
- Penamaan kode sesuai standar

Jika reviewer memberikan masukan, lakukan perbaikan pada branch yang sama lalu push kembali.

Setelah PR disetujui dan di-merge:

- Pindahkan task ke **Done** (atau otomatis jika menggunakan GitHub Automation).
- Hapus branch feature apabila sudah tidak digunakan.

---

# 💬 Commit Message Convention

Gunakan format **Conventional Commits**.

| Type | Keterangan |
|------|------------|
| feat | Menambahkan fitur baru |
| fix | Memperbaiki bug |
| docs | Dokumentasi |
| refactor | Refactor kode |
| style | Perubahan formatting |
| test | Menambahkan atau memperbaiki testing |
| chore | Dependency atau konfigurasi |

Contoh:

```text
feat: add authentication API
fix: resolve login validation
docs: update README
refactor: simplify auth middleware
```

---

# 🚑 Mengatasi Merge Conflict

Jika Pull Request menampilkan pesan **"Can't automatically merge"**, lakukan langkah berikut:

Pastikan berada pada branch feature.

```bash
git checkout nama-branch
```

Tarik perubahan terbaru dari `main`.

```bash
git pull origin main
```

Selesaikan conflict pada file yang ditandai oleh Git.

Setelah selesai:

```bash
git add .
git commit -m "fix: resolve merge conflict"
git push origin nama-branch
```

GitHub akan memperbarui Pull Request secara otomatis.

---

# 📋 Best Practices

- Selalu pull `main` sebelum mulai bekerja.
- Satu branch hanya untuk satu Issue.
- Satu Pull Request hanya untuk satu task.
- Lakukan commit secara berkala dengan pesan yang jelas.
- Jangan mengerjakan lebih dari satu task pada status **In Progress**.
- Pastikan seluruh perubahan telah diuji sebelum membuat Pull Request.
- Komunikasikan blocker kepada tim sesegera mungkin.