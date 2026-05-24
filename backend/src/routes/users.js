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
    body('preferences').optional().isObject(),
    body('preferences.theme').optional().isIn(['light', 'dark']),
    body('preferences.language').optional().trim(),
    body('password').optional().isLength({ min: 6 }),
    body('currentPassword').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = req.user;

      // Handle password update if password is provided
      if (req.body.password) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ error: '現在のパスワードを入力してください (Current password required)' });
        }
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ error: '現在のパスワードが違います (Incorrect current password)' });
        }
        user.password_hash = req.body.password; // pre-save hook will hash it
      }

      // Check email uniqueness if changing email
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(409).json({ error: 'このメールアドレスは既に使用されています' });
        }
        user.email = req.body.email;
      }

      // Update remaining fields
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.level !== undefined) user.level = req.body.level;
      if (req.body.language !== undefined) user.language = req.body.language;
      if (req.body.preferences !== undefined) user.preferences = req.body.preferences;

      await user.save();

      res.json({ user: user.toJSON() });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

module.exports = router;
