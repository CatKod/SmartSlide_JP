const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    mimeType: { type: String },
    url: { type: String, required: true },
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
