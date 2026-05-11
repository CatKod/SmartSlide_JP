const express = require('express');
const { body, validationResult } = require('express-validator');
const Presentation = require('../models/Presentation');
const Template = require('../models/Template');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/slides/my
 * Lấy danh sách presentations của user hiện tại
 */
router.get('/my', auth, async (req, res) => {
  try {
    const decks = await Presentation.find({ owner_id: req.userId })
      .select('-slides.elements') // Giảm payload cho danh sách
      .sort({ updatedAt: -1 });

    res.json({ slides: decks });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * POST /api/slides
 * Task ID 17: Tạo presentation mới
 */
router.post(
  '/',
  auth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('タイトルは必須です (Title required)'),
    body('slides')
      .isArray({ min: 1 })
      .withMessage('少なくとも1ページ必要です (At least 1 slide required)'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, templateId, slides } = req.body;

      const presentation = new Presentation({
        owner_id: req.userId,
        title,
        templateId: templateId || null,
        slides: slides || [],
      });

      await presentation.save();

      // Ghi activity log
      await ActivityLog.create({
        user_id: req.userId,
        action: 'create_presentation',
        target_type: 'presentation',
        target_id: presentation._id,
        details: { title },
      });

      res.status(201).json({ slide: presentation });
    } catch (err) {
      console.error('Create presentation error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

/**
 * POST /api/slides/blank
 * Tạo presentation trắng với 1 trang mặc định
 */
router.post('/blank', auth, async (req, res) => {
  try {
    const presentation = new Presentation({
      owner_id: req.userId,
      title: 'こんにちは',
      templateId: null,
      slides: [
        {
          id: `s1_${Date.now()}`,
          title: 'こんにちは',
          body: '',
          image: '',
          backgroundImage: '',
          elements: [],
        },
      ],
    });

    await presentation.save();

    await ActivityLog.create({
      user_id: req.userId,
      action: 'create_presentation',
      target_type: 'presentation',
      target_id: presentation._id,
      details: { title: 'こんにちは', fromBlank: true },
    });

    res.status(201).json({ slide: presentation });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * POST /api/slides/from-template/:templateId
 * Tạo presentation mới từ template
 */
router.post('/from-template/:templateId', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: 'テンプレートが見つかりません' });
    }

    // Clone slides từ template, gán id mới
    const slides = (template.slidesData || []).map((s, idx) => ({
      id: `s${idx + 1}_${Date.now()}_${idx}`,
      title: s.title || '',
      body: s.body || '',
      image: s.image || '',
      backgroundImage: '',
      elements: [],
    }));

    const presentation = new Presentation({
      owner_id: req.userId,
      title: template.title,
      templateId: template._id.toString(),
      slides,
    });

    await presentation.save();

    await ActivityLog.create({
      user_id: req.userId,
      action: 'create_presentation',
      target_type: 'presentation',
      target_id: presentation._id,
      details: { title: template.title, fromTemplate: template._id },
    });

    res.status(201).json({ slide: presentation });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/slides/:id
 * Lấy chi tiết presentation
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const presentation = await Presentation.findOne({
      _id: req.params.id,
      owner_id: req.userId,
    });

    if (!presentation) {
      return res.status(404).json({ error: 'スライドが見つかりません (Slide not found)' });
    }

    res.json({ slide: presentation });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * PUT /api/slides/:id
 * Task ID 17: Cập nhật presentation (lưu dữ liệu)
 */
router.put(
  '/:id',
  auth,
  [
    body('title').optional().trim().notEmpty(),
    body('slides').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const presentation = await Presentation.findOne({
        _id: req.params.id,
        owner_id: req.userId,
      });

      if (!presentation) {
        return res.status(404).json({ error: 'スライドが見つかりません' });
      }

      // Lưu snapshot trước khi cập nhật (cho khôi phục phiên bản)
      const snapshot = {
        title: presentation.title,
        slides: presentation.slides,
      };

      // Cập nhật các trường được gửi
      if (req.body.title !== undefined) presentation.title = req.body.title;
      if (req.body.slides !== undefined) presentation.slides = req.body.slides;
      if (req.body.templateId !== undefined) presentation.templateId = req.body.templateId;

      await presentation.save();

      // Ghi activity log kèm snapshot
      await ActivityLog.create({
        user_id: req.userId,
        action: 'update_presentation',
        target_type: 'presentation',
        target_id: presentation._id,
        details: { title: presentation.title },
        snapshot,
      });

      res.json({ slide: presentation });
    } catch (err) {
      console.error('Update presentation error:', err);
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
);

/**
 * DELETE /api/slides/:id
 * Xóa presentation
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const presentation = await Presentation.findOneAndDelete({
      _id: req.params.id,
      owner_id: req.userId,
    });

    if (!presentation) {
      return res.status(404).json({ error: 'スライドが見つかりません' });
    }

    // Ghi activity log
    await ActivityLog.create({
      user_id: req.userId,
      action: 'delete_presentation',
      target_type: 'presentation',
      target_id: presentation._id,
      details: { title: presentation.title },
    });

    res.json({ message: 'スライドを削除しました (Slide deleted)' });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
