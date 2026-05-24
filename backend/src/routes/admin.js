const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Template = require('../models/Template');
const Presentation = require('../models/Presentation');
const Material = require('../models/Material');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Helper to return validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Helper: Get or initialize system settings
const getOrInitSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting({
      siteName: 'SmartSlide JP',
      allowRegistration: true,
      maintenanceMode: false,
    });
    await settings.save();
  }
  return settings;
};

// Protect all admin routes
router.use(auth, admin);

// ==========================================
// 1. Dashboard Stats API
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMaterials = await Material.countDocuments();
    const totalTemplates = await Template.countDocuments();
    const totalSlides = await Presentation.countDocuments();

    res.json({
      totalUsers,
      totalMaterials,
      totalTemplates,
      totalSlides,
    });
  } catch (err) {
    console.error('Stats API error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ==========================================
// 2. User CRUD API
// ==========================================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// Create user
router.post(
  '/users',
  [
    body('username').trim().notEmpty().isLength({ min: 3 }),
    body('name').trim().notEmpty(),
    body('email').trim().isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'teacher', 'student']),
    body('level').optional().trim(),
    body('language').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { username, name, email, password, role, level, language } = req.body;

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ error: 'このユーザー名は既に使用されています' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ error: 'このメールアドレスは既に登録されています' });
      }

      const user = new User({
        username,
        name,
        email,
        password_hash: password, // pre-save will hash
        role: role || 'teacher',
        level: level || 'N5',
        language: language || '日本語',
      });

      await user.save();
      res.status(201).json({ user: user.toJSON() });
    } catch (err) {
      console.error('Admin create user error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

// Update user
router.put(
  '/users/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'teacher', 'student']),
    body('status').optional().isIn(['active', 'locked']),
    body('level').optional().trim(),
    body('language').optional().trim(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      // Check email uniqueness if modified
      if (req.body.email && req.body.email !== user.email) {
        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) {
          return res.status(409).json({ error: 'このメールアドレスは既に使用されています' });
        }
        user.email = req.body.email;
      }

      // Update fields
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.role !== undefined) user.role = req.body.role;
      if (req.body.status !== undefined) user.status = req.body.status;
      if (req.body.level !== undefined) user.level = req.body.level;
      if (req.body.language !== undefined) user.language = req.body.language;
      if (req.body.password) {
        user.password_hash = req.body.password; // pre-save will hash
      }

      await user.save();
      res.json({ user: user.toJSON() });
    } catch (err) {
      console.error('Admin update user error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: '自分自身のアカウントは削除できません' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({ message: 'ユーザーを削除しました (User deleted)' });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ==========================================
// 3. Template Management API
// ==========================================

// Get templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 });
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'テンプレートが見つかりません' });
    }
    res.json({ message: 'テンプレートを削除しました (Template deleted)' });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// Toggle isPublic (change public status)
router.put(
  '/templates/:id/public',
  [
    body('isPublic').isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { isPublic } = req.body;
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'テンプレートが見つかりません' });
      }

      // If we don't have isPublic on Template model yet, we can save it dynamically as Mongoose allows it if schema supports it or if we update using direct update
      template.set('isPublic', isPublic);
      await template.save();

      res.json({ template });
    } catch (err) {
      console.error('Admin public toggle error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

// ==========================================
// 4. System Settings API
// ==========================================

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// Update system settings
router.put(
  '/settings',
  [
    body('siteName').optional().trim().notEmpty(),
    body('allowRegistration').optional().isBoolean(),
    body('maintenanceMode').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const settings = await getOrInitSettings();
      
      if (req.body.siteName !== undefined) settings.siteName = req.body.siteName;
      if (req.body.allowRegistration !== undefined) settings.allowRegistration = req.body.allowRegistration;
      if (req.body.maintenanceMode !== undefined) settings.maintenanceMode = req.body.maintenanceMode;

      await settings.save();
      res.json({ settings });
    } catch (err) {
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

module.exports = router;
