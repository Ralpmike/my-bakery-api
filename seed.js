require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Product = require('./src/models/productModel');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Product.deleteMany();
        console.log('Existing products cleared.');

        // Read data.json
        const dataPath = path.join(__dirname, 'data.json');
        const rawData = await fs.readFile(dataPath, 'utf8');
        const { data: products } = JSON.parse(rawData);

        // Process products to ensure image paths are root-relative (starting with /assets)
        const processedProducts = products.map(product => {
            const newImage = {};
            for (const [key, value] of Object.entries(product.image)) {
                // Remove the leading '.' if it exists to make it /assets/...
                newImage[key] = value.startsWith('.') ? value.substring(1) : value;
            }
            return { ...product, image: newImage };
        });

        // Insert data
        await Product.insertMany(processedProducts);
        console.log(`${processedProducts.length} products seeded successfully!`);

        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
