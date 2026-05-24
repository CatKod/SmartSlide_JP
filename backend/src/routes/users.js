const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

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
