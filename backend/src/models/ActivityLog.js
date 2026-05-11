const mongoose = require('mongoose');

// Collection: activity_logs
// Nhật ký hoạt động phục vụ theo dõi lịch sử chỉnh sửa và khôi phục phiên bản
const activityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'create_presentation',
        'update_presentation',
        'delete_presentation',
        'create_slide',
        'update_slide',
        'delete_slide',
        'login',
        'logout',
        'register',
        'upload_image',
        'upload_material',
      ],
      required: true,
    },
    target_type: {
      type: String,
      enum: ['presentation', 'slide', 'template', 'material', 'user'],
      default: null,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Snapshot data cho khôi phục phiên bản
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Index cho truy vấn nhanh theo user và thời gian
activityLogSchema.index({ user_id: 1, createdAt: -1 });
activityLogSchema.index({ target_type: 1, target_id: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
