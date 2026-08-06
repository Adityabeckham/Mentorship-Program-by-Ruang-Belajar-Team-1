// Middleware penanganan error terpusat
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[SERVER ERROR LOG] ${err.stack}`);
  } else {
    console.warn(`[CLIENT ERROR ${statusCode}] ${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode,
    message,
    // Sembunyikan detail stack trace jika di lingkungan produksi atau bukan server error
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;