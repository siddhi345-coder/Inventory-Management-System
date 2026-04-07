const router = require('express').Router();
const ctrl = require('../controllers/customer.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, ctrl.getCustomers);
router.get('/:id', auth, ctrl.getCustomerById);
router.post('/', auth, ctrl.addCustomer);
router.put('/:id', auth, ctrl.updateCustomer);
router.delete('/:id', auth, ctrl.deleteCustomer);

module.exports = router;