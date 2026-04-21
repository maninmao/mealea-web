

function renderOrderSummary() {
    const cart      = getCart();
    const subtotal  = getCartSubtotal();
    const tax       = subtotal * 0.10;
    const total     = subtotal + tax;
    const summaryEl = document.getElementById('orderItems');
    const totalEl   = document.getElementById('orderTotal');

    if (!summaryEl) return;

    if (cart.length === 0) {
        window.location.href = 'menu.html';
        return;
    }

    summaryEl.innerHTML = cart.map(item => `
        <div class="summary-item">
            <img src="${item.img}" alt="${item.name}" onerror="this.src='../assets/images/logo.png'">
            <div class="summary-item-info">
                <span class="summary-item-name">${item.name}</span>
                <span class="summary-item-qty">x${item.qty}</span>
            </div>
            <span class="summary-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');

    totalEl.innerHTML = `
        <div class="total-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="total-row"><span>Tax (10%)</span><span>$${tax.toFixed(2)}</span></div>
        <div class="total-row"><span>Delivery</span><span style="color:#4caf50">Free</span></div>
        <div class="total-row grand"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    `;
}

async function handlePaymentSubmit(e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty.');
        return;
    }

    // Check login
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) {
        alert('Please sign in to place an order.');
        window.location.href = 'login.html';
        return;
    }

    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'cod';
    const address   = document.getElementById('address')?.value?.trim() || '';

    if (payMethod === 'cod') {
        await handleCOD(cart, address);
    } else {
        await handleStripe(cart);
    }
}

// Cash on delivery
async function handleCOD(cart, address) {
    const btn    = document.getElementById('placeOrderBtn') || document.querySelector('[type="submit"]');
    const status = document.getElementById('confirm-status');

    if (btn) { btn.disabled = true; btn.textContent = 'Placing Order…'; }
    if (status) { status.style.display = 'block'; status.textContent = 'Sending your order…'; }

    try {
        const res = await fetch('http://127.0.0.1:5000/api/orders/place', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items: cart, paymentMethod: 'cod', address })
        });

        if (res.status === 401) {
            alert('Your session has expired. Please sign in again.');
            window.location.href = 'login.html';
            return;
        }

        const data = await res.json();

        if (data.success) {
            clearCart();
            window.location.href = 'order-success.html';
        } else {
            showToast(data.error || 'Failed to place order. Please try again.');
            if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
            if (status) status.style.display = 'none';
        }

    } catch (err) {
        console.error('COD Error:', err);
        showToast('Could not connect to server. Is the backend running?');
        if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
        if (status) status.style.display = 'none';
    }
}

// Card 
async function handleStripe(cart) {
    try {
        showToast('Syncing your order...');

        // Sync local cart to DB
        const syncPromises = cart.map(item =>
            fetch('http://127.0.0.1:5000/api/cart/add', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    menuItemId: item._id || item.id,
                    quantity:   item.qty
                })
            })
        );

        const syncResults = await Promise.all(syncPromises);

        if (syncResults.some(res => res.status === 401)) {
            alert('Please sign in to complete your order.');
            window.location.href = 'login.html';
            return;
        }

        // Create Stripe session
        const sessionRes = await fetch('http://127.0.0.1:5000/api/orders/create-checkout-session', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const sessionData = await sessionRes.json();

        if (sessionData.url) {
            clearCart();
            window.location.href = sessionData.url;
        } else {
            throw new Error(sessionData.error || 'Checkout session failed');
        }

    } catch (err) {
        console.error('Stripe Checkout Error:', err);
        showToast('Connection error. Is the server running?');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();

    const form = document.getElementById('paymentForm');
    if (form) form.addEventListener('submit', handlePaymentSubmit);

    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const cardFields = document.getElementById('cardFields');
            if (cardFields) {
                cardFields.style.display = radio.value === 'card' ? 'block' : 'none';
            }
        });
    });
});