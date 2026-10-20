const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const round = (n) => Math.round(n * 100) / 100;
const isId = (id) => /^[a-f\d]{24}$/i.test(String(id));

// Load the user's cart with product details, creating an empty one if needed
const loadCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    // Drop items whose product has since been deleted
    cart.items = cart.items.filter((item) => item.product);
    return cart;
};

const formatCart = (cart) => {
    const items = cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        lineTotal: round(item.product.price * item.quantity)
    }));
    return {
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: round(items.reduce((sum, item) => sum + item.lineTotal, 0))
    };
};

const findItem = (cart, productId) =>
    cart.items.find((item) => item.product._id.toString() === productId);

exports.loadCart = loadCart;
exports.formatCart = formatCart;

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id);
        res.status(200).json(formatCart(cart));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a product to the cart (adds to the quantity if it's already there)
// @route   POST /api/cart/items
exports.addItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be a whole number of at least 1' });
        }
        if (!isId(productId) || !(await Product.exists({ _id: productId }))) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const cart = await loadCart(req.user._id);
        const existing = findItem(cart, String(productId));
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
        await cart.save();
        await cart.populate('items.product');
        res.status(201).json(formatCart(cart));
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Set the quantity of a cart item (0 removes it)
// @route   PATCH /api/cart/items/:productId
exports.updateItem = async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be a whole number of 0 or more' });
        }

        const cart = await loadCart(req.user._id);
        const existing = findItem(cart, req.params.productId);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Item not in cart' });
        }
        if (quantity === 0) {
            cart.items = cart.items.filter((item) => item !== existing);
        } else {
            existing.quantity = quantity;
        }
        await cart.save();
        res.status(200).json(formatCart(cart));
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Remove a product from the cart
// @route   DELETE /api/cart/items/:productId
exports.removeItem = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id);
        const existing = findItem(cart, req.params.productId);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Item not in cart' });
        }
        cart.items = cart.items.filter((item) => item !== existing);
        await cart.save();
        res.status(200).json(formatCart(cart));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Empty the cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id);
        cart.items = [];
        await cart.save();
        res.status(200).json(formatCart(cart));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
