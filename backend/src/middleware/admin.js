// Middleware to check if user has admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: '管理者権限が必要です (Admin role required)' });
  }
};

module.exports = admin;
