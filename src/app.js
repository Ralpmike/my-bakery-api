const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serving static files from the 'assets' folder
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/api/products', productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;
