const router = require('express').Router();
const ctrl = require('../controllers/product.controller');

router.get('/', ctrl.getProducts);
router.post('/', ctrl.addProduct);
router.put('/:id', ctrl.updateProduct);
router.patch('/:id/stock', ctrl.updateStock);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;