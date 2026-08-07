const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg'); // atau gunakan instansiasi Supabase / DB client milikmu

// Model/Query Helpers (Disesuaikan dengan koneksi DB kamu)
const supabase = require('../config/supabase');

// 1. POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    // Validation
    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    // Cek apakah email sudah terdaftar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
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
          role: role || 'mahasiswa', // default role jika tidak diisi
        },
      ])
      .select('id, nama, email, role, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
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
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Cari user berdasarkan email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Kredensial tidak valid (email/password salah)' });
    }

    // Membandingkan password inputan dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Kredensial tidak valid (email/password salah)' });
    }

    // Membuat JWT Token yang memuat payload: user id dan role
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    res.status(200).json({
      status: 'success',
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