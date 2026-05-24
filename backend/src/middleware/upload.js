const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục upload tồn tại
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage cho ảnh slide
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'images');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `img_${uniqueSuffix}${ext}`);
  },
});

// Storage cho tài liệu giảng dạy
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'materials');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `mat_${uniqueSuffix}${ext}`);
  },
});

// Filter chỉ cho phép ảnh
const imageFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイルのみアップロード可能です'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadMaterial = multer({
  storage: materialStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = { uploadImage, uploadMaterial };
