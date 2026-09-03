const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const env = require('../config/env');
const AppError = require('../utils/appError');

const JWT_SECRET = env.JWT_SECRET || process.env.JWT_SECRET;
const JWT_REFRESH_SECRET =
  env.JWT_REFRESH_SECRET ||
  process.env.JWT_REFRESH_SECRET ||
  (JWT_SECRET ? `${JWT_SECRET}_refresh_secure_salt` : undefined);

const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 1. POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return next(new AppError('Nama, email, dan password wajib diisi', 400));
    }

    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Format email tidak valid', 400));
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return next(new AppError('Email sudah terdaftar', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// 2. POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email dan password wajib diisi', 400));
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return next(new AppError('Kredensial tidak valid (email/password salah)', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Kredensial tidak valid (email/password salah)', 401));
    }

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      return next(new AppError('Konfigurasi JWT server belum lengkap.', 500));
    }

    // Access Token (short-lived)
    const token = jwt.sign(
      { id: user.id, role: user.role, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    const userData = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    // Return both top-level and nested fields for 100% frontend contract compatibility
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Login berhasil',
      token,
      accessToken: token,
      refreshToken,
      user: userData,
      data: {
        token,
        accessToken: token,
        refreshToken,
        user: userData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
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

// 4. POST /api/v1/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const tokenInput =
      req.body?.refreshToken ||
      req.body?.refresh_token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!tokenInput) {
      return next(new AppError('Refresh token diperlukan.', 400));
    }

    if (!JWT_REFRESH_SECRET || !JWT_SECRET) {
      return next(new AppError('Konfigurasi JWT server belum lengkap.', 500));
    }

    // STRICT VERIFICATION: Verify ONLY with JWT_REFRESH_SECRET
    let decoded;
    try {
      decoded = jwt.verify(tokenInput, JWT_REFRESH_SECRET);
    } catch (err) {
      return next(new AppError('Refresh token tidak valid atau telah kedaluwarsa.', 401));
    }

    // Enforce token type check (must be 'refresh' token)
    if (decoded.type !== 'refresh') {
      return next(new AppError('Token yang dikirimkan bukan refresh token.', 401));
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return next(new AppError('Payload refresh token tidak valid.', 401));
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return next(new AppError('Pengguna tidak ditemukan.', 404));
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, role: user.role, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    const userData = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    // Return both top-level and nested fields for 100% frontend contract compatibility
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Token berhasil di-refresh.',
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userData,
      data: {
        token: newAccessToken,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData,
      },
    });
  } catch (err) {
    next(err);
  }
};
