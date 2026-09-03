const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

let lastUpdatePayload = null;

// 1. Mock Supabase Cloud Client with payload tracking for atomic update assertions
jest.mock('../src/config/supabase', () => {
  return {
    from: jest.fn().mockImplementation((table) => {
      return {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockImplementation((payload) => {
          lastUpdatePayload = payload;
          return {
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockImplementation(async () => {
              return {
                data: {
                  id: 'mock-event-id',
                  created_by: 'panitia-uuid-1',
                  status: payload.status || 'draft',
                  title: payload.title || 'Draft Event',
                },
                error: null,
              };
            }),
          };
        }),
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

// 2. Mock jsonwebtoken to test REAL production authenticateToken middleware
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-panitia-token') {
      return { id: 'panitia-uuid-1', role: 'panitia' };
    }
    if (token === 'valid-admin-token') {
      return { id: 'admin-uuid-1', role: 'admin' };
    }
    if (token === 'valid-mahasiswa-token') {
      return { id: 'mahasiswa-uuid-1', role: 'mahasiswa' };
    }
    throw new Error('Invalid token');
  }),
}));

const eventController = require('../src/controllers/eventController');
const { authenticateToken } = require('../src/middlewares/authMiddleware');
const { authorizeRoles } = require('../src/middlewares/roleMiddleware');
const sanitizeInput = require('../src/middlewares/sanitizeMiddleware');
const errorHandler = require('../src/middlewares/errorHandler');

// Setup Express app mounting REAL production middlewares
const app = express();
app.use(express.json());
app.use(sanitizeInput);

// Route testing Panitia update event (Real authenticateToken & authorizeRoles)
app.put(
  '/api/v1/events/:id',
  authenticateToken,
  authorizeRoles('panitia', 'admin'),
  eventController.updateEvent
);

// Route testing Admin verify event (Real authenticateToken & authorizeRoles)
app.patch(
  '/api/v1/admin/events/:id/verify',
  authenticateToken,
  authorizeRoles('admin'),
  eventController.verifyEventByAdmin
);

app.use(errorHandler);

describe('Sprint 6 Security Review & Guard Verification (Production Middlewares)', () => {
  beforeEach(() => {
    lastUpdatePayload = null;
  });

  describe('1. Event Status Transition Guards', () => {
    it('harus menolak transisi status ilegal (panitia tidak dapat merubah status ke published via PUT)', async () => {
      const res = await request(app)
        .put('/api/v1/events/mock-event-id')
        .set('Authorization', 'Bearer valid-panitia-token')
        .send({
          title: 'Updated Event Title',
          status: 'published', // Transisi ilegal dari panitia
        });

      expect(res.statusCode).toBe(200);
      // Assert that update payload passed to database specifically EXCLUDES status property
      expect(lastUpdatePayload).not.toBeNull();
      expect(lastUpdatePayload).not.toHaveProperty('status');
      expect(res.body.data.status).toBe('draft');
    });

    it('harus menolak verifikasi admin dengan HTTP 400 jika status event bukan pending_verification', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/events/mock-event-id/verify')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          action: 'approve',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Hanya event berstatus 'pending_verification' yang dapat diverifikasi oleh admin");
    });
  });

  describe('2. Real Production Endpoint Guards & RBAC Verification', () => {
    it('harus mengembalikan 401 Unauthorized jika request tanpa token authorization', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/events/mock-event-id/verify')
        .send({ action: 'approve' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Akses ditolak. Token tidak ditemukan.');
    });

    it('harus mengembalikan 403 Forbidden jika role mahasiswa mencoba mengakses endpoint admin', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/events/mock-event-id/verify')
        .set('Authorization', 'Bearer valid-mahasiswa-token')
        .send({ action: 'approve' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Akses ditolak');
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
