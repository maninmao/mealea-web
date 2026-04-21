// server/services/orderService.js
const Order = require('../models/Order');
const Cart  = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createOrder = async (userId, items, paymentMethod = 'cod', address = '') => {
    const orderItems = items.map(item => ({
        menuItem: item._id || item.id,
        name:     item.name,
        price:    item.price,
        quantity: item.qty,
        imageUrl: item.img || item.imageUrl || ''   
    }));

    const subtotal    = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax         = subtotal * 0.10;
    const totalAmount = subtotal + tax;              

    const order = await Order.create({
        user:          userId,
        items:         orderItems,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        address,
    });

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return order;
};

exports.createCheckoutSession = async (userId, userEmail) => {
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');

    if (!cart || cart.items.length === 0) {
        throw new Error('Your cart is empty.');
    }

    let subtotal = 0;
    const lineItems = cart.items.map(cartItem => {
        const dish = cartItem.menuItem;
        subtotal += dish.price * cartItem.quantity;

        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name:   dish.name,
                    images: [dish.imageUrl],
                },
                unit_amount: Math.round(dish.price * 100),
            },
            quantity: cartItem.quantity,
        };
    });

    const taxAmount = Math.round(subtotal * 0.10 * 100);
    lineItems.push({
        price_data: {
            currency:     'usd',
            product_data: { name: 'Tax (10%)' },
            unit_amount:  taxAmount,
        },
        quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email:       userEmail,
        line_items:           lineItems,
        mode:                 'payment',
        success_url: `${process.env.CLIENT_URL}/pages/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${process.env.CLIENT_URL}/pages/cart.html`,
    });


    const orderItems = cart.items.map(cartItem => ({
        menuItem: cartItem.menuItem._id,
        name:     cartItem.menuItem.name,
        price:    cartItem.menuItem.price,
        quantity: cartItem.quantity,
        imageUrl: cartItem.menuItem.imageUrl || ''  
    }));

    const tax         = subtotal * 0.10;
    const totalAmount = subtotal + tax;            

    await Order.create({
        user:            userId,
        items:           orderItems,
        totalAmount,                                
        paymentMethod:   'card',
        stripeSessionId: session.id,
        paymentStatus:   'pending',
    });

    return session.url;
};

exports.verifyAndCompleteOrder = async (sessionId, userId) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
        throw new Error('Payment was not completed.');
    }

    const order = await Order.findOne({ stripeSessionId: sessionId });

    if (!order) {
        throw new Error('Order not found.');
    }

    if (order.paymentStatus === 'paid') {
        return order; // idempotent
    }

    order.paymentStatus = 'paid';
    await order.save();

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return order;
};


exports.getAllOrders = async () => {
    return await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
};


exports.updateOrderStatus = async (id, status) => {
    const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );
    if (!order) throw new Error('Order not found');
    return order;
};