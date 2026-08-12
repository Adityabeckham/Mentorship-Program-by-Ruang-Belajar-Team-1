const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Proteksi global: Wajib login (JWT)
router.use(authenticateToken);

// Endpoint Statistik Panitia
router.get(
  '/panitia/dashboard/stats',
  authorizeRoles('panitia', 'admin'),
  dashboardController.getPanitiaDashboardStats
);

// Endpoint Statistik Admin (Hanya role Admin)
router.get(
  '/admin/dashboard/stats',
  authenticateToken, 
  authorizeRoles('admin'), 
  dashboardController.getAdminDashboardStats
);

module.exports = router;