const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/ // Only alphanumeric, underscore, hyphen
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
  },
  name: {
    type: String,
    default: '',
    maxlength: 100
  },
  password: {
    type: String,
    default: null,
    minlength: 6,
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    default: null,
    match: /^\+?[1-9]\d{1,14}$/ // E.164 format for international numbers
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'phone'],
    default: 'local'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  swipesToday: {
    type: Number,
    default: 0,
    min: 0
  },
  preferences: {
    categories: [String],
    priceRange: {
      min: { type: Number, default: 0, min: 0 },
      max: { type: Number, default: 10000, min: 0 }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function(next) {
  // Only hash if password is modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Validate password strength (minimum 6 chars - adjust as needed)
    if (this.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method: Compare input password with stored hash
userSchema.methods.comparePassword = async function(inputPassword) {
  // If no password set (OAuth/Phone users), return false
  if (!this.password) {
    return false;
  }

  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

// Method: Check if user can login with password
userSchema.methods.canLoginWithPassword = function() {
  return this.provider === 'local' && !!this.password;
};

// Method: Check if user is valid
userSchema.methods.isValid = function() {
  return this.isActive === true;
};

// Override toJSON to exclude password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Static method: Validate password strength
userSchema.statics.validatePasswordStrength = function(password) {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (password && password.length > 128) {
    errors.push('Password is too long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = mongoose.model('User', userSchema);