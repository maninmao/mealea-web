
import { request } from './api.js';

window.allMenuItems = [];

// load and render
async function loadMenuFromBackend() {
    try {
        const menus = await request('/menu');   // GET /api/menu
        window.allMenuItems = menus || [];
        console.log(`Loaded ${window.allMenuItems.length} menu items`);

        const appetizer = window.allMenuItems.filter(i => i.category === 'Appetizer');
        const main      = window.allMenuItems.filter(i => i.category === 'Main');
        const dessert   = window.allMenuItems.filter(i => i.category === 'Dessert');
        const drink     = window.allMenuItems.filter(i => i.category === 'Drink');
        const takeout   = window.allMenuItems.filter(i => i.isTakeoutAvailable === true);

        renderAllMenuSections(appetizer, main, dessert, drink, takeout);
    } catch (error) {
        console.error('Failed to load menu:', error);
        showMenuError();
    }
}

function renderAllMenuSections(appetizer, main, dessert, drink, takeout) {
    const grids = {
        all:       document.getElementById('grid-all'),
        appetizer: document.getElementById('grid-appetizer'),
        main:      document.getElementById('grid-main'),
        dessert:   document.getElementById('grid-dessert'),
        takeout:   document.getElementById('grid-takeout'),
        drink:     document.getElementById('grid-drink'),
    };

    // Clear all grids
    Object.values(grids).forEach(g => { if (g) g.innerHTML = ''; });

    if (!grids.all) return;

    // All items
    window.allMenuItems.forEach(item => grids.all.appendChild(createMenuCard(item)));

    // Individual sections
    appetizer.forEach(item => grids.appetizer?.appendChild(createMenuCard(item)));
    main.forEach(item      => grids.main?.appendChild(createMenuCard(item)));
    dessert.forEach(item   => grids.dessert?.appendChild(createMenuCard(item)));
    takeout.forEach(item   => grids.takeout?.appendChild(createMenuCard(item)));
    drink.forEach(item     => grids.drink?.appendChild(createMenuCard(item)));
}

// card build
function createMenuCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-card';

    const imageSrc = item.imageUrl || item.img || '../assets/images/logo.png';
    const itemId   = item._id || item.id;

    card.innerHTML = `
        <div class="card-img-wrap">
            <img src="${imageSrc}"
                 alt="${item.name}"
                 onerror="this.src='../assets/images/logo.png'">
            ${item.tag ? `<div class="card-tag">${item.tag}</div>` : ''}
        </div>
        <div class="card-body">
            <div class="card-name">${item.name}</div>
            <div class="card-desc">${item.description || item.desc || ''}</div>
            <div class="card-footer">
                <div class="card-price">$${parseFloat(item.price).toFixed(2)}</div>
                <button class="add-btn" data-id="${itemId}">Add to Cart</button>
            </div>
        </div>
    `;

    return card;
}

document.addEventListener('click', e => {
    if (!e.target.classList.contains('add-btn')) return;

    const id = e.target.dataset.id;
    if (typeof addToCart === 'function') {
        addToCart(id);
    } else {
        console.error('addToCart not found — is cart.js loaded?');
    }

    // Visual feedback
    e.target.classList.add('added');
    setTimeout(() => e.target.classList.remove('added'), 500);
});

// cat tab nav
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.cat-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.dataset.section;

            document.querySelectorAll('.menu-section').forEach(section => {
                if (targetId === 'all-menu') {
                    section.style.display = '';
                } else {
                    section.style.display = section.id === targetId ? '' : 'none';
                }
            });

            // Smooth scroll
            const target = document.getElementById(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Error
function showMenuError() {
    const gridAll = document.getElementById('grid-all');
    if (gridAll) {
        gridAll.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#888;">
                <p style="font-size:18px; margin-bottom:8px;">Unable to load menu</p>
                <p style="font-size:14px;">Please make sure the backend server is running on port 5000.</p>
                <button onclick="location.reload()" style="margin-top:16px; padding:8px 20px; cursor:pointer;">
                    Try Again
                </button>
            </div>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadMenuFromBackend();
    initCategoryTabs();


    if (typeof updateCartBadge === 'function') updateCartBadge();
});