const Order = require('../models/orderModel');
const { loadCart, formatCart } = require('./cartController');

// @desc    Place an order from the current cart, then empty the cart
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id);
        if (cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const { items, totalPrice } = formatCart(cart);
        const order = await Order.create({
            user: req.user._id,
            items: items.map(({ product, quantity }) => ({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image.thumbnail
            })),
            totalPrice
        });

        cart.items = [];
        await cart.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get the logged-in user's orders, newest first
// @route   GET /api/orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get one of the logged-in user's orders
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = /^[a-f\d]{24}$/i.test(req.params.id)
            ? await Order.findOne({ _id: req.params.id, user: req.user._id })
            : null;
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
