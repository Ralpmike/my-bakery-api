require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const path = require('path');
const Product = require('./src/models/productModel');

async function migrate() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // 2. Configure Cloudinary
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });

    // 3. Load data.json
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const { data: products } = JSON.parse(rawData);

    console.log(`Starting migration of ${products.length} products...`);

    for (let product of products) {
      console.log(`Processing: ${product.name}`);
      const newImagePaths = {};

      // 4. Upload each image variant to Cloudinary
      for (const [variant, localPath] of Object.entries(product.image)) {
        // Construct the full path to the local image file
        const fullLocalPath = path.resolve(__dirname, localPath);

        console.log(`  Uploading ${variant}: ${fullLocalPath}`);

        // A fixed public_id (the file name) makes re-runs overwrite instead of duplicating
        const uploadResponse = await cloudinary.uploader.upload(fullLocalPath, {
          folder: 'bakery_project',
          public_id: path.parse(localPath).name,
          overwrite: true
        });

        // Store the new "Live URL" from Cloudinary
        newImagePaths[variant] = uploadResponse.secure_url;
      }

      // 5. Create or update the product (matched by name) with the Cloudinary URLs
      await Product.findOneAndUpdate(
        { name: product.name },
        { ...product, image: newImagePaths },
        { upsert: true, runValidators: true }
      );
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
