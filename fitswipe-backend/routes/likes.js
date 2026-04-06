const router = require('express').Router();
const Like = require('../models/Like');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
 
// SAVE A PRODUCT (Like)
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;
 
    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
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
 
// GET USER'S LIKED PRODUCTS
router.get('/user/:userId', async (req, res) => {
  try {
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
 
// CHECK IF PRODUCT IS LIKED
router.get('/check/:productId', auth, async (req, res) => {
  try {
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
 
module.exports = router;
 