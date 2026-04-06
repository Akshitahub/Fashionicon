const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to validate price
const isValidPrice = (price) => !isNaN(price) && parseFloat(price) > 0;

// GET SINGLE PRODUCT (must come before /category route)
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

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

// GET PRODUCTS BY CATEGORY (comes after :id route)
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;

    // Validate pagination
    if (page < 0 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const category = req.params.category.trim();
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const products = await Product.find({ category })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category });

    res.json({
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get category products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET ALL PRODUCTS (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;

    // Validate pagination
    if (page < 0 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Build filter object
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.trim();
    }
    if (req.query.vibe) {
      filter.vibe = req.query.vibe.trim();
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice && isValidPrice(req.query.minPrice)) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice && isValidPrice(req.query.maxPrice)) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

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

// CREATE PRODUCT (requires authentication - add admin check if needed)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, imageUrl, shopLink, vibe, description } = req.body;

    // Validation
    if (!name || !category || price === undefined || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields: name, category, price, imageUrl' });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (!isValidPrice(price)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if (typeof imageUrl !== 'string' || !imageUrl.trim().startsWith('http')) {
      return res.status(400).json({ error: 'ImageUrl must be a valid URL' });
    }

    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price),
      imageUrl: imageUrl.trim(),
      shopLink: shopLink && typeof shopLink === 'string' ? shopLink.trim() : null,
      vibe: vibe && typeof vibe === 'string' ? vibe.trim() : '',
      description: description && typeof description === 'string' ? description.trim() : ''
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;