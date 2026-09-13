const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// 1. POST /admin/panitia (Membuat Akun Panitia Baru)
exports.createPanitia = async (req, res, next) => {
  try {
    const { nama, email, password, organization_name } = req.body;

    if (!nama || !email || !password) {
      return next(new AppError('Nama panitia, email, dan password wajib diisi.', 400));
    }

    const { data: existingUser, error: findErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (findErr) throw findErr;

    if (existingUser) {
      return next(new AppError('Email sudah terdaftar.', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newPanitia, error: insertErr } = await supabase
      .from('users')
      .insert([
        {
          nama,
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          role: 'panitia',
          organization_name: organization_name || null,
        },
      ])
      .select('id, nama, email, role, organization_name, created_at')
      .single();

    if (insertErr) throw insertErr;

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
      total: (panitiaList || []).length,
      data: panitiaList || [],
    });
  } catch (err) {
    next(err);
  }
};

// 3. PUT /admin/panitia/:id (Memperbarui Data Panitia)
exports.updatePanitia = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    const query = supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .eq('role', 'panitia')
      .select('id, nama, email, role, organization_name, updated_at');

    const resQuery = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();

    if (!resQuery || resQuery.error || !resQuery.data) {
      return next(new AppError('Akun panitia tidak ditemukan.', 404));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Data panitia berhasil diperbarui.',
      data: resQuery.data,
    });
  } catch (err) {
    next(err);
  }
};

// 4. DELETE /admin/panitia/:id (Menghapus Akun Panitia)
exports.deletePanitia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'panitia')
      .select('id, nama, email');

    const resQuery = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();

    if (!resQuery || resQuery.error || !resQuery.data) {
      return next(new AppError('Akun panitia tidak ditemukan.', 404));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Akun panitia berhasil dihapus dari database.',
      data: resQuery.data,
    });
  } catch (err) {
    next(err);
  }
};

// 5. GET /admin/users (Melihat Seluruh User / Filter per Role)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

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
      total: (users || []).length,
      data: users || [],
    });
  } catch (err) {
    next(err);
  }
};
