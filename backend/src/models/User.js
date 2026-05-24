const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'teacher',
    },
    level: { type: String, default: 'N5' },
    language: { type: String, default: '日本語' },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
    },
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'ja' },
    },
  },
  { timestamps: true }
);

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Loại bỏ password_hash khỏi JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
