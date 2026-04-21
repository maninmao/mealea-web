// server/routes/orderRoutes.js
const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Customer routes
router.post('/place',                    protect,       orderController.placeOrder);
router.post('/create-checkout-session',  protect,       orderController.createCheckoutSession);
router.get('/verify-payment',            protect,       orderController.verifyPayment);
//admin

router.get('/all',            protect, admin, orderController.getAllOrders);
router.put('/:id/status',     protect, admin, orderController.updateOrderStatus);

module.exports = router;