const jwt = require('jsonwebtoken');
const app = require('../server');
const supertest = require('supertest');

async function testRefreshToken() {
  console.log('==================================================');
  console.log('🔑 TESTING AUTH REFRESH TOKEN HANDLER');
  console.log('==================================================');

  const secret = process.env.JWT_SECRET || 'supersecretjwtkey123';
  const validRefreshToken = jwt.sign(
    { id: 'uuid-test-user-1', role: 'mahasiswa' },
    secret,
    { expiresIn: '1d' }
  );

  // 1. Missing Refresh Token Test
  const resMissing = await supertest(app).post('/api/v1/auth/refresh').send({});
  console.log('1. Missing Token Status:', resMissing.status, resMissing.body.message);
  if (resMissing.status !== 400) throw new Error('Expected 400 for missing token');

  // 2. Invalid Refresh Token Test
  const resInvalid = await supertest(app)
    .post('/api/v1/auth/refresh')
    .send({ refreshToken: 'invalid.jwt.token' });
  console.log('2. Invalid Token Status:', resInvalid.status, resInvalid.body.message);
  if (resInvalid.status !== 401) throw new Error('Expected 401 for invalid token');

  // 3. Valid Refresh Token Test (Mocking Supabase query)
  const supabase = require('../src/config/supabase');
  const origFrom = supabase.from;
  supabase.from = () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: { id: 'uuid-test-user-1', nama: 'Test Mahasiswa', email: 'test@student.ac.id', role: 'mahasiswa' },
          error: null,
        }),
      }),
    }),
  });

  const resValid = await supertest(app)
    .post('/api/v1/auth/refresh')
    .send({ refreshToken: validRefreshToken });

  console.log('3. Valid Refresh Response Status:', resValid.status);
  console.log('3. Received Data Keys:', Object.keys(resValid.body.data || {}));
  console.log('3. New Access Token Generated:', Boolean(resValid.body.data?.token));

  supabase.from = origFrom;

  if (resValid.status === 200 && resValid.body.data?.token) {
    console.log('\n🟢 REFRESH TOKEN VERIFICATION PASSED!\n');
  } else {
    throw new Error('Refresh token test failed');
  }
}

testRefreshToken()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Refresh Token Test Error:', err);
    process.exit(1);
  });
