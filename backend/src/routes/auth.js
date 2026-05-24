const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: trả về validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

/**
 * POST /api/auth/register
 * Task ID 5: API đăng ký người dùng và validation
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('ユーザー名は必須です (Username is required)')
      .isLength({ min: 3, max: 50 })
      .withMessage('ユーザー名は3〜50文字で入力してください'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }),
    body('email')
      .trim()
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください (Valid email required)')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('パスワードは6文字以上で入力してください (Password min 6 chars)'),
    body('role')
      .optional()
      .isIn(['admin', 'teacher', 'student'])
      .withMessage('役割はadmin, teacher, studentのいずれかです'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidation(req, res);
      if (validationError) return;

      // Check if registration is allowed by system settings
      const setting = await Setting.findOne();
      if (setting && !setting.allowRegistration) {
        return res.status(403).json({
          error: '新規登録は現在停止されています (Registration is currently disabled)',
        });
      }

      const { username, name, email, password, role } = req.body;

      // Kiểm tra username đã tồn tại
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({
          error: 'このユーザー名は既に使用されています (Username already taken)',
        });
      }

      // Kiểm tra email đã tồn tại
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          error: 'このメールアドレスは既に登録されています (Email already registered)',
        });
      }

      // Tạo user mới
      const user = new User({
        username,
        name: name || username,
        email,
        password_hash: password, // pre-save hook sẽ hash
        role: role || 'teacher',
      });
      await user.save();

      // Ghi log đăng ký
      await ActivityLog.create({
        user_id: user._id,
        action: 'register',
        target_type: 'user',
        target_id: user._id,
        details: { username, email },
      });

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'サーバーエラー (Server error)' });
    }
  }
);

/**
 * POST /api/auth/login
 * Task ID 8: API xác thực đăng nhập
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').notEmpty().withMessage('パスワードを入力してください'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidation(req, res);
      if (validationError) return;

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'メールアドレスまたはパスワードが間違っています (Invalid credentials)',
        });
      }

      if (user.status === 'locked') {
        return res.status(403).json({
          error: 'このアカウントはロックされています (Account is locked)',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'メールアドレスまたはパスワードが間違っています (Invalid credentials)',
        });
      }

      // Ghi log đăng nhập
      await ActivityLog.create({
        user_id: user._id,
        action: 'login',
        target_type: 'user',
        target_id: user._id,
      });

      const token = generateToken(user._id);

      res.json({
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'サーバーエラー (Server error)' });
    }
  }
);

/**
 * POST /api/auth/logout
 * Task ID 8: API đăng xuất
 */
router.post('/logout', auth, async (req, res) => {
  // Ghi log đăng xuất
  await ActivityLog.create({
    user_id: req.userId,
    action: 'logout',
    target_type: 'user',
    target_id: req.userId,
  });

  res.json({ message: 'ログアウトしました (Logged out)' });
});

module.exports = router;
