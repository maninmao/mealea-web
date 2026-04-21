'use strict';


const API_BASE = 'http://127.0.0.1:5000/api';


let menuItems    = [];
let orders       = [];
let reservations = [];
let currentUser  = null;
let editingMenuId = null;   // null = create, string = update

// API HELPER 
async function apiFetch(url, options = {}, skipAutoLogout = false) {
    const isFormData = options.body instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

    const res = await fetch(API_BASE + url, {
        credentials: 'include',
        headers,
        ...options,
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (res.status === 401) {

        if (!skipAutoLogout && currentUser) {
            logout(false);
        }
        throw new Error(data.message || 'Session expired. Please login again.');
    }
    if (!res.ok) throw new Error(data.message || data.error || 'API Error');
    return data;
}

//  AUTH 
async function login() {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errEl    = document.getElementById('auth-error');
    errEl.style.display = 'none';

    try {
        const user = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }, true);  // true = don't auto-logout if backend returns 401 (wrong password)

        if (user.role !== 'admin') {
            await apiFetch('/auth/logout', { method: 'POST' });
            errEl.textContent   = 'Access denied: Admin accounts only.';
            errEl.style.display = 'block';
            return;
        }

        currentUser = user;
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app').style.display         = 'flex';

        const nameEl = document.querySelector('.user-name');
        const avaEl  = document.querySelector('.user-avatar');
        if (nameEl) nameEl.textContent = user.name || 'Admin';
        if (avaEl)  avaEl.textContent  = (user.name || 'A')[0].toUpperCase();

        initApp();
    } catch (err) {
        errEl.textContent   = err.message || 'Login failed.';
        errEl.style.display = 'block';
    }
}

async function logout(reload = true) {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    currentUser = null;
    if (reload) {
        location.reload();
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app').style.display         = 'none';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('auth-screen').style.display !== 'none') {
        login();
    }
});

async function initApp() {
    updateTopbarDate();
    setInterval(updateTopbarDate, 60000);
    await Promise.allSettled([fetchMenu(), fetchOrders(), fetchReservations()]);
}

function updateTopbarDate() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// Nav
function navigate(pageId, clickedEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (clickedEl) clickedEl.classList.add('active');

    const titles = { dashboard: 'Dashboard', menu: 'Menu Management', orders: 'Online Orders', reservations: 'Reservations' };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[pageId] || pageId;
}

// Menu
async function fetchMenu() {
    try {
        menuItems = await apiFetch('/menu');
        renderMenu(menuItems);
    } catch (err) {
        showToast('Failed to load menu: ' + err.message, true);
    }
}

function renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    if (!items || items.length === 0) {
        grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;padding:40px 0;text-align:center">No menu items found.</p>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="menu-card">
            <div class="menu-card-img">
                ${item.imageUrl
                    ? `<img src="${item.imageUrl}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div class=no-img-placeholder>🍽</div>'">`
                    : '<div class="no-img-placeholder">🍽</div>'}
            </div>
            <div class="menu-card-body">
                <div class="menu-card-name">${item.name}</div>
                <div class="menu-card-cat">${item.category}</div>
                <div class="menu-card-desc">${item.description || ''}</div>
                <div class="menu-card-footer">
                    <div class="menu-price">$${parseFloat(item.price).toFixed(2)}</div>
                    <div class="menu-actions">
                        <button class="icon-btn" onclick="openMenuModal('${item._id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="icon-btn danger" onclick="deleteMenuItem('${item._id}', '${item.name.replace(/'/g, "\\'")}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterMenu(query) {
    const q = query.toLowerCase();
    renderMenu(menuItems.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
    ));
}

function filterMenuCat(cat) {
    renderMenu(cat ? menuItems.filter(i => i.category === cat) : menuItems);
}


function openMenuModal(id = null) {
    editingMenuId = id;
    const modal   = document.getElementById('menu-modal');
    const title   = document.getElementById('menu-modal-title');

    document.getElementById('m-name').value        = '';
    document.getElementById('m-price').value       = '';
    document.getElementById('m-desc').value        = '';
    document.getElementById('m-cat').value         = 'Appetizers';
    document.getElementById('m-available').checked = true;
    removeImagePreview();

    if (id) {
        const item = menuItems.find(i => i._id === id);
        if (!item) return;
        title.textContent = 'Edit Menu Item';
        document.getElementById('m-name').value            = item.name;
        document.getElementById('m-price').value           = item.price;
        document.getElementById('m-desc').value            = item.description || '';
        document.getElementById('m-cat').value             = item.category;
        document.getElementById('m-available').checked     = item.isTakeoutAvailable !== false;

        if (item.imageUrl) {
            document.getElementById('m-img-preview').src = item.imageUrl;
            document.getElementById('m-img-preview-wrap').classList.add('show');
            document.getElementById('m-img-upload-area').style.display = 'none';
        }
    } else {
        title.textContent = 'Add Menu Item';
    }

    modal.classList.add('open');
}

function onImageSelected(input) {
    if (!input.files || !input.files[0]) return;
    const file   = input.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('m-img-preview').src = e.target.result;
        document.getElementById('m-img-preview-wrap').classList.add('show');
        document.getElementById('m-img-upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    document.getElementById('m-img-preview').src = '';
    document.getElementById('m-img-preview-wrap').classList.remove('show');
    document.getElementById('m-img-upload-area').style.display = '';
    const fileInput = document.getElementById('m-img-file');
    if (fileInput) fileInput.value = '';
}

async function saveMenuItem() {
    const name  = document.getElementById('m-name').value.trim();
    const price = parseFloat(document.getElementById('m-price').value);
    const desc  = document.getElementById('m-desc').value.trim();
    const cat   = document.getElementById('m-cat').value;
    const avail = document.getElementById('m-available').checked;

    if (!name || isNaN(price) || price < 0) {
        showToast('Please fill in name and a valid price.', true);
        return;
    }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', price);
    fd.append('description', desc);
    fd.append('category', cat);
    fd.append('isTakeoutAvailable', avail);

    const fileInput = document.getElementById('m-img-file');
    if (fileInput && fileInput.files[0]) {
        fd.append('image', fileInput.files[0]);
    }

    try {
        if (editingMenuId) {
            const updated = await apiFetch(`/menu/${editingMenuId}`, { method: 'PUT', body: fd });
            menuItems = menuItems.map(i => i._id === editingMenuId ? updated : i);
            showToast('Menu item updated');
        } else {
            const created = await apiFetch('/menu', { method: 'POST', body: fd });
            menuItems.unshift(created);
            showToast('Menu item added');
        }

        renderMenu(menuItems);
        closeModal('menu-modal');
        renderDashboard();
    } catch (err) {
        showToast(err.message, true);
    }
}

async function deleteMenuItem(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
        await apiFetch(`/menu/${id}`, { method: 'DELETE' });
        menuItems = menuItems.filter(i => i._id !== id);
        renderMenu(menuItems);
        showToast(`"${name}" deleted`);
        renderDashboard();
    } catch (err) {
        showToast(err.message, true);
    }
}

// Orders
async function fetchOrders() {
    try {

        orders = await apiFetch('/orders/all');
        renderOrders(orders);
        renderDashboard();
    } catch (err) {
        showToast('Failed to load orders: ' + err.message, true);
        orders = [];
        renderOrders([]);
        renderDashboard();
    }
}

function renderOrders(items) {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    const pending = items.filter(o => o.paymentStatus === 'pending').length;
    const badge   = document.getElementById('orders-badge');
    if (badge) badge.textContent = pending || '0';

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">No orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(o => {
        const itemNames = (o.items || []).map(i => i.name).join(', ') || '—';

        const total    = o.totalAmount || 0;
        const time     = new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Show payment status badge
        const statusMap = {
            pending:   'badge-pending',
            paid:      'badge-ready',
            failed:    'badge-cancelled',
            preparing: 'badge-preparing',
            ready:     'badge-ready',
            completed: 'badge-delivered',
            cancelled: 'badge-cancelled'
        };
        const badgeCls = statusMap[o.paymentStatus] || 'badge-pending';

        // Show order fulfilment status d
        const statusOptions = ['preparing', 'ready', 'completed', 'cancelled'];

        return `<tr>
            <td><span style="font-size:12px;color:var(--muted)">ORD-${o._id.slice(-6).toUpperCase()}</span></td>
            <td>${o.user?.name || o.user?.email || '—'}</td>
            <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${itemNames}</td>
            <td><strong>$${total.toFixed(2)}</strong></td>
            <td>${time}</td>
            <td><span class="badge ${badgeCls}">${o.paymentStatus}</span></td>
            <td>
                <select class="filter-select" style="padding:5px 8px;font-size:12px"
                    onchange="updateOrderStatus('${o._id}', this.value)">
                    <option value="">Update…</option>
                    ${statusOptions.map(s =>
                        `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
                    ).join('')}
                </select>
            </td>
        </tr>`;
    }).join('');
}

function filterOrders(query) {
    const q = query.toLowerCase();
    renderOrders(orders.filter(o =>
        (o.user?.name  || '').toLowerCase().includes(q) ||
        (o.user?.email || '').toLowerCase().includes(q) ||
        o._id.toLowerCase().includes(q) ||
        (o.items || []).some(i => i.name.toLowerCase().includes(q))
    ));
}

function filterOrderStatus(status) {
    renderOrders(status ? orders.filter(o => o.paymentStatus === status.toLowerCase()) : orders);
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    try {
       
        await apiFetch(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        orders = orders.map(o => o._id === id ? { ...o, status } : o);
        renderOrders(orders);
        showToast('Order status updated');
    } catch (err) {
        showToast(err.message, true);
    }
}

function openOrderModal() {
    document.getElementById('o-name').value  = '';
    document.getElementById('o-phone').value = '';
    document.getElementById('o-items').value = '';
    document.getElementById('o-total').value = '';
    document.getElementById('order-modal').classList.add('open');
}

function saveOrder() {
    showToast('Manual order creation coming soon');
    closeModal('order-modal');
}

// Reservation
async function fetchReservations() {
    try {
        reservations = await apiFetch('/reservations/admin');
        renderReservations(reservations);
        renderTableGrid();
        renderDashboard();
    } catch (err) {
        showToast('Failed to load reservations: ' + err.message, true);
    }
}

function renderReservations(items) {
    const tbody = document.getElementById('reservations-tbody');
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">No reservations found.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(r => {
        const date     = r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—';
        const statusMap = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
        const badgeCls  = statusMap[r.status] || 'badge-pending';

        return `<tr>
            <td>
                <div class="reservation-row">
                    <div class="table-badge">
                        <div class="table-num">${r.numberOfPeople}</div>
                        <div class="table-type">guests</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="res-name">${r.customerName || '—'}</div>
                <div class="res-detail">${r.customerEmail || ''}</div>
            </td>
            <td>${r.numberOfPeople}</td>
            <td>${date} · ${r.time || '—'}</td>
            <td><span class="badge ${badgeCls}">${r.status}</span></td>
            <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:12px">
                ${r.specialRequests || '—'}
            </td>
            <td>
                <select class="filter-select" style="padding:5px 8px;font-size:12px"
                    onchange="updateReservationStatus('${r._id}', this.value)">
                    <option value="">Update…</option>
                    <option value="confirmed"  ${r.status === 'confirmed'  ? 'selected' : ''}>Confirmed</option>
                    <option value="pending"    ${r.status === 'pending'    ? 'selected' : ''}>Pending</option>
                    <option value="cancelled"  ${r.status === 'cancelled'  ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>`;
    }).join('');
}

function filterReservations(query) {
    const q = query.toLowerCase();
    renderReservations(reservations.filter(r =>
        (r.customerName  || '').toLowerCase().includes(q) ||
        (r.customerEmail || '').toLowerCase().includes(q)
    ));
}

function filterResStatus(status) {
    renderReservations(status ? reservations.filter(r => r.status === status.toLowerCase()) : reservations);
}

async function updateReservationStatus(id, status) {
    if (!status) return;
    try {
        await apiFetch(`/reservations/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        reservations = reservations.map(r => r._id === id ? { ...r, status } : r);
        renderReservations(reservations);
        renderTableGrid();
        renderDashboard();
        showToast('Reservation status updated');
    } catch (err) {
        showToast(err.message, true);
    }
}

function renderTableGrid() {
    const grid = document.getElementById('table-grid');
    if (!grid) return;

    const today       = new Date().toISOString().slice(0, 10);
    const todayActive = reservations.filter(r => {
        const rDate = r.date ? new Date(r.date).toISOString().slice(0, 10) : '';
        return rDate === today && r.status !== 'cancelled';
    });

    const tables = Array.from({ length: 12 }, (_, i) => {
        const num      = i + 1;
        const occupied = todayActive.some((_, ri) => (ri % 12) + 1 === num);
        const types    = ['Window', 'Window', 'Booth', 'Booth', 'Centre', 'Centre', 'Patio', 'Patio', 'Bar', 'Bar', 'Private', 'Private'];
        const caps     = [2, 2, 4, 4, 6, 6, 4, 4, 2, 2, 8, 8];
        return { num, type: types[i], cap: caps[i], occupied };
    });

    grid.innerHTML = tables.map(t => `
        <div class="table-card ${t.occupied ? 'occupied' : 'available'}">
            <div class="tc-num">${t.num}</div>
            <div class="tc-type">${t.type}</div>
            <div class="tc-cap">Up to ${t.cap}</div>
            <span class="badge ${t.occupied ? 'badge-occupied' : 'badge-available'}" style="font-size:10px">
                ${t.occupied ? 'Occupied' : 'Free'}
            </span>
        </div>
    `).join('');

    const occupied = tables.filter(t => t.occupied).length;
    const statEl   = document.getElementById('stat-tables');
    const fillEl   = document.getElementById('occupancy-fill');
    const pctEl    = document.getElementById('occupancy-pct');
    const pct      = Math.round((occupied / tables.length) * 100);
    if (statEl)  statEl.textContent = `${occupied}/${tables.length}`;
    if (fillEl)  fillEl.style.width = pct + '%';
    if (pctEl)   pctEl.textContent  = pct + '% Occupancy';
}

function openResModal() {
    document.getElementById('r-name').value   = '';
    document.getElementById('r-phone').value  = '';
    document.getElementById('r-notes').value  = '';
    document.getElementById('r-guests').value = '2';
    document.getElementById('r-status').value = 'confirmed';
    document.getElementById('r-date').value   = new Date().toISOString().slice(0, 10);
    document.getElementById('r-time').value   = '19:00';
    document.getElementById('res-modal').classList.add('open');
}

async function saveReservation() {
    const name   = document.getElementById('r-name').value.trim();
    const guests = document.getElementById('r-guests').value;
    const date   = document.getElementById('r-date').value;
    const time   = document.getElementById('r-time').value;
    const notes  = document.getElementById('r-notes').value.trim();
    const status = document.getElementById('r-status').value.toLowerCase();

    if (!name || !date || !time) {
        showToast('Name, date and time are required.', true);
        return;
    }

    try {

        const res = await apiFetch('/reservations', {
            method: 'POST',
            body: JSON.stringify({
                numberOfPeople:  parseInt(guests),
                date,
                time,
                specialRequests: notes,
                status,
                customerName:    name,          
                customerEmail:   '',            // walk-in then no email required
            }),
        });
        reservations.unshift(res);
        renderReservations(reservations);
        renderTableGrid();
        renderDashboard();
        closeModal('res-modal');
        showToast('Reservation created');
    } catch (err) {
        showToast(err.message, true);
    }
}

// ── DASHBOARD ─────────────────────────────────────────────────
function renderDashboard() {
    const statOrders = document.getElementById('stat-orders');
    const statRes    = document.getElementById('stat-res');
    if (statOrders) statOrders.textContent = orders.length;
    if (statRes)    statRes.textContent    = reservations.length;

    const dashOrders = document.getElementById('dash-orders');
    if (dashOrders) {
        const recent = orders.slice(0, 5);
        if (!recent.length) {
            dashOrders.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:20px 0">No orders yet.</p>';
        } else {
            dashOrders.innerHTML = recent.map(o => {

                const total    = o.totalAmount || 0;
                const names    = (o.items || []).slice(0, 2).map(i => i.name).join(', ');
                const more     = (o.items || []).length > 2 ? ` +${o.items.length - 2}` : '';
                const badgeCls = o.paymentStatus === 'paid' ? 'badge-ready' : o.paymentStatus === 'cancelled' ? 'badge-cancelled' : 'badge-pending';
                return `
                    <div class="order-row">
                        <div class="order-id">ORD-${o._id.slice(-4).toUpperCase()}</div>
                        <div class="order-info">
                            <div class="order-name">${o.user?.name || 'Customer'}</div>
                            <div class="order-items">${names}${more}</div>
                        </div>
                        <span class="order-amount">$${total.toFixed(2)}</span>
                        <span class="badge ${badgeCls}">${o.paymentStatus}</span>
                    </div>`;
            }).join('');
        }
    }

    const dashRes = document.getElementById('dash-reservations');
    if (dashRes) {
        const today    = new Date().toISOString().slice(0, 10);
        const todayRes = reservations.filter(r => {
            const d = r.date ? new Date(r.date).toISOString().slice(0, 10) : '';
            return d === today;
        }).slice(0, 5);

        if (!todayRes.length) {
            dashRes.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:20px 0">No reservations today.</p>';
        } else {
            dashRes.innerHTML = todayRes.map(r => {
                const badgeCls = r.status === 'confirmed' ? 'badge-confirmed' : r.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending';
                return `
                    <div class="order-row">
                        <div class="order-id">${r.time || '—'}</div>
                        <div class="order-info">
                            <div class="order-name">${r.customerName || '—'}</div>
                            <div class="order-items">${r.numberOfPeople} guests</div>
                        </div>
                        <span class="badge ${badgeCls}">${r.status}</span>
                    </div>`;
            }).join('');
        }
    }
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
});

let _toastTimer;
function showToast(msg, isError = false) {
    const toast  = document.getElementById('toast');
    const msgEl  = document.getElementById('toast-msg');
    const iconEl = document.getElementById('toast-icon');
    if (!toast) return;

    msgEl.textContent      = msg;
    iconEl.textContent     = isError ? '⚠' : '✓';
    toast.style.background = isError ? 'var(--burgundy)' : 'var(--dark-brown)';
    toast.classList.add('show');

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Expose
window.login                   = login;
window.logout                  = logout;
window.navigate                = navigate;
window.openMenuModal           = openMenuModal;
window.saveMenuItem            = saveMenuItem;
window.deleteMenuItem          = deleteMenuItem;
window.filterMenu              = filterMenu;
window.filterMenuCat           = filterMenuCat;
window.onImageSelected         = onImageSelected;
window.removeImagePreview      = removeImagePreview;
window.closeModal              = closeModal;
window.openOrderModal          = openOrderModal;
window.saveOrder               = saveOrder;
window.filterOrders            = filterOrders;
window.filterOrderStatus       = filterOrderStatus;
window.updateOrderStatus       = updateOrderStatus;
window.openResModal            = openResModal;
window.saveReservation         = saveReservation;
window.filterReservations      = filterReservations;
window.filterResStatus         = filterResStatus;
window.updateReservationStatus = updateReservationStatus;