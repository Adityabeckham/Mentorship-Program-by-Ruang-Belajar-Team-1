require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./src/routes/healthRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const userRoutes = require('./src/routes/userRoutes');

// validator
const sanitizeInput = require('./src/middlewares/sanitizeMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middlewares
app.use(cors()); // Memungkinkan integrasi dengan React Frontend
app.use(express.json()); // Parsing HTTP Request Body JSON
app.use(express.urlencoded({ extended: true }));

// Global Sanitasi Input (Melindungi dari XSS di seluruh endpoint)
app.use(sanitizeInput);

// 2. Base API Routes -(Sesuai API Contract Base URL)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 EventHub Kampus API Server is running',
    healthCheck: '/api/v1/health',
    version: '1.0.0'
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes); // Base Route untuk Autentikasi
app.use('/api/v1', eventRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', userRoutes);

// 3. Fallback Route Not Found (404)
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan!`);
  error.statusCode = 404;
  next(error);
});

// 4. Centralized Error Handling Middleware
app.use(errorHandler);

// 5. Running Server
app.listen(PORT, () => {
  console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
});