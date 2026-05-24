require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');
const slideRoutes = require('./routes/slides');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Tắt cache ETag để luôn trả về status 200
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images & materials)
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/uploads', uploadRoutes);
// Material routes được mount trong uploads.js tại /api/uploads/materials
// Thêm alias để match spec
app.use('/api', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'APIが見つかりません (Not found)' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'サーバーエラー (Server error)' });
});

app.listen(PORT, () => {
  console.log(`SmartSlide Backend running on http://localhost:${PORT}`);
});

module.exports = app;
