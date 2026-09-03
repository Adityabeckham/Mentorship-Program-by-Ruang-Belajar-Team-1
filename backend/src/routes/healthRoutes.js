const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Health Check Endpoint (Fast Response with Timeout Guard)
router.get('/health', async (req, res, next) => {
  try {
    // Fast 1.5s timeout promise guard to prevent hanging network calls
    const dbCheckPromise = supabase.from('users').select('id').limit(1);
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Database query timeout' } }), 1500)
    );

    const { error } = await Promise.race([dbCheckPromise, timeoutPromise]);

    res.status(200).json({
      status: 'success',
      message: 'Server Express & Supabase berjalan dengan baik!',
      databaseConnected: !error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
