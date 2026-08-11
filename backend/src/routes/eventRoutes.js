const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createEventValidation } = require('../validators/eventValidators');

// Public
router.get('/events', eventController.getPublicEvents);
router.get('/events/:id', eventController.getPublicEventDetail);

// Protected (All)
router.use(authenticateToken);

// Management
router.get(
  '/events/manage',
  authorizeRoles('panitia', 'admin'),
  eventController.getManagedEvents
);

// CRUD Event Panitia
router.post(
  '/panitia/events',
  authorizeRoles('panitia', 'admin'),
  createEventValidation,
  validate,
  eventController.createEvent
);

router.put(
  '/panitia/events/:id',
  authorizeRoles('panitia', 'admin'),
  eventController.updateEvent
);

router.delete(
  '/panitia/events/:id',
  authorizeRoles('panitia', 'admin'),
  eventController.deleteEvent
);

// Admin Status Update
router.patch(
  '/events/:id/status',
  authorizeRoles('admin'),
  eventController.updateEventStatus
);

<<<<<<< Updated upstream
=======
// Submit Event untuk Verifikasi Admin (Khusus Panitia)
router.patch(
  '/panitia/events/:id/submit',
  authorizeRoles('panitia'),
  eventController.submitEventForVerification
);

// Daftar pengajuan event yang butuh verifikasi
router.get(
  '/admin/events',
  authorizeRoles('admin'),
  eventController.getPendingEventsForAdmin
);

// Memproses keputusan (approve / reject)
router.patch(
  '/admin/events/:id/verify',
  authorizeRoles('admin'),
  eventController.verifyEventByAdmin
);

>>>>>>> Stashed changes
module.exports = router;