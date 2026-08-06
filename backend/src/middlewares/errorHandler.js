// Middleware penanganan error terpusat
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR LOG] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Sembunyikan detail stack trace jika di lingkungan produksi
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;