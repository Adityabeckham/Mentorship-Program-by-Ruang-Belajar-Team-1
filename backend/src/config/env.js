require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;

// JWT Secret & Token Expiration Policy (Strictly read from .env)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Supabase Database & Service Credentials (Strictly read from .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL;

// Frontend URL & CORS Origin (Strictly read from .env)
const FRONTEND_URL = process.env.FRONTEND_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

if (!JWT_SECRET) {
  console.error('X ERROR: JWT_SECRET tidak ditemukan di .env! Pastikan .env sudah dibaca.');
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
  DATABASE_URL,
  DIRECT_URL,
  FRONTEND_URL,
  CORS_ORIGIN,
};
