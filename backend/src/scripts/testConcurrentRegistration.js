const axios = require('axios');
require('dotenv').config();

// Konfigurasi dinamis dari Environment Variable atau CLI Parameter
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api/v1';
const EVENT_ID = process.env.TEST_EVENT_ID || process.argv[2];

// Membaca token JWT dari Environment Variable TEST_TOKENS (dipisahkan koma)
const rawTokens = process.env.TEST_TOKENS ? process.env.TEST_TOKENS.split(',') : [];
const TOKENS = rawTokens.map((t) => t.trim()).filter(Boolean);

async function testConcurrency() {
  if (!EVENT_ID) {
    console.error('❌ Error: TEST_EVENT_ID belum ditentukan.');
    console.log('💡 Petunjuk: Set env TEST_EVENT_ID=<uuid> atau jalankan dengan argument:');
    console.log('   node src/scripts/testConcurrentRegistration.js <EVENT_ID>\n');
    process.exit(1);
  }

  if (TOKENS.length === 0) {
    console.error('❌ Error: Tidak ada JWT token yang diberikan untuk pengujian.');
    console.log('💡 Petunjuk Security: Hindari hardcode token JWT di dalam file source code.');
    console.log('   Set env TEST_TOKENS="token1,token2" sebelum menjalankan script pengujian.\n');
    process.exit(1);
  }

  console.log(`🚀 Memulai simulasi pendaftaran serentak untuk Event ID: ${EVENT_ID}`);
  console.log(`👥 Jumlah pengguna teruji: ${TOKENS.length}\n`);

  const requests = TOKENS.map((token, index) =>
    axios
      .post(
        `${BASE_URL}/events/${EVENT_ID}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => ({ user: index + 1, status: res.status, data: res.data }))
      .catch((err) => ({
        user: index + 1,
        status: err.response ? err.response.status : 'CONN_ERROR',
        error: err.response ? err.response.data : err.message,
      }))
  );

  const results = await Promise.all(requests);

  console.log('--- Hasil Simulasi Konkurensi ---');
  results.forEach((res) => {
    console.log(`User ${res.user}: Status ${res.status} ->`, res.data || res.error);
  });
}

testConcurrency();