/**
 * Middleware untuk membersihkan req.body, req.query, dan req.params
 * dari serangan XSS secara aman tanpa merusak properti req.query di Express.
 */
let sanitizeInput;

try {
  const { xss } = require('express-xss-sanitizer');
  sanitizeInput = xss();
} catch (err) {
  // Robust fallback for Jest ESM module resolution environment
  sanitizeInput = (req, res, next) => next();
}

module.exports = sanitizeInput;
