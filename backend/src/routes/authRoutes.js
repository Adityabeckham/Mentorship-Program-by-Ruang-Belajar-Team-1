const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;