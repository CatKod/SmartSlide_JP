const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'SmartSlide JP' },
    allowRegistration: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
