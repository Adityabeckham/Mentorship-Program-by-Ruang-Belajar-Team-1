const request = require('supertest');
const app = require('../app'); // File utama express Anda

describe('GET /api/events', () => {
  it('harus mengembalikan status 200 dan format JSON yang benar', async () => {
    const res = await request(app).get('/api/events');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});