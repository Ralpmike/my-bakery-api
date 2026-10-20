const Product = require('../models/productModel');

// Match a product by its id, or by its name (case-insensitive)
const productFilter = (idOrName) => {
    if (/^[a-f\d]{24}$/i.test(idOrName)) return { _id: idOrName };
    const escaped = idOrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { name: new RegExp('^' + escaped + '$', 'i') };
};

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single product by name
// @route   GET /api/products/:idOrName
exports.getProductByName = async (req, res) => {
    try {
        const product = await Product.findOne(productFilter(req.params.name));
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update product (PUT)
// @route   PUT /api/products/:name
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            productFilter(req.params.name),
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Patch product (PATCH)
// @route   PATCH /api/products/:name
exports.patchProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            productFilter(req.params.name),
            { $set: req.body },
            { returnDocument: 'after' }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:name
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete(productFilter(req.params.name));
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
