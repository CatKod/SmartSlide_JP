const mongoose = require('mongoose');

// Element trong slide (text, image, shape...)
const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'shape'], required: true },
    // Text fields
    content: String,
    fontSize: Number,
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    align: { type: String, default: 'left' },
    // Image fields
    src: String,
    // Vị trí & kích thước (% canvas) + z_index cho layering
    x: Number,
    y: Number,
    w: Number,
    h: Number,
    z_index: { type: Number, default: 0 },
  },
  { _id: false }
);

// Mỗi trang slide
const slidePageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: String,
    body: String,
    image: String,
    backgroundImage: { type: String, default: '' },
    elements: [elementSchema],
  },
  { _id: false }
);

// Bộ thuyết trình (presentation) - Collection: presentations
const presentationSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    templateId: { type: String, default: null },
    slides: [slidePageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Presentation', presentationSchema);
