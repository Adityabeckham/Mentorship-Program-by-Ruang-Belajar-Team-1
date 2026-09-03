const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Proteksi seluruh route attendance dengan JWT & Role Panitia / Admin
router.use(authenticateToken);
router.use(authorizeRoles('panitia', 'admin'));

// PATCH /api/v1/attendance/:registration_id
router.patch('/attendance/:registration_id', (req, res, next) => {
  req.body.registration_id = req.params.registration_id;
  attendanceController.markAttendance(req, res, next);
});

// POST /api/v1/attendance
router.post('/attendance', attendanceController.markAttendance);

module.exports = router;
