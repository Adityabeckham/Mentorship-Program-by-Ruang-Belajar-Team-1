const errorHandler = (err, req, res, next) => {
  // 1. Ambil status code dari properti err.statusCode, err.status, atau default 500
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // 2. TANGKAP ERROR DATABASE POSTGRES / SUPABASE (Mencegah 500 false-positive)
  if (err.code && typeof err.code === 'string') {
    // 23505: Unique constraint violation (Duplikasi data, misal email/registration ganda)
    if (err.code === '23505') {
      statusCode = 400;
      message = 'Data sudah ada (duplikasi data).';
    }
    // 22P02: Invalid text representation (UUID invalid / salah format ID)
    else if (err.code === '22P02') {
      statusCode = 400;
      message = 'Format ID / UUID tidak valid.';
    }
    // 23503: Foreign key constraint violation
    else if (err.code === '23503') {
      statusCode = 404;
      message = 'Data referensi (ID) tidak ditemukan.';
    }
  }

  const isServerError = statusCode >= 500;

  // 3. Logging yang terstruktur
  if (isServerError) {
    console.error(`[SERVER ERROR LOG] ${req.method} ${req.originalUrl} - ${err.stack || err}`);
  } else {
    console.warn(`[CLIENT ERROR ${statusCode}] ${req.method} ${req.originalUrl} - ${message}`);
  }

  // 4. Response JSON yang konsisten
  res.status(statusCode).json({
    status: isServerError ? 'error' : 'fail',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && isServerError && { stack: err.stack }),
  });
};

module.exports = errorHandler;