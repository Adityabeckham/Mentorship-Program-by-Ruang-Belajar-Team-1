const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Health Check Endpoint
router.get('/health', async (req, res, next) => {
  try {
    // Cek koneksi sederhana ke Supabase
    const { data, error } = await supabase.from('users').select('id').limit(1);

    res.status(200).json({
      status: 'success',
      message: 'Server Express & Supabase berjalan dengan baik!',
      databaseConnected: !error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err); // Diteruskan ke errorHandler
  }
});

module.exports = router;