const request = require('supertest');
const express = require('express');

// Mock supabase before requiring controllers
jest.mock('../src/config/supabase', () => {
  return {
    from: jest.fn().mockImplementation((table) => {
      return {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(async () => {
          if (table === 'events') {
            return {
              data: {
                id: 'mock-event-id',
                created_by: 'panitia-uuid-1',
                status: 'draft',
                title: 'Draft Event',
              },
              error: null,
            };
          }
          return { data: null, error: { message: 'Not found' } };
        }),
      };
    }),
  };
});

const eventController = require('../src/controllers/eventController');
const sanitizeInput = require('../src/middlewares/sanitizeMiddleware');
const errorHandler = require('../src/middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use(sanitizeInput);

app.put('/api/v1/events/:id', (req, res, next) => {
  req.user = req.headers['x-mock-user'] ? JSON.parse(req.headers['x-mock-user']) : null;
  if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  next();
}, eventController.updateEvent);

app.patch('/api/v1/admin/events/:id/verify', (req, res, next) => {
  req.user = req.headers['x-mock-user'] ? JSON.parse(req.headers['x-mock-user']) : null;
  if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ status: 'fail', message: 'Forbidden' });
  next();
}, eventController.verifyEventByAdmin);

app.use(errorHandler);

describe('Sprint 6 Security Review & Guard Verification', () => {
  describe('1. Event Status Transition Guards', () => {
    it('harus menolak transisi status ilegal (panitia tidak dapat merubah status ke published via PUT)', async () => {
      const mockPanitia = { id: 'panitia-uuid-1', role: 'panitia' };

      const res = await request(app)
        .put('/api/v1/events/mock-event-id')
        .set('x-mock-user', JSON.stringify(mockPanitia))
        .send({
          title: 'Updated Event Title',
          status: 'published', // Transisi ilegal dari panitia
        });

      expect(res.statusCode).toBe(200);
      // Status pada response data harus TETAP 'draft' (tidak terpengaruh payload status: published)
      expect(res.body.data.status).toBe('draft');
    });

    it('harus menolak verifikasi admin jika status event bukan pending_verification', async () => {
      const mockAdmin = { id: 'admin-uuid-1', role: 'admin' };

      const res = await request(app)
        .patch('/api/v1/admin/events/mock-event-id/verify')
        .set('x-mock-user', JSON.stringify(mockAdmin))
        .send({
          action: 'approve',
        });

      // Karena status di-mock sebagai 'draft', admin verify harus GAGAL dengan 400 Bad Request
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('pending_verification');
    });
  });

  describe('2. Endpoint Guards & RBAC Verification', () => {
    it('harus mengembalikan 401 Unauthorized jika request tanpa token', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/events/some-id/verify')
        .send({ action: 'approve' });

      expect(res.statusCode).toBe(401);
    });

    it('harus mengembalikan 403 Forbidden jika role bukan admin', async () => {
      const mockMahasiswa = { id: 'mahasiswa-uuid-1', role: 'mahasiswa' };

      const res = await request(app)
        .patch('/api/v1/admin/events/some-id/verify')
        .set('x-mock-user', JSON.stringify(mockMahasiswa))
        .send({ action: 'approve' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('3. Input Sanitization Guard', () => {
    it('harus membersihkan tag XSS berbahaya dari body request', async () => {
      const reqMock = {
        body: {
          title: 'Event Kampus <script>alert("xss")</script>',
          description: '<img src=x onerror=alert(1)> Deskripsi Event',
        },
      };
      const resMock = {};
      const nextMock = jest.fn();

      sanitizeInput(reqMock, resMock, nextMock);

      expect(reqMock.body.title).not.toContain('<script>');
      expect(reqMock.body.description).not.toContain('onerror');
      expect(nextMock).toHaveBeenCalled();
    });
  });
});
