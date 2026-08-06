require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./src/routes/healthRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middlewares
app.use(cors()); // Memungkinkan integrasi dengan React Frontend
app.use(express.json()); // Parsing HTTP Request Body JSON
app.use(express.urlencoded({ extended: true }));

// 2. Base API Routes -(Sesuai API Contract Base URL)
app.use('/api/v1', healthRoutes);

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