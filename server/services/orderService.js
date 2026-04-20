// server/services/orderService.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (userId, userEmail) => {
    // 1. Fetch the user's cart and populate the menu items to get prices
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    
    if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty.");
    }

    // 2. Format items for Stripe and calculate the total amount
    let totalAmount = 0;
    const lineItems = cart.items.map(cartItem => {
        const dish = cartItem.menuItem;
        totalAmount += (dish.price * cartItem.quantity);

        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: dish.name,
                    images: [dish.imageUrl], // Optional, looks nice on Stripe checkout
                },
                unit_amount: Math.round(dish.price * 100), // Stripe expects amounts in cents
            },
            quantity: cartItem.quantity,
        };
    });

    // 3. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    // 4. Create a "Pending" Order in our database
    const orderItems = cart.items.map(cartItem => ({
        menuItem: cartItem.menuItem._id,
        name: cartItem.menuItem.name,
        price: cartItem.menuItem.price,
        quantity: cartItem.quantity
    }));

    await Order.create({
        user: userId,
        items: orderItems,
        totalAmount: totalAmount,
        stripeSessionId: session.id,
        paymentStatus: 'pending'
    });

    // 5. Return the Stripe URL to redirect the user
    return session.url;
};

exports.verifyAndCompleteOrder = async (sessionId, userId) => {
    // 1. Fetch the session directly from Stripe to ensure it's valid
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
        throw new Error("Payment was not completed.");
    }

    // 2. Find the pending order in our database using the session ID
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
        throw new Error("Order not found.");
    }

    // 3. Update order status to paid
    order.paymentStatus = 'paid';
    await order.save();

    // 4. Empty the user's cart now that the order is successful
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return order;
};