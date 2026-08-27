const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require('../config/env');

const signAccessToken = (payload) => jwt.sign(payload, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});

const signRefreshToken = (payload) => jwt.sign(
  { ...payload, tokenType: 'refresh' },
  JWT_REFRESH_SECRET,
  { expiresIn: JWT_REFRESH_EXPIRES_IN }
);

// 1. POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    // Validation
    if (!nama || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'Nama, email, dan password wajib diisi'
      });
    }

    // Sanitize & validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'Format email tidak valid'
      });
    }

    // Cek apakah email sudah terdaftar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'Email sudah terdaftar'
      });
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
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'Email dan password wajib diisi'
      });
    }

    // Cari user berdasarkan email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Kredensial tidak valid (email/password salah)'
      });
    }

    // Membandingkan password inputan dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Kredensial tidak valid (email/password salah)'
      });
    }

    // Membuat JWT Token yang memuat payload: user id dan role
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Login berhasil',
      token,
      refreshToken,
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

// 3. POST /auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Refresh token tidak ditemukan',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    }
    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Refresh token tidak valid',
      });
    }

    const { tokenType, iat, exp, ...payload } = decoded;
    const token = signAccessToken(payload);
    const nextRefreshToken = signRefreshToken(payload);

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      token,
      refreshToken: nextRefreshToken,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Refresh token tidak valid atau sudah kadaluarsa',
      });
    }
    return next(err);
  }
};

// 4. GET /auth/me
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
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Pengguna tidak ditemukan',
      });
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
