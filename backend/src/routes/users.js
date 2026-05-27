const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です (Admin role required)' });
  }
  next();
}

/**
 * GET /api/users
 * Admin: lấy danh sách toàn bộ người dùng để thống kê và quản lý.
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('-password_hash -__v');

    const counts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, { admin: 0, teacher: 0, student: 0 });

    res.json({
      users: users.map(user => user.toJSON()),
      total: users.length,
      counts,
    });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー (Server error)' });
  }
});

/**
 * GET /api/users/me
 * Lấy thông tin user hiện tại
 */
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * PUT /api/users/me
 * Cập nhật hồ sơ giáo viên
 */
router.put(
  '/me',
  auth,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('level').optional().trim(),
    body('language').optional().trim(),
    body('title').optional().trim(),
    body('avatarUrl').optional().trim(),
    body('preferences').optional().isObject(),
    body('preferences.theme').optional().isIn(['light', 'dark']),
    body('preferences.language').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const allowedFields = ['name', 'email', 'level', 'language', 'preferences', 'title', 'avatarUrl'];
      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Kiểm tra email trùng khi đổi email
      if (updates.email && updates.email !== req.user.email) {
        const existingUser = await User.findOne({ email: updates.email });
        if (existingUser) {
          return res.status(409).json({ error: 'このメールアドレスは既に使用されています' });
        }
      }

      const user = await User.findByIdAndUpdate(req.userId, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

module.exports = router;
