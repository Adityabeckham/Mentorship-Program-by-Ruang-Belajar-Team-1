const { body } = require('express-validator');

exports.createEventValidation = [
  body('title').trim().notEmpty().withMessage('Judul event wajib diisi'),
  body('description').trim().notEmpty().withMessage('Deskripsi wajib diisi'),
  body('category').trim().notEmpty().withMessage('Kategori wajib diisi'),
  body('speaker').trim().notEmpty().withMessage('Narasumber wajib diisi'),
  body('location').trim().notEmpty().withMessage('Lokasi wajib diisi'),
  body('event_date')
    .notEmpty()
    .withMessage('Tanggal event wajib diisi')
    .isISO8601()
    .withMessage('Format tanggal harus ISO8601 (YYYY-MM-DD)'),
  body('quota')
    .notEmpty()
    .withMessage('Kuota wajib diisi')
    .isInt({ min: 1 })
    .withMessage('Kuota minimal bernilai 1'),
];

exports.updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status wajib diisi')
    .isIn(['draft', 'published', 'completed', 'canceled'])
    .withMessage('Status event tidak valid'),
];