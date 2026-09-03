require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./src/config/env');

// Middlewares
const errorHandler = require('./src/middlewares/errorHandler');
const sanitizeInput = require('./src/middlewares/sanitizeMiddleware');

// Routes
const healthRoutes = require('./src/routes/healthRoutes');
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = env.PORT || process.env.PORT || 5000;

// 1. Performance Response Timing Middleware (X-Response-Time)
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${timeMs}ms`);
    }
  });
  next();
});

// 2. Response Compression Middleware (Optimizes payload transfer size)
app.use(compression());

// 3. Security Headers (Helmet)
app.use(helmet());

// 4. Optimized O(1) CORS Whitelist Set Lookup
const allowedOriginsList = [
  env.FRONTEND_URL || process.env.FRONTEND_URL,
  env.CORS_ORIGIN || process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
]
  .filter(Boolean)
  .map((url) => (url.endsWith('/') ? url.slice(0, -1) : url));

const allowedOriginsSet = new Set(allowedOriginsList);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const formattedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

      if (
        allowedOriginsSet.size === 0 ||
        allowedOriginsSet.has('*') ||
        allowedOriginsSet.has(formattedOrigin)
      ) {
        return callback(null, true);
      }

      const corsError = new Error(`Akses CORS ditolak untuk origin: ${origin}`);
      corsError.statusCode = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// 5. Body Parsers & Optimized Conditional Input Sanitization
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Skip input sanitization on GET/HEAD requests to reduce CPU latency
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }
  if (typeof sanitizeInput === 'function') {
    return sanitizeInput(req, res, next);
  }
  next();
});

// 6. Base & Root Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 EventHub Kampus API Server is running',
    healthCheck: '/api/v1/health',
    version: '2.0.0',
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// 7. Mounting Modules (Base URL: /api/v1)
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', userRoutes);

// 8. 404 Route Not Found Fallback
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan!`);
  error.statusCode = 404;
  next(error);
});

// 9. Centralized Error Handling Middleware
app.use(errorHandler);

// 10. Server Listen & Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] UNHANDLED REJECTION! Mematikan server secara terkendali...');
  console.error('Reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] UNCAUGHT EXCEPTION! Mematikan server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
