const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Proteksi seluruh route dengan middleware JWT
router.use(authenticateToken);

// GET /api/v1/registrations/me
router.get('/registrations/me', authenticateToken, registrationController.getMyRegistrations);

// POST /api/v1/events/:id/register (Khusus Mahasiswa)
router.post('/events/:id/register', authenticateToken, authorizeRoles('mahasiswa'), registrationController.registerToEvent);

// POST /api/v1/registrations (Khusus Mahasiswa - Body alias: { event_id })
router.post('/registrations', authenticateToken, authorizeRoles('mahasiswa'), (req, res, next) => {
  if (!req.params.id && (req.body.event_id || req.body.eventId)) {
    req.params.id = req.body.event_id || req.body.eventId;
  }
  return registrationController.registerToEvent(req, res, next);
});

module.exports = router;
