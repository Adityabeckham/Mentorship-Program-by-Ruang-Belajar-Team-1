const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Proteksi: Semua endpoint di bawah khusus untuk Admin
router.use(authenticateToken, authorizeRoles('admin'));

// Manajemen Panitia
router.post('/admin/panitia', userController.createPanitia);
router.get('/admin/panitia', userController.getPanitiaList);
router.put('/admin/panitia/:id', userController.updatePanitia);

// Manajemen Seluruh User (Admin Monitoring)
router.get('/admin/users', userController.getAllUsers);

module.exports = router;