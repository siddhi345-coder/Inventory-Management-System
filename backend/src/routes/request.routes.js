const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { createRequest, getMyRequests, getAllRequests, updateRequestStatus } = require('../controllers/request.controller');

router.post('/', auth, createRequest);
router.get('/my', auth, getMyRequests);
router.get('/', auth, getAllRequests);
router.patch('/:id/status', auth, updateRequestStatus);

module.exports = router;
