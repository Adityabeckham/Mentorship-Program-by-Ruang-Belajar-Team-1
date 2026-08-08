const { xss } = require('express-xss-sanitizer');

/**
 * Middleware untuk membersihkan req.body, req.query, dan req.params
 * dari serangan XSS secara aman tanpa merusak properti req.query di Express.
 */
const sanitizeInput = xss();

module.exports = sanitizeInput;