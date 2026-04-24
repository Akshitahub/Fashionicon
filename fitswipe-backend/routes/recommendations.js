const router = require('express').Router();
const Like = require('../models/Like');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    // Step 1: Get all liked products for this user
    const likes = await Like.find({ userId: req.user.id }).populate('productId');
    const likedProducts = likes.map(l => l.productId).filter(p => p);

    if (likedProducts.length === 0) {
      const random = await Product.aggregate([{ $sample: { size: 10 } }]);
      return res.json({ recommendations: random, cold: true });
    }

    // Step 2: Build preference profile
    const vibeCount = {};
    const categoryCount = {};
    const keywordCount = {};

    likedProducts.forEach(p => {
      if (p.vibe) vibeCount[p.vibe] = (vibeCount[p.vibe] || 0) + 1;
      if (p.category) categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      p.keywords?.forEach(k => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    // Step 3: Fetch all unliked products
    const likedIds = likedProducts.map(p => p._id);
    const candidates = await Product.find({ _id: { $nin: likedIds } });

    // Step 4: Score each candidate
    const scored = candidates.map(p => {
      let score = 0;
      if (p.vibe && vibeCount[p.vibe]) score += vibeCount[p.vibe] * 3;
      if (p.category && categoryCount[p.category]) score += categoryCount[p.category] * 2;
      p.keywords?.forEach(k => {
        if (keywordCount[k]) score += keywordCount[k] * 1;
      });
      return { product: p, score };
    });

    // Step 5: Sort and return top 10
    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, 10).map(s => s.product);

    res.json({ recommendations, cold: false });

  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;