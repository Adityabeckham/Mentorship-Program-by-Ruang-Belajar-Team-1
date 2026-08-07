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

// (Nantinya kamu bisa tambahkan route dashboard lainnya di sini):
// router.get('/admin/dashboard/stats', authorizeRoles('admin'), dashboardController.getAdminDashboardStats);
// router.get('/user/dashboard/stats', authorizeRoles('mahasiswa'), dashboardController.getUserDashboardStats);

module.exports = router;