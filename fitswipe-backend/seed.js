import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const products = [
  // ── BEAUTY ──
  {
    name: "Rouge Allure Velvet Lipstick",
    category: "beauty",
    vibe: "Bold Confident Statement",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6b23e5f10c?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nykaa.com/search/result/?q=velvet+lipstick",
    price: 1850,
    keywords: ["lipstick","beauty","makeup","bold"]
  },
  {
    name: "Hyaluronic Acid Glow Serum",
    category: "beauty",
    vibe: "Glowy Healthy Skincare",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nykaa.com/search/result/?q=hyaluronic+serum",
    price: 1299,
    keywords: ["serum","skincare","glow","hyaluronic"]
  },
  {
    name: "Rose Quartz Facial Roller",
    category: "beauty",
    vibe: "Soft Natural Ritual",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nykaa.com/search/result/?q=face+roller",
    price: 799,
    keywords: ["facial","roller","skincare","glow"]
  },
  {
    name: "Eau de Parfum — Midnight Oud",
    category: "beauty",
    vibe: "Elegant Mysterious Signature",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nykaa.com/search/result/?q=oud+perfume",
    price: 3499,
    keywords: ["perfume","fragrance","oud","luxury"]
  },
  {
    name: "Vitamin C Brightening Cream",
    category: "beauty",
    vibe: "Radiant Luminous Everyday",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nykaa.com/search/result/?q=vitamin+c+cream",
    price: 949,
    keywords: ["cream","vitamin c","skincare","brightening"]
  },

  // ── FASHION ──
  {
    name: "Structured Black Blazer",
    category: "fashion",
    vibe: "Powerful Polished Timeless",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/blazer",
    price: 3999,
    keywords: ["blazer","black","fashion","formal"]
  },
  {
    name: "Classic Blue Denim — Slim Cut",
    category: "fashion",
    vibe: "Casual Chic Effortless",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/jeans",
    price: 2499,
    keywords: ["jeans","denim","blue","casual"]
  },
  {
    name: "Oversized Linen Co-ord Set",
    category: "fashion",
    vibe: "Relaxed Elegant Summer",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/co-ord-set",
    price: 4299,
    keywords: ["coord","linen","set","summer"]
  },
  {
    name: "Gold Chain Layered Necklace",
    category: "fashion",
    vibe: "Refined Subtle Accessory",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=gold+chain+necklace",
    price: 1599,
    keywords: ["necklace","gold","jewelry","accessory"]
  },
  {
    name: "Mini Structured Tote Bag",
    category: "fashion",
    vibe: "Elegant Statement Everyday",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=tote+bag",
    price: 2899,
    keywords: ["bag","tote","fashion","structured"]
  },
  {
    name: "Silk Scarf — Abstract Print",
    category: "fashion",
    vibe: "Artistic Luxurious Signature",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/scarves",
    price: 1299,
    keywords: ["scarf","silk","accessory","print"]
  },

  // ── SHOES ──
  {
    name: "White Leather Minimal Sneakers",
    category: "shoes",
    vibe: "Clean Casual Everyday",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.nike.com/in",
    price: 4999,
    keywords: ["sneakers","white","leather","minimal"]
  },
  {
    name: "Block Heel Mule — Nude",
    category: "shoes",
    vibe: "Elegant Comfortable Chic",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/heels",
    price: 3499,
    keywords: ["mule","heel","nude","chic"]
  },
  {
    name: "Tan Leather Chelsea Boots",
    category: "shoes",
    vibe: "Effortless Cool Autumnal",
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/boots",
    price: 5999,
    keywords: ["boots","chelsea","tan","leather"]
  },
  {
    name: "Chunky Platform Loafers",
    category: "shoes",
    vibe: "Trendy Bold Statement",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.myntra.com/loafers",
    price: 3799,
    keywords: ["loafer","platform","chunky","trendy"]
  },

  // ── ELECTRONICS ──
  {
    name: "Premium Wireless Earbuds",
    category: "electronics",
    vibe: "Minimal Focused Modern",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=wireless+earbuds",
    price: 7999,
    keywords: ["earbuds","wireless","audio","minimal"]
  },
  {
    name: "Smart Watch — Rose Gold Edition",
    category: "electronics",
    vibe: "Modern Productive Elegant",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=smart+watch",
    price: 12999,
    keywords: ["smartwatch","rosegold","tech","elegant"]
  },
  {
    name: "Portable Bluetooth Speaker",
    category: "electronics",
    vibe: "Fun Social On-the-Go",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=bluetooth+speaker",
    price: 4499,
    keywords: ["speaker","bluetooth","music","portable"]
  },

  // ── WELLNESS ──
  {
    name: "Premium Cork Yoga Mat",
    category: "wellness",
    vibe: "Calm Centred Mindful",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=cork+yoga+mat",
    price: 2499,
    keywords: ["yoga","mat","wellness","mindful"]
  },
  {
    name: "Aromatherapy Reed Diffuser",
    category: "wellness",
    vibe: "Serene Luxurious Home",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=reed+diffuser",
    price: 1299,
    keywords: ["diffuser","aromatherapy","home","serene"]
  },
  {
    name: "Collagen Peptide Beauty Powder",
    category: "wellness",
    vibe: "Healthy Radiant Inner Glow",
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=collagen+supplement",
    price: 1799,
    keywords: ["collagen","supplement","beauty","wellness"]
  },
  {
    name: "Linen Meditation Cushion",
    category: "wellness",
    vibe: "Grounded Peaceful Ritual",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=600&fit=crop&q=90",
    shopLink: "https://www.amazon.in/s?k=meditation+cushion",
    price: 999,
    keywords: ["meditation","cushion","wellness","mindful"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitswipe');
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    console.log('Cleared existing products');
    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products successfully`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();