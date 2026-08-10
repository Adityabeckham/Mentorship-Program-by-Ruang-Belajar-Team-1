const rateLimit = require('express-rate-limit');

// Rate limiter khusus untuk endpoint sensitif (Auth: Login & Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Rentang waktu: 15 menit
  max: 5, // Maksimal 5 request per IP dalam 15 menit
  standardHeaders: true, // Mengirim informasi rate limit di header `RateLimit-*`
  legacyHeaders: false, // Mematikan header X-RateLimit-* lama
  handler: (req, res, next) => {
    res.status(429).json({
      status: 'fail',
      statusCode: 429,
      message: 'Terlalu banyak percobaan akses. Silakan coba lagi setelah 15 menit.',
    });
  },
});

module.exports = {
  authLimiter,
};