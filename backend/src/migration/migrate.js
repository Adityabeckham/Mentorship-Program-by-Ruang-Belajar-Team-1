require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const runMigrations = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Diperlukan untuk koneksi Supabase Cloud
  });

  try {
    await client.connect();
    console.log('Terhubung ke Database Supabase...');

    // Daftar file migrasi berurutan
    const migrationFiles = [
      'enums.sql',
      'users.sql',
      'events.sql',
      'registrations.sql',
      'attendance.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Mengecek & Mengeksekusi migrasi: ${file}...`);
      try {
        await client.query(sql);
        console.log(`Sukses: ${file}`);
      } catch (fileError) {
        console.error(`Gagal menjalankan ${file}:`, fileError.message);
        console.log('Lanjut ke file migrasi berikutnya...');
        // continue ke file berikutnya tanpa menghentikan seluruh proses
      }
    }

    console.log('Seluruh migrasi database ERD v2 berhasil dijalankan di Supabase!');
  } catch (error) {
    console.error('Gagal mengeksekusi migrasi:', error.message);
  } finally {
    await client.end();
  }
};

runMigrations();