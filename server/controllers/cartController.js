// server/controllers/cartController.js
const cartService = require('../services/cartService');

exports.addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;
        const cart = await cartService.addItem(req.user.id, menuItemId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const result = await cartService.clearCart(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;
        const cart = await cartService.updateItemQuantity(req.user.id, menuItemId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        // We use 404 here because the service might throw "Cart not found"
        res.status(404).json({ error: error.message });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const cart = await cartService.removeItem(req.user.id, menuItemId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};