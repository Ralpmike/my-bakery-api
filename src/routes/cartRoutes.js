const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);
router.post('/items', cartController.addItem);
router.patch('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);

module.exports = router;
