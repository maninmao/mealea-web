// Load cart from localStorage if exists
const savedCart = localStorage.getItem('cart');
if (savedCart) {
  cart = JSON.parse(savedCart);
}

// ── MENU DATA ──
const menuData = {
  appetizer: [
    { id: 'a1', name: 'Beef Salad with Koh Kong Sauce', desc: 'Marinated beef with Koh Kong Sauce', price: 6.50, img: '../assets/images/apt0.png', tag: 'Chef\'s Pick' },
    { id: 'a2', name: 'Grilled Beef Salad with Crispy Morning Glory', desc: 'Grilled beef fillet, crispy morning glory, seasonal vegetables, Khmer herbs and garlic dressing', price: 6.00, img: '../assets/images/apt2.png', tag: '' },
    { id: 'a3', name: 'Pan-seared Sihanoukville Scallops', desc: 'Fresh local scallops seared with citrus and Kampot pepper.', price: 5.50, img: '../assets/images/apt9.png', tag: 'Popular' },
    { id: 'a4', name: 'King Prawn and Kep Crab Salad', desc: 'Grilled king prawn, Kep crab meat, winged bean, roasted bell pepper, roasted coconut, shrimp paste dressing ', price: 7.00, img: '../assets/images/apt3.png', tag: '' },
    { id: 'a5', name: 'Natang', desc: 'Delicious prawn and minced pork cooked in coconut milk,dried chili paste and crispy shallot, served with rice crackers', price: 7.50, img: '../assets/images/apt4.png', tag: 'Signature' },
    { id: 'a6', name: 'Khmer Tapas Degustation 5 Kinds', desc: 'Five bite-sized Khmer specialties highlighting bold flavors and textures', price: 8.00, img: '../assets/images/apt8.jpg', tag: '' },
  ],
  main: [
    { id: 'm1', name: 'Amok Trey', desc: 'Traditional Cambodian fish amok — steamed in banana leaves with a rich coconut kroeung custard.', price: 14.00, img: '../assets/images/main8.png', tag: 'Signature' },
    { id: 'm2', name: 'Lok Lak Beef', desc: 'Wok-tossed beef cubes with Kampot pepper sauce, served on fresh lettuce with a lime dip.', price: 15.00, img: '../assets/images/main5.png', tag: 'Popular' },
    { id: 'm3', name: 'Chicken Soup with Kompot Pepper', desc: 'Slow-cooked chicken in Kampot pepper broth with lotus root, dried shitake, carrot and coriander leaf', price: 11.50, img: '../assets/images/main3.4.png', tag: '' },
    { id: 'm4', name: 'Grilled River Fish', desc: 'Whole river fish grilled over charcoal, served with fermented fish sauce and sticky rice.', price: 16.00, img: '../assets/images/main2.png', tag: 'Chef\'s Pick' },
    { id: 'm5', name: 'Samlor Korko', desc: 'A hearty vegetable and pork stew, one of Cambodia\'s oldest and most beloved soups.', price: 12.00, img: '../assets/images/main1.png', tag: '' },
    { id: 'm6', name: 'Bai Sach Chrouk', desc: 'Grilled garlic pork over jasmine rice, served with pickled daikon and a side of clear broth.', price: 10.00, img: '../assets/images/main11.png', tag: 'Popular' },
    { id: 'm7', name: 'Sombok Teuk Kroeung', desc: 'Pounded river fish with garlic, grilled fermented fish, lime, salmon roe, served with seasonal vegetables', price: 13.50, img: '../assets/images/main7.png', tag: '' },
    { id: 'm8', name: 'Grilled Duck Leg', desc: 'Duck leg marinated in five-spice and star anise, served with plum sauce and jasmine rice.', price: 17.00, img: '../assets/images/main9.png', tag: 'Signature' },
  ],
  dessert: [
    { id: 'd1', name: 'Sticky Rice Dumpling', desc: 'Served with roasted sesame and ginger sauce.', price: 5.00, img: '../assets/images/dest3.png', tag: 'Traditional' },
    { id: 'd2', name: 'Turmeric Crepe', desc: 'Turmeric crepe wrapped with Mung bean, shredded coconut, mixed seasonal fresh fruit, served with cashew nut ice-cream and caramel passion sauce', price: 5.50, img: '../assets/images/dest2.png', tag: 'Popular' },
    { id: 'd3', name: 'Bai Damnoeb', desc: 'Sticky black rice pudding topped with fresh coconut cream and a sprinkle of sesame seeds.', price: 5.00, img: '../assets/images/dest4.png', tag: 'Chef\'s Pick' },
    { id: 'd4', name: 'Khmer Crème Caramel', desc: 'A silky pandan-infused custard with a golden caramel top — our modern twist on a classic.', price: 5.50, img: '../assets/images/dest1.png', tag: 'Signature' },
  ],
  takeout: [
    { id: 'a5', name: 'Natang', desc: 'Delicious prawn and minced pork cooked in coconut milk,dried chili paste and crispy shallot, served with rice crackers', price: 7.50, img: '../assets/images/apt4.png', tag: 'Signature' },
    { id: 'a6', name: 'Khmer Tapas Degustation 5 Kinds', desc: 'Five bite-sized Khmer specialties highlighting bold flavors and textures', price: 8.00, img: '../assets/images/apt8.jpg', tag: '' },
    { id: 'm2', name: 'Lok Lak Beef', desc: 'Wok-tossed beef cubes with Kampot pepper sauce, served on fresh lettuce with a lime dip.', price: 15.00, img: '../assets/images/main5.png', tag: 'Popular' },
    { id: 'm6', name: 'Bai Sach Chrouk', desc: 'Grilled garlic pork over jasmine rice, served with pickled daikon and a side of clear broth.', price: 10.00, img: '../assets/images/main11.png', tag: 'Popular' },
    { id: 'm8', name: 'Grilled Duck Leg', desc: 'Duck leg marinated in five-spice and star anise, served with plum sauce and jasmine rice.', price: 17.00, img: '../assets/images/main9.png', tag: 'Signature' },
    { id: 'd3', name: 'Bai Damnoeb', desc: 'Sticky black rice pudding topped with fresh coconut cream and a sprinkle of sesame seeds.', price: 5.00, img: '../assets/images/dest4.png', tag: 'Chef\'s Pick' },
  ],
  drink: [
    { id: 'd1', name: 'MEALEA Special', desc: 'A refreshing house special made with a blend of citrus juices, lightly sweetened and served chilled.', price: 6.50, img: '../assets/images/drink1.jpg', tag: 'Popular' },
    { id: 'd2', name: 'Classic Mojito', desc: 'A refreshing mix of lime juice, mint leaves, brown sugar, and soda, creating a cool and zesty beverage.', price: 7.00, img: '../assets/images/drink2.jpg', tag: '' },
    { id: 'd2', name: 'Virgin Pina Colada', desc: 'A tropical blend of pineapple juice and creamy coconut milk, served chilled for a smooth and refreshing taste.', price: 6.00, img: '../assets/images/drink3.jpg', tag: '' },
    { id: 'd3', name: 'Bellini', desc: 'A delightful blend of peach puree and sparkling champagne, offering a light and fruity flavor.', price: 15.50, img: '../assets/images/drink4.jpg', tag: 'Traditional' },
    { id: 'd4', name: 'Honey Lemonade', desc: 'Freshly squeezed lemon juice mixed with natural honey and chilled water, delivering a sweet and tangy refreshment.', price: 4.50, img: '../assets/images/drink5.jpg', tag: 'Signature' },
    { id: 'd5', name: 'Kulen', desc: 'Pure mineral water sourced from the Kulen mountains, served cold for a crisp and refreshing hydration.', price: 1.50, img: '../assets/images/drink6.jpg', tag: 'Signature' },
  
  ]
};

// ── GENERATE MENU CARDS ──
function createMenuCard(item) {
  const card = document.createElement('div');
  card.className = 'menu-card';
  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${item.img}" alt="${item.name}" />
      <div class="card-tag">${item.tag ? item.tag : ''}</div>
    </div>
    <div class="card-body">
      <div class="card-name">${item.name}</div>
      <div class="card-desc">${item.desc}</div>
      <div class="card-footer">
        <div class="card-price">$${item.price.toFixed(2)}</div>
        <button class="add-btn" data-id="${item.id}">Add to Cart</button>
      </div>
    </div>
  `;
  return card;
}


function renderMenu() {
  const gridAll = document.getElementById('grid-all');
  const gridApp = document.getElementById('grid-appetizer');
  const gridMain = document.getElementById('grid-main');
  const gridDessert = document.getElementById('grid-dessert');
  const gridTakeout = document.getElementById('grid-takeout');
  const gridDrink = document.getElementById('grid-drink');


  // Render all items
  const allItems = [...menuData.appetizer, ...menuData.main, ...menuData.dessert];
  allItems.forEach(item => gridAll.appendChild(createMenuCard(item)));

  // Render categories separately
  menuData.appetizer.forEach(item => gridApp.appendChild(createMenuCard(item)));
  menuData.main.forEach(item => gridMain.appendChild(createMenuCard(item)));
  menuData.dessert.forEach(item => gridDessert.appendChild(createMenuCard(item)));
  menuData.takeout.forEach(item => gridTakeout.appendChild(createMenuCard(item)));
  menuData.drink.forEach(item => gridDrink.appendChild(createMenuCard(item)));
}


// ── ADD TO CART ──
document.addEventListener('click', e => {
  if (e.target.classList.contains('add-btn')) {
    const id = e.target.dataset.id;
    addToCart(id); // <-- uses cart.js
    e.target.classList.add('added');
    setTimeout(() => e.target.classList.remove('added'), 400);
  }
});


// ── TAB CLICK FILTER ──
const tabs = document.querySelectorAll('.cat-tab');
const sections = document.querySelectorAll('.menu-section');

tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();

    // Remove active class from all tabs
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const sectionId = tab.dataset.section;

    sections.forEach(sec => {
      if (sectionId === 'all-menu') {
        sec.classList.remove('hidden'); // show all
      } else {
        sec.classList.toggle('hidden', sec.id !== sectionId); // hide non-selected
      }
    });

    // Optional: scroll smoothly to top of the visible section
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});


// ── INIT ──
renderMenu();
updateCartBadge(); // <-- cart.js function
