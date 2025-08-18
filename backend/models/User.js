const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String,
    default: ''
  },
  refreshToken: {
    type: String,
    default: ''
  },
  accessToken: {
    type: String,
    default: ''
  },
  tokenExpiry: {
    type: Date
  },
  lastEmailScan: {
    type: Date,
    default: null
  },
  lastBreachCheck: {
    type: Date,
    default: null
  },
  securityScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    scanFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'manual'],
      default: 'weekly'
    },
    emailCategories: [{
      type: String,
      enum: ['subscription', 'newsletter', 'verification', 'login', 'signup', 'billing']
    }],
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving (if we add password field later)
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check if token is expired
userSchema.methods.isTokenExpired = function() {
  return this.tokenExpiry && this.tokenExpiry < new Date();
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return this.name;
};

module.exports = mongoose.model('User', userSchema);
