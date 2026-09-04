const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const supabase = require('../src/config/supabase');

describe('Auth Endpoints & Security', () => {
  const jwtSecret = env.JWT_SECRET || 'supersecretjwtkey123';
  const refreshSecret = env.JWT_REFRESH_SECRET || `${jwtSecret}_refresh_secure_salt`;

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue a new access token from a valid refresh token', async () => {
      const origFrom = supabase.from;
      supabase.from = () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: 'uuid-user-1', nama: 'Test', email: 'test@student.ac.id', role: 'mahasiswa' },
              error: null,
            }),
          }),
        }),
      });

      const refreshToken = jwt.sign(
        { id: 'uuid-user-1', role: 'mahasiswa', type: 'refresh' },
        refreshSecret,
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      supabase.from = origFrom;

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });
});
