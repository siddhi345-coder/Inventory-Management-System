const router = require('express').Router();
const ctrl = require('../controllers/supplier.controller');

router.get('/', ctrl.getSuppliers);
router.post('/', ctrl.addSupplier);
router.put('/:id', ctrl.updateSupplier);
router.delete('/:id', ctrl.deleteSupplier);

module.exports = router;