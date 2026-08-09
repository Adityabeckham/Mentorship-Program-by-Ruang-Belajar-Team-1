require('dotenv').config();
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
console.log('Database connection string:', connectionString);

if (!connectionString) {
  console.warn('⚠️ Warning: DATABASE_URL tidak ditemukan di .env! Database connection mungkin tidak terhubung.');
}

// Konfigurasi postgres connection pool yang scalable untuk production & cloud DB (Supabase)
const sql = postgres(connectionString || 'postgres://postgres:postgres@localhost:5432/eventhub', {
  max: 10,                 // Maksimum koneksi aktif di pool
  idle_timeout: 20,        // Waktu tunggu idle sebelum koneksi ditutup (detik)
  connect_timeout: 10,     // Waktu batas timeout koneksi (detik)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = sql;