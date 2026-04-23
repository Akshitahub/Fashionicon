const mongoose = require('mongoose');
require('dotenv').config();

async function seedDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  await db.collection('products').deleteMany({});
  console.log('Cleared existing products');

  const products = [
    { name: "Rouge Allure Velvet Lipstick", category: "beauty", vibe: "Bold Confident Statement", imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6b23e5f10c?w=600&h=600&fit=crop&q=90", shopLink: "https://www.nykaa.com/search/result/?q=velvet+lipstick", price: 1850, keywords: ["lipstick","beauty","makeup","bold"] },
    { name: "Hyaluronic Acid Glow Serum", category: "beauty", vibe: "Glowy Healthy Skincare", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=90", shopLink: "https://www.nykaa.com/search/result/?q=hyaluronic+serum", price: 1299, keywords: ["serum","skincare","glow","hyaluronic"] },
    { name: "Rose Quartz Facial Roller", category: "beauty", vibe: "Soft Natural Ritual", imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop&q=90", shopLink: "https://www.nykaa.com/search/result/?q=face+roller", price: 799, keywords: ["facial","roller","skincare","glow"] },
    { name: "Structured Black Blazer", category: "fashion", vibe: "Powerful Polished Timeless", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&q=90", shopLink: "https://www.myntra.com/blazer", price: 3999, keywords: ["blazer","black","fashion","formal"] },
    { name: "Classic Blue Denim", category: "fashion", vibe: "Casual Chic Effortless", imageUrl: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&h=600&fit=crop&q=90", shopLink: "https://www.myntra.com/jeans", price: 2499, keywords: ["jeans","denim","blue","casual"] },
    { name: "Gold Chain Layered Necklace", category: "fashion", vibe: "Refined Subtle Accessory", imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&q=90", shopLink: "https://www.amazon.in/s?k=gold+chain+necklace", price: 1599, keywords: ["necklace","gold","jewelry","accessory"] },
    { name: "White Leather Minimal Sneakers", category: "shoes", vibe: "Clean Casual Everyday", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=90", shopLink: "https://www.nike.com/in", price: 4999, keywords: ["sneakers","white","leather","minimal"] },
    { name: "Tan Leather Chelsea Boots", category: "shoes", vibe: "Effortless Cool Autumnal", imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&fit=crop&q=90", shopLink: "https://www.myntra.com/boots", price: 5999, keywords: ["boots","chelsea","tan","leather"] },
    { name: "Premium Wireless Earbuds", category: "electronics", vibe: "Minimal Focused Modern", imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&q=90", shopLink: "https://www.amazon.in/s?k=wireless+earbuds", price: 7999, keywords: ["earbuds","wireless","audio","minimal"] },
    { name: "Smart Watch Rose Gold", category: "electronics", vibe: "Modern Productive Elegant", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=90", shopLink: "https://www.amazon.in/s?k=smart+watch", price: 12999, keywords: ["smartwatch","rosegold","tech","elegant"] },
    { name: "Premium Cork Yoga Mat", category: "wellness", vibe: "Calm Centred Mindful", imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop&q=90", shopLink: "https://www.amazon.in/s?k=cork+yoga+mat", price: 2499, keywords: ["yoga","mat","wellness","mindful"] },
    { name: "Aromatherapy Reed Diffuser", category: "wellness", vibe: "Serene Luxurious Home", imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop&q=90", shopLink: "https://www.amazon.in/s?k=reed+diffuser", price: 1299, keywords: ["diffuser","aromatherapy","home","serene"] }
  ];

  await db.collection('products').insertMany(products);
  console.log(`Seeded ${products.length} products successfully`);
  await mongoose.connection.close();
  process.exit(0);
}

seedDB().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});