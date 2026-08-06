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
      'policies.sql',
      'indexes.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Mengecek & Mengeksekusi migrasi: ${file}...`);
      // print first 300 chars to help debugging large SQL files
      console.log(sql.slice(0, 300).replace(/\n/g, ' '));
      try {
        await client.query(sql);
        console.log(`Sukses: ${file}`);
      } catch (fileError) {
        console.error(`Gagal menjalankan ${file}:`, fileError.message);
        console.error(fileError.stack);
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