
const orderService = require('../services/orderService');

exports.placeOrder = async (req, res) => {
    try {
        const { items, paymentMethod, address } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty.' });
        }

        const order = await orderService.createOrder(req.user.id, items, paymentMethod, address);
        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Place Order Error:', error);
        res.status(400).json({ error: error.message || 'Failed to place order.' });
    }
};

exports.createCheckoutSession = async (req, res) => {
    try {
        const url = await orderService.createCheckoutSession(req.user.id, req.user.email);
        res.json({ url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(400).json({ error: error.message || 'Failed to create checkout session.' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const order = await orderService.verifyAndCompleteOrder(session_id, req.user.id);
        res.json({ success: true, order });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to verify payment.' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch orders.' });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.status(200).json(order);
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(400).json({ error: error.message || 'Failed to update order status.' });
    }
};