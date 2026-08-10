const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);

module.exports = router;