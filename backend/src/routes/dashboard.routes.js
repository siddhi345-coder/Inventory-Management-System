const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');

router.get('/stats', auth, ctrl.getDashboardStats);
router.get('/top-products', auth, ctrl.getTopProducts);
router.get('/sales-chart', auth, ctrl.getSalesChartData);
router.get('/activities', auth, ctrl.getRecentActivities);
router.get('/overview', auth, ctrl.getSalesOverview);

module.exports = router;
