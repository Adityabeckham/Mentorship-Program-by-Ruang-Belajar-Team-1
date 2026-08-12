const { body } = require('express-validator');

exports.registerValidation = [
  body('nama')
    .trim()
    .notEmpty()
    .withMessage('Nama wajib diisi')
    .isLength({ min: 3 })
    .withMessage('Nama minimal 3 karakter'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email wajib diisi')
    .isEmail()
    .withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('role')
    .optional()
    .isIn(['mahasiswa', 'panitia', 'admin'])
    .withMessage('Role tidak valid'),
  body('organization_name')
    .optional()
    .trim()
    .isString()
    .withMessage('Nama organisasi harus berupa teks'),
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email wajib diisi')
    .isEmail()
    .withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];