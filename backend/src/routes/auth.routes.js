const router = require('express').Router();
const { register, login, sendOtp, verifyOtpAndReset } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp-reset', verifyOtpAndReset);

module.exports = router;