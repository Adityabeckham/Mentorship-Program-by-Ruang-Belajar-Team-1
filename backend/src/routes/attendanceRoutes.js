const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);

// Endpoint Marking Presensi (Khusus Panitia & Admin)
router.post(
  '/panitia/attendance',
  authorizeRoles('panitia', 'admin'),
  attendanceController.markAttendance
);

module.exports = router;