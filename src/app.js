const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serving static files from the 'assets' folder
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// API documentation
app.get('/api-docs.json', (req, res) => res.json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, {
    customSiteTitle: 'Bakery API Docs',
    swaggerOptions: { persistAuthorization: true }
}));
app.get('/', (req, res) => res.redirect('/api-docs'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

module.exports = app;
