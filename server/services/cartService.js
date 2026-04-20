// server/services/cartService.js
const Cart = require('../models/Cart');

exports.addItem = async (userId, menuItemId, quantity) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // Create a new cart if the user doesn't have one
        cart = await Cart.create({ user: userId, items: [{ menuItem: menuItemId, quantity }] });
    } else {
        // Check if item already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);

        if (itemIndex > -1) {
            // Item exists, just update the quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Item does not exist, push it to the array
            cart.items.push({ menuItem: menuItemId, quantity });
        }
        await cart.save();
    }
    
    return cart;
};

exports.getCart = async (userId) => {
    // Populate the menuItem to get the name, price, and image for the frontend
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    if (!cart) return { user: userId, items: [] }; // Return empty cart structure if none exists
    return cart;
};

exports.clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return { message: "Cart cleared successfully" };
};

exports.updateItemQuantity = async (userId, menuItemId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        return cart;
    } else {
        throw new Error("Item not found in cart");
    }
};

exports.removeItem = async (userId, menuItemId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(item => item.menuItem.toString() !== menuItemId);
    await cart.save();
    return cart;
};