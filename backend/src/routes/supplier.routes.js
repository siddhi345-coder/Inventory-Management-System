const router = require('express').Router();
const ctrl = require('../controllers/supplier.controller');

router.get('/', ctrl.getSuppliers);
router.post('/', ctrl.addSupplier);
router.put('/:id', ctrl.updateSupplier);
router.delete('/:id', ctrl.deleteSupplier);
router.get('/:id/products', ctrl.getSupplierProducts);
router.get('/products/:productId/suppliers', ctrl.getProductSuppliers);

module.exports = router;