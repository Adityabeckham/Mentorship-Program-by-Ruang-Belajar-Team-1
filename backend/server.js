require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./src/config/env');

// Middlewares
const errorHandler = require('./src/middlewares/errorHandler');
const sanitizeInput = require('./src/middlewares/sanitizeMiddleware');

// Routes
const healthRoutes = require('./src/routes/healthRoutes');
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = env.PORT || process.env.PORT || 5000;

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS Whitelist Domain Restriction
const allowedOrigins = [
  env.FRONTEND_URL || process.env.FRONTEND_URL,
  env.CORS_ORIGIN || process.env.CORS_ORIGIN,
  'http://localhost:5173', // Vite Dev Local
  'http://localhost:3000',
]
  .filter(Boolean)
  .map((url) => (url.endsWith('/') ? url.slice(0, -1) : url));

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, mobile app, Postman)
      if (!origin) return callback(null, true);

      const formattedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(formattedOrigin)
      ) {
        return callback(null, true);
      }

      // Beri properti statusCode 403 agar tidak memicu 500 di error handler
      const corsError = new Error(`Akses CORS ditolak untuk origin: ${origin}`);
      corsError.statusCode = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// 3. Body Parsers & Input Sanitization
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (typeof sanitizeInput === 'function') {
  app.use(sanitizeInput);
}

// 4. Base & Root Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 EventHub Kampus API Server is running',
    healthCheck: '/api/v1/health',
    version: '2.0.0',
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// 5. Mounting Modules (Base URL: /api/v1 Sesuai API Contract v2)
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', attendanceRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', userRoutes);

// 6. 404 Route Not Found Fallback
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan!`);
  error.statusCode = 404;
  next(error);
});

// 7. Centralized Error Handling Middleware (Wajib ditaruh paling bawah)
app.use(errorHandler);

// 8. Server Listen & Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});

// Tangani Unhandled Rejections (misal promise database gagal tanpa catch)
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] UNHANDLED REJECTION! Mematikan server secara terkendali...');
  console.error('Reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Tangani Uncaught Exceptions (synchronous code bug)
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] UNCAUGHT EXCEPTION! Mematikan server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// app.get('/test-crash', (req, res) => {
//   // Sengaja memicu unhandled rejection
//   Promise.reject(new Error('Simulasi unhandled rejection database error!'));
//   res.send('Crash triggered');
// });

module.exports = app;