const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// 1. POST /admin/panitia (Membuat Akun Panitia Baru)
exports.createPanitia = async (req, res, next) => {
  try {
    const { nama, email, password, organization_name } = req.body;

    if (!nama || !email || !password) {
      // PERUBAHAN: Menggunakan AppError untuk 400 Bad Request
      return next(new AppError('Nama panitia, email, dan password wajib diisi.', 400));
    }

    // Cek duplikasi email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      // PERUBAHAN: Menggunakan AppError
      return next(new AppError('Email sudah terdaftar.', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user baru dengan role 'panitia'
    const { data: newPanitia, error } = await supabase
      .from('users')
      .insert([
        {
          nama,
          email,
          password: hashedPassword,
          role: 'panitia',
          organization_name: organization_name || null,
        },
      ])
      .select('id, nama, email, role, organization_name, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Akun panitia berhasil dibuat.',
      data: newPanitia,
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /admin/panitia (Mendapatkan Daftar Seluruh Panitia Terdaftar)
exports.getPanitiaList = async (req, res, next) => {
  try {
    const { data: panitiaList, error } = await supabase
      .from('users')
      .select('id, nama, email, role, organization_name, created_at, updated_at')
      .eq('role', 'panitia')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: panitiaList.length,
      data: panitiaList,
    });
  } catch (err) {
    next(err);
  }
};

// 3. PUT /admin/panitia/:id (Memperbarui Data Panitia)
exports.updatePanitia = async (req, res, next) => {
  try {
    const { id } = req.params;
    // PERUBAHAN 1: Tambahkan organization_name di destructuring req.body
    const { nama, email, password, organization_name } = req.body;

    const updatePayload = {};
    if (nama) updatePayload.nama = nama;
    if (email) updatePayload.email = email;
    if (organization_name) updatePayload.organization_name = organization_name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }
    updatePayload.updated_at = new Date();

    const { data: updatedPanitia, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .eq('role', 'panitia') // Memastikan target yang diubah ber-role panitia
      .select('id, nama, email, role, organization_name, updated_at')
      .single();

    if (error || !updatedPanitia) {
      // PERUBAHAN 2: Menggunakan AppError untuk 404 Not Found
      return next(new AppError('Akun panitia tidak ditemukan.', 404));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Data panitia berhasil diperbarui.',
      data: updatedPanitia,
    });
  } catch (err) {
    next(err);
  }
};

// 4. GET /admin/users (Melihat Seluruh User / Filter per Role)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query; // Opsional: ?role=mahasiswa / ?role=panitia

    let query = supabase
      .from('users')
      .select('id, nama, email, role, organization_name, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};