const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Proteksi seluruh route dengan middleware JWT
router.use(authenticateToken);

// GET /api/v1/registrations/me
router.get('/registrations/me', authenticateToken, registrationController.getMyRegistrations);

// POST /api/v1/events/:id/register
router.post('/events/:id/register', authenticateToken, registrationController.registerToEvent);

module.exports = router;