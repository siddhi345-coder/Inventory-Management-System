const router = require('express').Router();
const ctrl = require('../controllers/purchase.controller');

router.get('/', ctrl.getPurchases);
router.post('/', ctrl.createPurchase);

module.exports = router;