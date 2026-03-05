require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const path = require('path');

// 1. Define the Mongoose Schema
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: {
    thumbnail: String,
    mobile: String,
    tablet: String,
    desktop: String
  }
});

const Product = mongoose.model('Product', productSchema);

async function migrate() {
  try {
    // 2. Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    // 3. Configure Cloudinary
    cloudinary.config({ 
        cloudinary_url: process.env.CLOUDINARY_URL 
    });

    // 4. Load data.json
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const { data: products } = JSON.parse(rawData);

    console.log(`Starting migration of ${products.length} products...`);

    for (let product of products) {
      console.log(`Processing: ${product.name}`);
      const newImagePaths = {};

      // 5. Upload each image variant to Cloudinary
      for (const [variant, localPath] of Object.entries(product.image)) {
        // Construct the full path to the local image file
        const fullLocalPath = path.resolve(__dirname, localPath);
        
        console.log(`  Uploading ${variant}: ${fullLocalPath}`);
        
        const uploadResponse = await cloudinary.uploader.upload(fullLocalPath, {
          folder: 'bakery_project',
          use_filename: true,
          unique_filename: true
        });

        // Store the new "Live URL" from Cloudinary
        newImagePaths[variant] = uploadResponse.secure_url;
      }

      // 6. Update product with Cloudinary URLs and save to MongoDB
      product.image = newImagePaths;
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`  Successfully migrated: ${product.name}\n`);
    }

    console.log('--- Migration Complete! ---');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
