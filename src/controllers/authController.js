const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

const sendUserWithToken = (res, statusCode, user) => {
    res.status(statusCode).json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        sendUserWithToken(res, 201, user);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Log in a user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }
        const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        sendUserWithToken(res, 200, user);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get the logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};
