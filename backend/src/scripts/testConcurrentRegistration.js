const axios = require('axios');

const EVENT_ID = 'b4b34352-f762-4eef-9c54-e704d1a5d730';
const BASE_URL = 'http://localhost:5000/api/v1';

const TOKENS = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNmNiYmY2LTlmMjgtNDVmMS05YjY1LTU1MTgzMWNmODRiYiIsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3ODYxNjIyOTUsImV4cCI6MTc4NjI0ODY5NX0.BBFkzjJBp6rOdPg7qN-STKI8XdEVdEz_FsGkGz1pWVM',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkOTQwNDcwLWZiMDgtNDBhOS04MTczLTg5YTk5OWE4ZTI4OSIsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3ODYxNjM1ODUsImV4cCI6MTc4NjI0OTk4NX0.oBpK-Lgs9r0ShJq9U177ebJT3vOTal8_FH2Fq0P7BPM',
];

async function testConcurrency() {
  console.log('Memulai simulasi pendaftaran serentak...\n');

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