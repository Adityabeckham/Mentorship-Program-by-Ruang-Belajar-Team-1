const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Wajib Login untuk seluruh rute di bawah
router.use(authenticateToken);

// Panitia melihat event miliknya, Admin melihat SELURUH event
router.get(
  '/events/manage',
  authorizeRoles('panitia', 'admin'),
  eventController.getManagedEvents
);

// Khusus Admin untuk mengubah status (misal merubah ke 'published')
router.patch(
  '/events/:id/status',
  authorizeRoles('admin'),
  eventController.updateEventStatus
);

module.exports = router;