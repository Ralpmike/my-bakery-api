const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    image: {
        thumbnail: { type: String, required: true },
        mobile: { type: String, required: true },
        tablet: { type: String, required: true },
        desktop: { type: String, required: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
