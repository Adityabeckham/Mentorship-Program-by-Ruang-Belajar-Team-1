require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const env = require('./src/config/env');

const healthRoutes = require('./src/routes/healthRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const userRoutes = require('./src/routes/userRoutes');
const sanitizeInput = require('./src/middlewares/sanitizeMiddleware');

const app = express();
const PORT = env.PORT || process.env.PORT || 5000;

app.use(helmet());

// CORS Best Practice: Hanya mengizinkan akses dari Frontend URL resmi (.env)
const allowedOrigins = [
  env.FRONTEND_URL,
  env.CORS_ORIGIN,
]
  .filter(Boolean)
  .map((url) => (url.endsWith('/') ? url.slice(0, -1) : url));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const formattedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(formattedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error('Akses CORS ditolak untuk origin: ' + origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 EventHub Kampus API Server is running',
    healthCheck: '/api/v1/health',
    version: '1.0.0',
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', attendanceRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', userRoutes);

app.use((req, res, next) => {
  const error = new Error('Route ' + req.originalUrl + ' tidak ditemukan!');
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});

// Tangkap unhandled promise rejections (misal koneksi DB terputus)
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Mematikan server secara teratur...');
  console.error('Reason:', reason);
});

// Tangkap synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Mematikan server...');
  console.error(err.name, err.message);
});
