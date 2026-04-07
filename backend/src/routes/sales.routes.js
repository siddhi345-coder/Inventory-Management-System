const router = require('express').Router();
const ctrl = require('../controllers/sales.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, ctrl.getSales);
router.get('/:id', auth, ctrl.getSaleById);
router.post('/', auth, ctrl.createSale);

module.exports = router;
