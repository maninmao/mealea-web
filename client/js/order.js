// order.js — logic for checkout.html only
// Depends on: cart.js (must be loaded first)

function renderOrderSummary() {
  const cart     = getCart();
  const subtotal = getCartSubtotal();
  const tax      = subtotal * 0.10;
  const total    = subtotal + tax;
  const summaryEl = document.getElementById('orderItems');
  const totalEl   = document.getElementById('orderTotal');

  if (!summaryEl) return;

  if (cart.length === 0) {
    // No items — send them back to menu
    window.location.href = 'menu.html';
    return;
  }

  summaryEl.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.img}" alt="${item.name}" onerror="this.src='logo.png'">
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

function handlePaymentSubmit(e) {
  e.preventDefault();

  const name    = document.getElementById('fullName').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const method  = document.querySelector('input[name="payMethod"]:checked')?.value;

  // Basic validation
  if (!name || !phone || !address) {
    showToast('Please fill in all required fields.');
    return;
  }

  // Save order info to localStorage so confirmation.html can read it
  const cart     = getCart();
  const subtotal = getCartSubtotal();
  const tax      = subtotal * 0.10;
  const orderId  = 'MLR-' + Date.now().toString().slice(-6);

  const order = {
    orderId,
    name,
    phone,
    address,
    method,
    items: cart,
    subtotal: subtotal.toFixed(2),
    tax:      tax.toFixed(2),
    total:    (subtotal + tax).toFixed(2),
    date:     new Date().toLocaleString(),
  };

  localStorage.setItem('mealeaOrder', JSON.stringify(order));

  // Clear the cart after placing order
  clearCart(); // from cart.js

  // Go to confirmation
  window.location.href = 'confirmation.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();

  const form = document.getElementById('paymentForm');
  if (form) form.addEventListener('submit', handlePaymentSubmit);

  // Toggle card fields visibility based on payment method
  document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const cardFields = document.getElementById('cardFields');
      if (cardFields) {
        cardFields.style.display = radio.value === 'card' ? 'block' : 'none';
      }
    });
  });
});
