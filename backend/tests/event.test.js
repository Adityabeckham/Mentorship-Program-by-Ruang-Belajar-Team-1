const request = require('supertest');
const app = require('../server');
const supabase = require('../src/config/supabase');

describe('GET /api/v1/events', () => {
  it('harus mengembalikan status 200 dan format JSON yang benar', async () => {
    const origFrom = supabase.from;
    supabase.from = () => ({
      select: function () { return this; },
      is: function () { return this; },
      eq: function () { return this; },
      order: function () { return this; },
      range: function () { return this; },
      then: (resolve) => resolve({ data: [{ id: '1', title: 'Event Test', status: 'published' }], count: 1, error: null }),
    });

    const res = await request(app).get('/api/v1/events');
    supabase.from = origFrom;
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});
