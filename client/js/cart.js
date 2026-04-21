

const CART_KEY = 'mealeaCart';


function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Core cart 
function addToCart(itemId) {

    const items = window.allMenuItems || [];
    const item  = items.find(i => (i._id === itemId || i.id === itemId));

    if (!item) {
        console.error('Item not found in allMenuItems:', itemId);
        return;
    }

    const cart     = getCart();
    const existing = cart.find(c => c.id === itemId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id:       item._id || item.id,   
            name:     item.name,
            price:    item.price,
            img:      item.imageUrl || item.img || '',
            category: item.category || '',
            qty:      1
        });
    }

    saveCart(cart);
    updateCartBadge();
    showToast(`${item.name} added to cart!`);
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i.id !== id));
    updateCartBadge();
}

function updateCartItem(id, qty) {
    if (qty <= 0) { removeFromCart(id); return; }
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = qty; saveCart(cart); }
    updateCartBadge();
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

function getCartSubtotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartTotalQty() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
}


function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const qty = getCartTotalQty();
    badge.textContent = qty;
    badge.classList.toggle('visible', qty > 0);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderCartPage() {
    const layout = document.getElementById('cartLayout');
    if (!layout) return;   

    const cart = getCart();
    updateCartBadge();

    if (cart.length === 0) {
        layout.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" stroke-width="1.2" fill="none" stroke="#ccc">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                </svg>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <a href="menu.html" class="back-btn">Browse the Menu</a>
            </div>`;
        return;
    }

    const subtotal = getCartSubtotal();
    const tax      = subtotal * 0.10;
    const total    = subtotal + tax;

    const itemsHTML = cart.map(item => `
        <div class="cart-item">
            <img class="item-img" src="${item.img}" alt="${item.name}"
                 onerror="this.src='../assets/images/logo.png'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-category">${item.category || ''}</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
                    <div class="qty-num">${item.qty}</div>
                    <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="item-right">
                <span class="item-price">$${(item.price * item.qty).toFixed(2)}</span>
                <button class="remove-btn" onclick="handleRemove('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');

    layout.innerHTML = `
        <div class="cart-items-panel">
            <h2>Order Items (${getCartTotalQty()})</h2>
            ${itemsHTML}
            <div class="cart-actions">
                <button class="clear-btn" onclick="handleClearCart()">Clear Cart</button>
                <a href="menu.html" class="continue-link">← Continue Shopping</a>
            </div>
        </div>

        <aside class="order-summary">
            <h2>Order Summary</h2>
            <div class="promo-wrap">
                <input class="promo-input" type="text" id="promoInput" placeholder="Promo code" />
                <button class="promo-btn" onclick="applyPromo()">Apply</button>
            </div>
            <div class="summary-row">
                <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%)</span><span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Delivery</span><span class="free-label">Free</span>
            </div>
            <div class="summary-row total">
                <span>Total</span><span>$${total.toFixed(2)}</span>
            </div>
            <p class="summary-note">Taxes are estimated. Final amount confirmed at checkout.</p>
            <a href="checkout.html" class="checkout-btn">Proceed to Payment</a>
            <hr class="divider-line">
            <div style="text-align:center;">
                <a href="menu.html" class="continue-link">← Add more items</a>
            </div>
        </aside>`;
}


function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    updateCartItem(id, item.qty + delta);
    renderCartPage();
}

function handleRemove(id) {
    removeFromCart(id);
    showToast('Item removed');
    renderCartPage();
}

function handleClearCart() {
    showClearModal();
}

function showClearModal() {
    if (!document.getElementById('clearModal')) {
        const modal = document.createElement('div');
        modal.id = 'clearModal';
        modal.innerHTML = `
            <div class="clear-modal-backdrop" onclick="closeClearModal()"></div>
            <div class="clear-modal-box">
                <div class="clear-modal-icon">🗑️</div>
                <h3 class="clear-modal-title">Clear your cart?</h3>
                <p class="clear-modal-msg">All items will be removed. This cannot be undone.</p>
                <div class="clear-modal-actions">
                    <button class="clear-modal-cancel"  onclick="closeClearModal()">Keep Items</button>
                    <button class="clear-modal-confirm" onclick="confirmClearCart()">Clear Cart</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('clearModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeClearModal() {
    const modal = document.getElementById('clearModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function confirmClearCart() {
    closeClearModal();
    clearCart();
    renderCartPage();
}

function applyPromo() {
    const code = document.getElementById('promoInput')?.value.trim().toUpperCase();
    showToast(code === 'MEALEA10' ? 'Promo applied! 10% off.' : 'Invalid promo code.');
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCartPage();   
});