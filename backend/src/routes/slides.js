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

const { uploadMaterial } = require('../middleware/upload');

/**
 * POST /api/slides/import
 * Task ID 14: Logic parse file và convert sang data slide
 */
router.post('/import', auth, uploadMaterial.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルが見つかりません (No file found)' });
    }

    // Logic giả lập parse file và tạo slide từ nội dung (PDF/PPTX -> JSON)
    const presentation = new Presentation({
      owner_id: req.userId,
      title: req.file.originalname || 'Imported Slide',
      templateId: null,
      slides: [
        {
          id: `s1_${Date.now()}`,
          title: `Trích xuất từ: ${req.file.originalname}`,
          body: 'Đang hiển thị dữ liệu text giả lập được bóc tách từ file...',
          image: '',
          backgroundImage: '',
          elements: [
            {
               id: `e_${Date.now()}`,
               type: 'text',
               content: 'Nội dung trích xuất tự động...',
               x: 10, y: 10, width: 80, height: 20
            }
          ],
        },
      ],
    });

    await presentation.save();

    await ActivityLog.create({
      user_id: req.userId,
      action: 'create_presentation',
      target_type: 'presentation',
      target_id: presentation._id,
      details: { title: presentation.title, fileName: req.file.originalname, imported: true },
    });

    res.status(201).json({ slide: presentation });
  } catch (err) {
    console.error('Import error:', err);
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

/**
 * POST /api/slides/:id/clone
 * Task ID 6: 複製 (Clone) presentation
 */
router.post('/:id/clone', auth, async (req, res) => {
  try {
    const original = await Presentation.findOne({
      _id: req.params.id,
      owner_id: req.userId,
    });

    if (!original) {
      return res.status(404).json({ error: 'スライドが見つかりません' });
    }

    const cloneData = {
      owner_id: req.userId,
      title: `${original.title} - Copy`,
      templateId: original.templateId,
      // Map lại id cho slide trang để tránh trùng lặp id ở clone
      slides: original.slides.map(s => {
        const sObj = s.toObject ? s.toObject() : s;
        return {
          ...sObj,
          id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          elements: (sObj.elements || []).map(e => ({
            ...e,
            id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }))
        };
      }),
    };

    const clone = new Presentation(cloneData);
    await clone.save();

    await ActivityLog.create({
      user_id: req.userId,
      action: 'clone_presentation',
      target_type: 'presentation',
      target_id: clone._id,
      details: { title: clone.title, originalId: original._id },
    });

    res.status(201).json({ slide: clone });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/slides/:id/export
 * Task ID 18, 19: Export slide ra file PPTX (Sử dụng pptxgenjs nếu có)
 */
router.get('/:id/export', auth, async (req, res) => {
  try {
    const presentation = await Presentation.findOne({
      _id: req.params.id,
      owner_id: req.userId,
    });

    if (!presentation) {
      return res.status(404).json({ error: 'スライドが見つかりません' });
    }

    const PptxGenJS = require('pptxgenjs');
    const pptx = new PptxGenJS();
    
    if (presentation.slides && presentation.slides.length > 0) {
      presentation.slides.forEach(slide => {
        let slideObj = pptx.addSlide();
        
        // Add title
        if (slide.title) {
          slideObj.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 24, bold: true });
        }

        // Add body
        if (slide.body) {
          slideObj.addText(slide.body, { x: 0.5, y: 1.5, w: '90%', h: 3, fontSize: 18 });
        }

        // Add elements if any
        if (slide.elements && slide.elements.length > 0) {
          slide.elements.forEach(el => {
            if (el.type === 'text') {
              slideObj.addText(el.content || '', { 
                x: (el.x / 100 * 10) || 1,
                y: (el.y / 100 * 5.625) || 2,
                w: (el.width / 100 * 10) || 4,
                h: (el.height / 100 * 5.625) || 1,
                fontSize: el.fontSize || 18,
                color: el.color ? el.color.replace('#', '') : '000000'
              });
            }
          });
        }
      });
    } else {
      pptx.addSlide().addText('No slides available', { x: 1, y: 1, w: 8, h: 2, fontSize: 24 });
    }

    const fileName = `${presentation.title || 'export'}.pptx`;
    const data = await pptx.stream();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.end(data);
  } catch (err) {
    console.error('Export PPTX error:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
