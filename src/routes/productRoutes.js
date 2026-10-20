const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:name', productController.getProductByName);
router.post('/', protect, admin, productController.createProduct);
router.put('/:name', protect, admin, productController.updateProduct);
router.patch('/:name', protect, admin, productController.patchProduct);
router.delete('/:name', protect, admin, productController.deleteProduct);

module.exports = router;
