// server/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/add', protect, cartController.addToCart);
router.get('/', protect, cartController.getCart);
router.delete('/clear', protect, cartController.clearCart);
router.put('/update', protect, cartController.updateQuantity);
router.delete('/remove/:menuItemId', protect, cartController.removeItem);

module.exports = router;