// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, orderController.createCheckoutSession);
router.get('/verify-payment', protect, orderController.verifyPayment);

module.exports = router;