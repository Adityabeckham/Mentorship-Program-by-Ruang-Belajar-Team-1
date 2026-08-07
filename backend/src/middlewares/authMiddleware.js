const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token dikirim dalam format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan payload JWT ({ id, role }) ke req.user
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};