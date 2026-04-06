 
const router = require('express').Router();
const Product = require('../models/Product');
 
// GET ALL PRODUCTS (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;
 
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
 
    const total = await Product.countDocuments();
 
    res.json({
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
 
// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
 
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
 
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});
 
// GET PRODUCTS BY CATEGORY
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;
 
    const products = await Product.find({ category: req.params.category })
      .skip(skip)
      .limit(limit);
 
    const total = await Product.countDocuments({ category: req.params.category });
 
    res.json({
      products,
      total,
      page,
      limit
    });
  } catch (err) {
    console.error('Get category products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
 
// CREATE PRODUCT
router.post('/', async (req, res) => {
  try {
    const { name, category, price, imageUrl, shopLink, vibe, description } = req.body;
 
    if (!name || !category || !price || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
 
    const product = new Product({
      name,
      category,
      price,
      imageUrl,
      shopLink: shopLink || null,
      vibe: vibe || '',
      description: description || ''
    });
 
    await product.save();
 
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
 
module.exports = router;
 