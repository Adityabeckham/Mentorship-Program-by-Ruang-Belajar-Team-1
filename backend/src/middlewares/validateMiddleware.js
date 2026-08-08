const { validationResult } = require('express-validator');

/**
 * Middleware untuk mengecek hasil validasi express-validator.
 * Jika terdapat error validasi, mengembalikan HTTP 400 Bad Request.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi input gagal',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;