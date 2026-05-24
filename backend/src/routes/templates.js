const express = require('express');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/templates
 * Task ID 11: API tìm kiếm template
 * Query params: keyword, category, level
 */
router.get('/', auth, async (req, res) => {
  try {
    const { keyword, category, level } = req.query;
    const filter = {};

    // Lọc theo category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Lọc theo level
    if (level) {
      filter.level = level;
    }

    // Tìm kiếm theo keyword (title, description, tags)
    if (keyword && keyword.trim()) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { tags: { $regex: escapedKeyword, $options: 'i' } },
        { author: { $regex: escapedKeyword, $options: 'i' } },
      ];
    }

    // Trả về danh sách không kèm slidesData để giảm payload
    const templates = await Template.find(filter)
      .select('-slidesData')
      .sort({ downloads: -1 });

    res.json({ templates });
  } catch (err) {
    console.error('Template search error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/templates/:id
 * Lấy chi tiết template (kèm slidesData)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'テンプレートが見つかりません (Template not found)' });
    }
    res.json({ template });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * POST /api/templates
 * Tạo mới một template trong thư viện (database)
 */
router.post('/', auth, async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json({ template });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
