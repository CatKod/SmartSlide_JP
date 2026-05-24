const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { uploadImage, uploadMaterial } = require('../middleware/upload');
const Asset = require('../models/Asset');
const Material = require('../models/Material');

const router = express.Router();

function resolveUploadedFile(fileUrl = '') {
  return path.join(process.cwd(), String(fileUrl).replace(/^\/+/, ''));
}

function safeHeaderFilename(fileName, fallback) {
  return String(fileName || fallback || 'document').replace(/[^\x20-\x7E]|["\r\n]/g, '_');
}

/**
 * POST /api/uploads/images
 * Upload ảnh dùng trong slide
 */
router.post('/images', auth, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルが見つかりません (No file)' });
    }

    const url = `/uploads/images/${req.file.filename}`;

    // Lưu thông tin asset vào DB
    const asset = new Asset({
      ownerId: req.userId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      url,
      size: req.file.size,
    });
    await asset.save();

    res.status(201).json({ url, asset: asset.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/uploads/images/search
 * Task ID 10: Tìm kiếm hình ảnh (từ DB)
 */
router.get('/images/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    // Tìm kiếm trong DB (Assets)
    const filter = { ownerId: req.userId };
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.fileName = { $regex: escaped, $options: 'i' };
    }
    const assets = await Asset.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json({ images: assets });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * POST /api/materials/upload
 * Upload tài liệu giảng dạy
 */
router.post('/materials', auth, uploadMaterial.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルが見つかりません' });
    }

    const fileUrl = `/uploads/materials/${req.file.filename}`;

    // Xác định loại file
    const ext = path.extname(req.file.originalname).toLowerCase();
    let type = 'Other';
    if (ext === '.pdf') type = 'PDF';
    else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = 'Image';
    else if (['.txt', '.md'].includes(ext)) type = 'Text';
    else if (['.doc', '.docx'].includes(ext)) type = 'Word';

    const material = new Material({
      title: req.body.title || req.file.originalname,
      type,
      level: req.body.level || '',
      ownerId: req.userId,
      ownerName: req.user.name,
      fileUrl,
      previewUrl: fileUrl,
      mimeType: req.file.mimetype,
      fileName: req.file.originalname,
    });
    await material.save();

    res.status(201).json({
      id: material._id,
      title: material.title,
      type: material.type,
      fileUrl: material.fileUrl,
      previewUrl: material.previewUrl,
      mimeType: material.mimeType,
    });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/materials
 * Lấy danh sách tài liệu
 */
router.get('/materials', auth, async (req, res) => {
  try {
    const { keyword, type, level } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (level) filter.level = level;
    if (keyword && keyword.trim()) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$and = [
        {
          $or: [
            { title: { $regex: escaped, $options: 'i' } },
            { ownerName: { $regex: escaped, $options: 'i' } },
          ]
        },
        {
          $or: [
            { ownerId: req.userId },
            { isShared: true }
          ]
        }
      ];
    } else {
      filter.$or = [
        { ownerId: req.userId },
        { isShared: true }
      ];
    }

    const materials = await Material.find(filter).sort({ createdAt: -1 });
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/materials/:id/preview
 * Xem trước tài liệu
 */
router.get('/materials/:id/preview', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: '資料が見つかりません' });
    }

    const filePath = resolveUploadedFile(material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    const safeFilename = safeHeaderFilename(material.fileName, `document${path.extname(material.fileUrl)}`);
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * GET /api/materials/:id/download
 * Tải tài liệu
 */
router.get('/materials/:id/download', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: '資料が見つかりません' });
    }

    const filePath = resolveUploadedFile(material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    // Dùng tên file ASCII để tránh lỗi encoding
    const safeFilename = safeHeaderFilename(material.fileName, `document${path.extname(material.fileUrl)}`);
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * PUT /api/materials/:id/share
 * Task ID 22: Cập nhật trạng thái chia sẻ của tài liệu
 */
router.put('/materials/:id/share', auth, async (req, res) => {
  try {
    const { isShared } = req.body;
    const material = await Material.findOne({
      _id: req.params.id,
      ownerId: req.userId // Chỉ chủ sở hữu mới được đổi trạng thái
    });

    if (!material) {
      return res.status(404).json({ error: '資料が見つかりません' });
    }

    material.isShared = Boolean(isShared);
    await material.save();

    res.json({ message: '共有状態を更新しました', isShared: material.isShared });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

/**
 * DELETE /api/materials/:id
 * Xóa tài liệu
 */
router.delete('/materials/:id', auth, async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({
      _id: req.params.id,
    });

    if (!material) {
      return res.status(404).json({ error: '資料が見つかりません' });
    }

    // Xóa file vật lý nếu tồn tại
    const filePath = resolveUploadedFile(material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: '資料を削除しました' });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
