const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  shopLink: { type: String, default: null },
  vibe: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);