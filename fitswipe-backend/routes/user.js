const router = require('express').Router();
const User = require('../models/User');
const Like = require('../models/Like');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to format user response (without password)
const formatUserResponse = (user, likesCount = 0) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    likesCount
  };
};

// GET CURRENT USER (Protected) - Must come before /:id route
router.get('/profile/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likesCount = await Like.countDocuments({ userId: user._id });

    res.json({
      user: formatUserResponse(user, likesCount)
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// UPDATE USER PROFILE (Protected)
router.put('/profile/update', auth, async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      user.name = name.trim();
    }

    // Validate email if provided
    if (email !== undefined) {
      const lowerEmail = email.toLowerCase().trim();
      if (!isValidEmail(lowerEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: lowerEmail,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      user.email = lowerEmail;
    }

    // Update preferences if provided
    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated',
      user: formatUserResponse(user)
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET USER STATISTICS (Public or Protected - adjust based on privacy needs)
router.get('/stats/:userId', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // More efficient: aggregate instead of populating all likes
    const categoryStats = await Like.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryCount = {};
    categoryStats.forEach(stat => {
      categoryCount[stat._id] = stat.count;
    });

    const totalLikes = await Like.countDocuments({ userId: user._id });

    res.json({
      userId: user._id,
      username: user.username,
      totalLikes,
      categoryBreakdown: categoryCount,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET USER PROFILE (Public)
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likesCount = await Like.countDocuments({ userId: user._id });

    res.json({
      user: formatUserResponse(user, likesCount)
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;