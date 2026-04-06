const router = require('express').Router();
const Like = require('../models/Like');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// CHECK IF PRODUCT IS LIKED (must come before :userId route)
router.get('/check/:productId', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const like = await Like.findOne({
      userId: req.user.id,
      productId: req.params.productId
    });

    res.json({
      isLiked: !!like
    });
  } catch (err) {
    console.error('Check like error:', err);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// SAVE A PRODUCT (Like)
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingLike = await Like.findOne({
      userId: req.user.id,
      productId
    });

    if (existingLike) {
      return res.status(409).json({ error: 'Product already liked' });
    }

    const like = new Like({
      userId: req.user.id,
      productId
    });

    await like.save();

    res.status(201).json({
      message: 'Product saved',
      like
    });
  } catch (err) {
    console.error('Create like error:', err);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// GET USER'S LIKED PRODUCTS (added auth for security)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Optional: Allow users to only see their own likes, or allow viewing others with auth
    // Uncomment the line below if you want users to only see their own likes:
    // if (req.user.id !== req.params.userId) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const likes = await Like.find({ userId: req.params.userId })
      .populate('productId')
      .sort({ createdAt: -1 });

    const products = likes.map(like => like.productId).filter(p => p);

    res.json({
      products,
      count: products.length
    });
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ error: 'Failed to fetch liked products' });
  }
});

// UNLIKE A PRODUCT
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const result = await Like.findOneAndDelete({
      userId: req.user.id,
      productId
    });

    if (!result) {
      return res.status(404).json({ error: 'Like not found' });
    }

    res.json({ message: 'Product removed from likes' });
  } catch (err) {
    console.error('Delete like error:', err);
    res.status(500).json({ error: 'Failed to remove product' });
  }
});

module.exports = router;