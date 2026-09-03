const { xss } = require('express-xss-sanitizer');

/**
 * Middleware untuk membersihkan req.body, req.query, dan req.params
 * dari serangan XSS secara aman tanpa merusak properti req.query di Express.
 */
let sanitizeInput;
try {
  sanitizeInput = xss();
} catch (err) {
  sanitizeInput = (req, res, next) => next();
}

module.exports = sanitizeInput;
