require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

// JWT Secret & Token Expiration Policy
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh_secure_salt` : undefined);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Supabase Database & Service Credentials (Clean sanitization)
const sanitizeKey = (val) => (val ? val.trim().replace(/^["']|["']$/g, '') : undefined);
const SUPABASE_URL = process.env.SUPABASE_URL
  ? process.env.SUPABASE_URL.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '').replace(/\.cw$/, '.co')
  : undefined;
const SUPABASE_SERVICE_ROLE_KEY = sanitizeKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_ANON_KEY = sanitizeKey(process.env.SUPABASE_ANON_KEY);
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || sanitizeKey(process.env.SUPABASE_KEY);

const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL;

// Frontend URL & CORS Origin (Safe local defaults in development)
const defaultLocalFrontend = NODE_ENV !== 'production' ? 'http://localhost:5173' : '';
const defaultLocalCors = NODE_ENV !== 'production' ? 'http://localhost:5173,http://localhost:3000' : '';

const FRONTEND_URL = (process.env.FRONTEND_URL || defaultLocalFrontend).replace(/\/+$/, '');
const CORS_ORIGIN = process.env.CORS_ORIGIN || defaultLocalCors;

// Validasi Environment Variables Kritis
if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET tidak ditemukan di .env! Pastikan .env sudah dikonfigurasi.');
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ WARNING: SUPABASE_URL atau SUPABASE_KEY belum diset di .env!');
}

module.exports = {
  NODE_ENV,
  PORT,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  SUPABASE_URL,
  SUPABASE_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY,
  DATABASE_URL,
  DIRECT_URL,
  FRONTEND_URL,
  CORS_ORIGIN,
};
