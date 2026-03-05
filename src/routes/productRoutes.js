const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:name', productController.getProductByName);
router.post('/', productController.createProduct);
router.put('/:name', productController.updateProduct);
router.patch('/:name', productController.patchProduct);
router.delete('/:name', productController.deleteProduct);

module.exports = router;
