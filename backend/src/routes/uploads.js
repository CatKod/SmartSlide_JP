const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { uploadImage, uploadMaterial } = require('../middleware/upload');
const Asset = require('../models/Asset');
const Material = require('../models/Material');

const router = express.Router();

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
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { ownerName: { $regex: escaped, $options: 'i' } },
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

    const filePath = path.join(process.cwd(), material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
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

    const filePath = path.join(process.cwd(), material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    // Dùng tên file ASCII để tránh lỗi encoding
    const safeFilename = material.fileName || `document${path.extname(material.fileUrl)}`;
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.sendFile(filePath);
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
    const filePath = path.join(process.cwd(), material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: '資料を削除しました' });
  } catch (err) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;
