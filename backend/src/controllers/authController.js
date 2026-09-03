const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// 1. POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    // Validation
    if (!nama || !email || !password) {
      return next(new AppError('Nama, email, dan password wajib diisi', 400));
    }

    // Sanitize & validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Format email tidak valid', 400));
    }

    // Cek apakah email sudah terdaftar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return next(new AppError('Email sudah terdaftar', 400));
    }

    // Hashing Password dengan Bcrypt (Salt round = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          nama,
          email,
          password: hashedPassword,
          role: role && ['mahasiswa', 'panitia', 'admin'].includes(role) ? role : 'mahasiswa',
        },
      ])
      .select('id, nama, email, role, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Registrasi berhasil',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

// 2. POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email dan password wajib diisi', 400));
    }

    // Cari user berdasarkan email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return next(new AppError('Kredensial tidak valid (email/password salah)', 401));
    }

    // Membandingkan password inputan dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Kredensial tidak valid (email/password salah)', 401));
    }

    // Membuat JWT Token yang memuat payload: user id dan role
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey123', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /auth/me
exports.getMe = async (req, res, next) => {
  try {
    // req.user diset oleh authenticateToken middleware
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return next(new AppError('Pengguna tidak ditemukan', 404));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Token berhasil di-refresh',
    });
  } catch (err) {
    next(err);
  }
};
