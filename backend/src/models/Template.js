const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    categoryLabel: { type: String },
    level: { type: String },
    author: { type: String },
    rating: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    image: { type: String },
    thumbnailUrl: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    slidesData: [
      {
        id: String,
        title: String,
        body: String,
        image: String,
      },
    ],
  },
  { timestamps: true }
);

// Index cho tìm kiếm text
templateSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Template', templateSchema);
