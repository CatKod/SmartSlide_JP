const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: 'PDF' },
    level: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String },
    fileUrl: { type: String, required: true },
    previewUrl: { type: String },
    mimeType: { type: String },
    fileName: { type: String },
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
