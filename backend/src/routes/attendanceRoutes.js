const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);

// PATCH /api/v1/attendance/:registration_id (Marking Kehadiran Peserta)
router.patch(
  '/attendance/:registration_id',
  authorizeRoles('panitia', 'admin'),
  attendanceController.markAttendance
);

module.exports = router;