const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');
const supabase = require('../src/config/supabase'); // The supabase instance to mock
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Setup express app for testing
const app = express();
app.use(express.json());
// Mock rate limiter for tests to prevent delays/failures
jest.mock('../src/middlewares/rateLimitMiddleware', () => ({
  authLimiter: (req, res, next) => next(),
}));
app.use('/auth', authRoutes);

// Mock dependencies
jest.mock('../src/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('testSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn(),
}));

describe('Auth Endpoints & Security', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Review Verification', () => {
    it('should verify password hashing uses bcrypt with salt', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ data: null }); // No existing user
      supabase.single.mockResolvedValueOnce({ data: { id: 1, email: 'test@test.com' }, error: null });
      
      await request(app)
        .post('/auth/register')
        .send({ nama: 'Test', email: 'test@test.com', password: 'password123' });

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'testSalt');
    });

    it('should verify token generation uses proper expiration', async () => {
      // Mock existing user for login
      supabase.maybeSingle.mockResolvedValueOnce({ 
        data: { id: 1, email: 'test@test.com', password: 'hashedPassword123', role: 'mahasiswa' } 
      });
      bcrypt.compare.mockResolvedValueOnce(true); // Password is valid
      
      const jwtSpy = jest.spyOn(jwt, 'sign');
      
      await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(jwtSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.objectContaining({ expiresIn: process.env.JWT_EXPIRES_IN || '1d' })
      );
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ data: null }); // No existing user
      supabase.single.mockResolvedValueOnce({ 
        data: { id: 1, nama: 'Test User', email: 'test@test.com', role: 'mahasiswa' },
        error: null 
      });

      const res = await request(app)
        .post('/auth/register')
        .send({ nama: 'Test User', email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.email).toEqual('test@test.com');
    });

    it('should return error if email already exists', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ data: { id: 1 } }); // User exists

      const res = await request(app)
        .post('/auth/register')
        .send({ nama: 'Test User', email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Email sudah terdaftar');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ 
        data: { id: 1, nama: 'Test User', email: 'test@test.com', password: 'hashedPassword123', role: 'mahasiswa' } 
      });
      bcrypt.compare.mockResolvedValueOnce(true); // Valid password

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toEqual('test@test.com');
    });

    it('should return 401 with invalid credentials', async () => {
      supabase.maybeSingle.mockResolvedValueOnce({ 
        data: { id: 1, password: 'hashedPassword123' } 
      });
      bcrypt.compare.mockResolvedValueOnce(false); // Invalid password

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Kredensial tidak valid');
    });
  });
});
