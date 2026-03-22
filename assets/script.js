'use strict';

/* ============================================================
   STATE
   ============================================================ */
const state = {
  cart: [],      // { id, name, price, img, qty }
  wishlist: [],  // { id, name, price, img }
  compare: []    // { id, name, price, img, brand, category }
};

/* ============================================================
   PRODUCT DATA  (mirrors the data-* attributes in HTML)
   ============================================================ */
const products = [
  { id: '1', name: 'Running Sneaker Shoes',  price: 180.85, img: './assets/images/product-1.jpg', brand: 'Nike',   category: 'Men / Women'  },
  { id: '2', name: 'Leather Mens Slipper',   price: 190.85, img: './assets/images/product-2.jpg', brand: 'Bata',   category: 'Men / Sports' },
  { id: '3', name: 'Simple Fabric Shoe',     price: 160.85, img: './assets/images/product-3.jpg', brand: 'Apex',   category: 'Men / Women'  },
  { id: '4', name: 'Air Jordan 7 Retro',     price: 170.85, img: './assets/images/product-4.jpg', brand: 'Nike',   category: 'Men / Sports', originalPrice: 200.21 },
  { id: '5', name: 'Nike Air Max 270 SE',    price: 120.85, img: './assets/images/product-5.jpg', brand: 'Nike',   category: 'Men / Women'  },
  { id: '6', name: 'Adidas Sneakers Shoes',  price: 100.85, img: './assets/images/product-6.jpg', brand: 'Adidas', category: 'Men / Women'  },
  { id: '7', name: 'Nike Basketball Shoes',  price: 120.85, img: './assets/images/product-7.jpg', brand: 'Nike',   category: 'Men / Sports' },
  { id: '8', name: 'Puma Simple Fabric Shoe',price: 100.85, img: './assets/images/product-8.jpg', brand: 'Puma',   category: 'Men / Women'  }
];

function getProduct(id) {
  return products.find(p => p.id === String(id));
}

/* ============================================================
   HELPERS
   ============================================================ */
function fmt(n) { return '$' + parseFloat(n).toFixed(2); }

function saveCartToStorage() {
  try { localStorage.setItem('footcap_cart', JSON.stringify(state.cart)); } catch(e) {}
}

function getProductDataFromCard(card) {
  return {
    id:       card.dataset.id,
    name:     card.dataset.name,
    price:    parseFloat(card.dataset.price),
    img:      card.dataset.img,
    brand:    card.dataset.brandLabel,
    category: card.dataset.category
  };
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <ion-icon name="${type === 'success' ? 'checkmark-circle-outline' : 'information-circle-outline'}"></ion-icon>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ============================================================
   NAVBAR TOGGLE
   ============================================================ */
const overlay       = document.querySelector('[data-overlay]');
const navOpenBtn    = document.querySelector('[data-nav-open-btn]');
const navbar        = document.querySelector('[data-navbar]');
const navCloseBtn   = document.querySelector('[data-nav-close-btn]');

[overlay, navOpenBtn, navCloseBtn].forEach(el => {
  el.addEventListener('click', () => {
    navbar.classList.toggle('active');
    overlay.classList.toggle('active');
  });
});

/* ============================================================
   STICKY HEADER + GO TOP
   ============================================================ */
const header   = document.querySelector('[data-header]');
const goTopBtn = document.querySelector('[data-go-top]');

window.addEventListener('scroll', () => {
  if (window.scrollY >= 80) {
    header.classList.add('active');
    goTopBtn.classList.add('active');
  } else {
    header.classList.remove('active');
    goTopBtn.classList.remove('active');
  }
});

/* ============================================================
   DRAWER OVERLAY (shared by cart & wishlist)
   ============================================================ */
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer(drawerId) {
  document.getElementById(drawerId).classList.add('active');
  drawerOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  drawerOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

drawerOverlay.addEventListener('click', closeAllDrawers);

/* ============================================================
   ESCAPE KEY — close any open modal / drawer / search
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeAllDrawers();
  closeQuickView();
  closeProductDetail();
  closeCompareModal();
  closeSearch();
});

/* ============================================================
   CART
   ============================================================ */
function updateCartNav() {
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = count;
  document.getElementById('cartBadge').value = count;
  document.getElementById('cartTotal').innerHTML = `Basket: <strong>${fmt(total)}</strong>`;
  document.getElementById('cartSubtotal').textContent = fmt(total);
}

function renderCart() {
  const list    = document.getElementById('cartItemList');
  const empty   = document.getElementById('cartEmpty');
  const footer  = document.getElementById('cartFooter');

  list.innerHTML = '';

  if (state.cart.length === 0) {
    empty.style.display  = 'flex';
    footer.style.display = 'none';
    return;
  }

  empty.style.display  = 'none';
  footer.style.display = 'block';

  state.cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="drawer-item-img">
      <div class="drawer-item-info">
        <h4 class="drawer-item-name">${item.name}</h4>
        <p class="drawer-item-price">${fmt(item.price)}</p>
        <div class="drawer-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">
            <ion-icon name="remove-outline"></ion-icon>
          </button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">
            <ion-icon name="add-outline"></ion-icon>
          </button>
        </div>
      </div>
      <button class="drawer-item-remove" data-id="${item.id}" aria-label="Remove">
        <ion-icon name="close-outline"></ion-icon>
      </button>
    `;
    list.appendChild(li);
  });

  updateCartNav();
}

function addToCart(data) {
  const existing = state.cart.find(i => i.id === data.id);
  if (existing) {
    existing.qty++;
    showToast(`${data.name} quantity updated`);
  } else {
    state.cart.push({ ...data, qty: 1 });
    showToast(`${data.name} added to cart`);
  }
  renderCart();
  saveCartToStorage();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  renderCart();
  saveCartToStorage();
}

function updateCartQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderCart();
  saveCartToStorage();
}

// Cart button listeners
document.getElementById('cartOpenBtn').addEventListener('click', () => {
  renderCart();
  openDrawer('cartDrawer');
});
document.getElementById('cartCloseBtn').addEventListener('click', closeAllDrawers);
document.getElementById('cartContinueBtn').addEventListener('click', closeAllDrawers);

document.getElementById('clearCartBtn').addEventListener('click', () => {
  state.cart = [];
  renderCart();
  saveCartToStorage();
  showToast('Cart cleared', 'info');
});

document.getElementById('footerCartBtn').addEventListener('click', () => {
  renderCart();
  openDrawer('cartDrawer');
});

// Cart item qty & remove delegation
document.getElementById('cartItemList').addEventListener('click', e => {
  const qtyBtn    = e.target.closest('[data-action="inc"], [data-action="dec"]');
  const removeBtn = e.target.closest('.drawer-item-remove');

  if (qtyBtn) {
    const delta = qtyBtn.dataset.action === 'inc' ? 1 : -1;
    updateCartQty(qtyBtn.dataset.id, delta);
  }
  if (removeBtn) {
    removeFromCart(removeBtn.dataset.id);
  }
});

/* ============================================================
   WISHLIST
   ============================================================ */
function updateWishlistNav() {
  const count = state.wishlist.length;
  document.getElementById('wishlistBadge').textContent = count;
  document.getElementById('wishlistBadge').value = count;
}

function renderWishlist() {
  const list   = document.getElementById('wishlistItemList');
  const empty  = document.getElementById('wishlistEmpty');
  const footer = document.getElementById('wishlistFooter');

  list.innerHTML = '';

  if (state.wishlist.length === 0) {
    empty.style.display  = 'flex';
    footer.style.display = 'none';
    return;
  }

  empty.style.display  = 'none';
  footer.style.display = 'block';

  state.wishlist.forEach(item => {
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="drawer-item-img">
      <div class="drawer-item-info">
        <h4 class="drawer-item-name">${item.name}</h4>
        <p class="drawer-item-price">${fmt(item.price)}</p>
        <button class="btn btn-primary btn-sm wish-to-cart" data-id="${item.id}">
          Add to Cart
        </button>
      </div>
      <button class="drawer-item-remove" data-id="${item.id}" aria-label="Remove">
        <ion-icon name="close-outline"></ion-icon>
      </button>
    `;
    list.appendChild(li);
  });
}

function toggleWishlist(data) {
  const idx = state.wishlist.findIndex(i => i.id === data.id);
  if (idx === -1) {
    state.wishlist.push(data);
    showToast(`${data.name} added to wishlist`);
    // Update all heart buttons for this product
    updateWishlistButtons(data.id, true);
  } else {
    state.wishlist.splice(idx, 1);
    showToast(`${data.name} removed from wishlist`, 'info');
    updateWishlistButtons(data.id, false);
  }
  updateWishlistNav();
  renderWishlist();
}

function updateWishlistButtons(productId, isWishlisted) {
  document.querySelectorAll(`.product-card[data-id="${productId}"] [data-action="wishlist"]`).forEach(btn => {
    btn.classList.toggle('wishlisted', isWishlisted);
    const icon = btn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', isWishlisted ? 'heart' : 'heart-outline');
  });
}

// Wishlist button listeners
document.getElementById('wishlistOpenBtn').addEventListener('click', () => {
  renderWishlist();
  openDrawer('wishlistDrawer');
});
document.getElementById('wishlistCloseBtn').addEventListener('click', closeAllDrawers);
document.getElementById('wishlistContinueBtn').addEventListener('click', closeAllDrawers);
document.getElementById('footerWishlistBtn').addEventListener('click', () => {
  renderWishlist();
  openDrawer('wishlistDrawer');
});

document.getElementById('moveAllToCartBtn').addEventListener('click', () => {
  state.wishlist.forEach(item => {
    const existing = state.cart.find(i => i.id === item.id);
    if (existing) { existing.qty++; } else { state.cart.push({ ...item, qty: 1 }); }
  });
  state.wishlist = [];
  document.querySelectorAll('[data-action="wishlist"].wishlisted').forEach(btn => {
    btn.classList.remove('wishlisted');
    const icon = btn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', 'heart-outline');
  });
  renderCart();
  saveCartToStorage();
  updateWishlistNav();
  renderWishlist();
  showToast('All wishlist items moved to cart');
});

// Wishlist item add-to-cart & remove delegation
document.getElementById('wishlistItemList').addEventListener('click', e => {
  const removeBtn  = e.target.closest('.drawer-item-remove');
  const toCartBtn  = e.target.closest('.wish-to-cart');

  if (removeBtn) {
    const item = state.wishlist.find(i => i.id === removeBtn.dataset.id);
    if (item) toggleWishlist(item);
  }
  if (toCartBtn) {
    const item = state.wishlist.find(i => i.id === toCartBtn.dataset.id);
    if (item) {
      addToCart(item);
      state.wishlist = state.wishlist.filter(i => i.id !== item.id);
      updateWishlistButtons(item.id, false);
      updateWishlistNav();
      renderWishlist();
    }
  }
});

/* ============================================================
   QUICK VIEW MODAL
   ============================================================ */
const quickViewOverlay = document.getElementById('quickViewOverlay');

function openQuickView(data) {
  const product = getProduct(data.id) || data;
  const body = document.getElementById('quickViewBody');

  body.innerHTML = `
    <div class="qv-img-wrap">
      <img src="${product.img}" alt="${product.name}" class="qv-img">
    </div>
    <div class="qv-info">
      <p class="qv-brand">${product.brand || data.brand || ''}</p>
      <h2 class="qv-title">${product.name}</h2>
      <p class="qv-category">${product.category || data.category || ''}</p>
      <div class="qv-price">
        <span class="qv-price-current">${fmt(product.price)}</span>
        ${product.originalPrice ? `<span class="qv-price-old">${fmt(product.originalPrice)}</span>` : ''}
      </div>
      <p class="qv-desc">Premium quality footwear engineered for comfort, style, and durability. Perfect for everyday use and special occasions alike.</p>
      <div class="qv-actions">
        <div class="qv-qty-wrap">
          <button class="qty-btn" id="qvDec"><ion-icon name="remove-outline"></ion-icon></button>
          <span class="qty-value" id="qvQty">1</span>
          <button class="qty-btn" id="qvInc"><ion-icon name="add-outline"></ion-icon></button>
        </div>
        <button class="btn btn-primary qv-add-cart" data-id="${product.id}">
          <ion-icon name="cart-outline"></ion-icon>
          <span>Add to Cart</span>
        </button>
      </div>
      <button class="qv-wishlist-btn ${state.wishlist.find(i => i.id === String(product.id)) ? 'wishlisted' : ''}" data-id="${product.id}">
        <ion-icon name="${state.wishlist.find(i => i.id === String(product.id)) ? 'heart' : 'heart-outline'}"></ion-icon>
        ${state.wishlist.find(i => i.id === String(product.id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </button>
    </div>
  `;

  // QV qty controls
  let qvQty = 1;
  document.getElementById('qvInc').addEventListener('click', () => {
    qvQty++;
    document.getElementById('qvQty').textContent = qvQty;
  });
  document.getElementById('qvDec').addEventListener('click', () => {
    if (qvQty > 1) { qvQty--; document.getElementById('qvQty').textContent = qvQty; }
  });

  // QV add to cart
  body.querySelector('.qv-add-cart').addEventListener('click', () => {
    for (let i = 0; i < qvQty; i++) {
      addToCart({ id: String(product.id), name: product.name, price: product.price, img: product.img });
    }
    closeQuickView();
    openDrawer('cartDrawer');
  });

  // QV wishlist toggle
  body.querySelector('.qv-wishlist-btn').addEventListener('click', function () {
    toggleWishlist({ id: String(product.id), name: product.name, price: product.price, img: product.img });
    const isNow = !!state.wishlist.find(i => i.id === String(product.id));
    this.querySelector('ion-icon').setAttribute('name', isNow ? 'heart' : 'heart-outline');
    this.textContent = '';
    this.innerHTML = `<ion-icon name="${isNow ? 'heart' : 'heart-outline'}"></ion-icon> ${isNow ? 'Remove from Wishlist' : 'Add to Wishlist'}`;
    this.classList.toggle('wishlisted', isNow);
  });

  quickViewOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeQuickView() {
  quickViewOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

document.getElementById('quickViewCloseBtn').addEventListener('click', closeQuickView);
quickViewOverlay.addEventListener('click', e => {
  if (e.target === quickViewOverlay) closeQuickView();
});

/* ============================================================
   COMPARE
   ============================================================ */
const compareBar     = document.getElementById('compareBar');
const compareOverlay = document.getElementById('compareOverlay');

function renderCompareBar() {
  const items   = document.getElementById('compareItems');
  const countEl = document.getElementById('compareCount');

  countEl.textContent = `(${state.compare.length}/3)`;
  items.innerHTML = '';

  if (state.compare.length === 0) {
    compareBar.classList.remove('active');
    return;
  }

  compareBar.classList.add('active');

  state.compare.forEach(item => {
    const div = document.createElement('div');
    div.className = 'compare-chip';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <span>${item.name}</span>
      <button data-id="${item.id}" aria-label="Remove from compare">
        <ion-icon name="close-outline"></ion-icon>
      </button>
    `;
    div.querySelector('button').addEventListener('click', () => removeFromCompare(item.id));
    items.appendChild(div);
  });
}

function addToCompare(data) {
  if (state.compare.find(i => i.id === data.id)) {
    showToast(`${data.name} is already in compare`, 'info');
    return;
  }
  if (state.compare.length >= 3) {
    showToast('You can compare up to 3 products', 'info');
    return;
  }
  state.compare.push(data);
  showToast(`${data.name} added to compare`);
  renderCompareBar();
}

function removeFromCompare(id) {
  state.compare = state.compare.filter(i => i.id !== id);
  renderCompareBar();
}

function openCompareModal() {
  if (state.compare.length < 2) {
    showToast('Add at least 2 products to compare', 'info');
    return;
  }

  const wrap = document.getElementById('compareTableWrap');
  const cols = state.compare.map(p => `
    <div class="compare-col">
      <img src="${p.img}" alt="${p.name}" class="compare-col-img">
      <h3 class="compare-col-name">${p.name}</h3>
      <p class="compare-col-brand">${p.brand}</p>
      <p class="compare-col-price">${fmt(p.price)}</p>
      <p class="compare-col-cat">${p.category}</p>
      <button class="btn btn-primary btn-sm compare-add-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join('');

  wrap.innerHTML = `
    <div class="compare-labels">
      <div class="compare-label">Image</div>
      <div class="compare-label">Name</div>
      <div class="compare-label">Brand</div>
      <div class="compare-label">Price</div>
      <div class="compare-label">Category</div>
      <div class="compare-label">Action</div>
    </div>
    <div class="compare-cols">${cols}</div>
  `;

  wrap.querySelectorAll('.compare-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = state.compare.find(i => i.id === btn.dataset.id);
      if (p) { addToCart(p); closeCompareModal(); openDrawer('cartDrawer'); }
    });
  });

  compareOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeCompareModal() {
  compareOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

document.getElementById('compareNowBtn').addEventListener('click', openCompareModal);
document.getElementById('clearCompareBtn').addEventListener('click', () => {
  state.compare = [];
  renderCompareBar();
});
document.getElementById('compareModalCloseBtn').addEventListener('click', closeCompareModal);
compareOverlay.addEventListener('click', e => {
  if (e.target === compareOverlay) closeCompareModal();
});
document.getElementById('footerCompareBtn').addEventListener('click', () => {
  if (state.compare.length > 0) openCompareModal();
  else showToast('No products in compare list', 'info');
});

/* ============================================================
   NAV LINKS — close mobile navbar on click, active state
   ============================================================ */
const navLinks = document.querySelectorAll('[data-nav-link]');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Close mobile nav
    navbar.classList.remove('active');
    overlay.classList.remove('active');

    // Active state
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Highlight active nav link on scroll
const sections = {
  top:      document.getElementById('top'),
  about:    document.getElementById('about'),
  products: document.getElementById('products'),
  blog:     document.getElementById('blog'),
  contact:  document.getElementById('contact')
};

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    const sec  = sections[href];
    if (sec && scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      // Highlight active section link
      document.querySelectorAll(`[data-nav-link][href="#${href}"]`).forEach(l => l.classList.add('active'));
    }
  });
});

/* ============================================================
   PRODUCT CARD ACTION DELEGATION
   ============================================================ */
document.body.addEventListener('click', e => {
  const actionBtn = e.target.closest('[data-action]');
  if (!actionBtn) return;

  const card = actionBtn.closest('.product-card');
  if (!card) return;

  const data = getProductDataFromCard(card);

  switch (actionBtn.dataset.action) {
    case 'cart':
      addToCart(data);
      break;
    case 'wishlist':
      toggleWishlist(data);
      break;
    case 'quickview':
      openQuickView(data);
      break;
    case 'compare':
      addToCompare(data);
      break;
    case 'productdetail':
      e.preventDefault();
      openProductDetail(data);
      break;
  }
});

/* ============================================================
   PRODUCT DETAIL MODAL
   ============================================================ */
const productDetailOverlay = document.getElementById('productDetailOverlay');

const productExtras = {
  '1': { colors: ['#1a1a2e','#e63946','#ffffff'], sizes: ['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'], features: ['Breathable mesh upper','Cushioned EVA midsole','Anti-slip rubber outsole','Reflective details for visibility'] },
  '2': { colors: ['#8b5e3c','#1a1a2e','#d4a373'], sizes: ['UK 6','UK 7','UK 8','UK 9','UK 10'],         features: ['Genuine leather upper','Memory foam insole','Durable TPR outsole','Water-resistant finish'] },
  '3': { colors: ['#f5f5f5','#6c757d','#343a40'], sizes: ['UK 5','UK 6','UK 7','UK 8','UK 9','UK 10'], features: ['Soft fabric upper','Lightweight foam sole','Slip-on design','Machine washable'] },
  '4': { colors: ['#e63946','#1a1a2e','#adb5bd'], sizes: ['UK 7','UK 8','UK 9','UK 10','UK 11'],        features: ['Premium leather/suede upper','Full-length Air unit','Rubber cupsole','Classic Jordan tongue branding'] },
  '5': { colors: ['#343a40','#e63946','#dee2e6'], sizes: ['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'], features: ['Engineered mesh upper','270° Air unit heel','Foam midsole','Durable outsole traction'] },
  '6': { colors: ['#ffffff','#343a40','#2d6a4f'], sizes: ['UK 5','UK 6','UK 7','UK 8','UK 9','UK 10'], features: ['Primeknit stretch fit','Boost midsole technology','Continental rubber outsole','Sock-like construction'] },
  '7': { colors: ['#e63946','#1a1a2e','#dee2e6'], sizes: ['UK 8','UK 9','UK 10','UK 11','UK 12'],       features: ['Fused Flywire cables','Zoom Air unit','Multidirectional traction pattern','Padded ankle collar'] },
  '8': { colors: ['#adb5bd','#343a40','#e63946'], sizes: ['UK 5','UK 6','UK 7','UK 8','UK 9','UK 10'], features: ['Soft woven upper','SOFTFOAM+ sockliner','PUMA sole unit','Lace closure system'] }
};

function openProductDetail(data) {
  const product = getProduct(data.id) || data;
  const extras  = productExtras[String(product.id)] || { colors: ['#1a1a2e'], sizes: ['UK 7','UK 8','UK 9'], features: ['Premium quality','Comfortable fit','Durable build','Stylish design'] };
  const inWish  = !!state.wishlist.find(i => i.id === String(product.id));

  const colorsHTML = extras.colors.map((c, i) =>
    `<button class="pd-color-swatch ${i === 0 ? 'active' : ''}" style="background:${c}" data-color="${c}" aria-label="Color ${c}"></button>`
  ).join('');

  const sizesHTML = extras.sizes.map((s, i) =>
    `<button class="pd-size-btn ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>`
  ).join('');

  const featuresHTML = extras.features.map(f =>
    `<li><ion-icon name="checkmark-circle-outline"></ion-icon> ${f}</li>`
  ).join('');

  document.getElementById('pdBody').innerHTML = `
    <div class="pd-left">
      <div class="pd-img-main">
        <img src="${product.img}" alt="${product.name}" id="pdMainImg">
      </div>
    </div>

    <div class="pd-right">
      <div class="pd-breadcrumb">
        <span>Home</span>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>${product.brand}</span>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <span>${product.name}</span>
      </div>

      <p class="pd-brand">${product.brand}</p>
      <h2 class="pd-title">${product.name}</h2>
      <p class="pd-category">${product.category}</p>

      <div class="pd-rating">
        ${[1,2,3,4,5].map(i => `<ion-icon name="${i <= 4 ? 'star' : 'star-outline'}"></ion-icon>`).join('')}
        <span class="pd-rating-count">(128 reviews)</span>
      </div>

      <div class="pd-price-wrap">
        <span class="pd-price">${fmt(product.price)}</span>
        ${product.originalPrice ? `<span class="pd-price-old">${fmt(product.originalPrice)}</span><span class="pd-discount">SAVE ${fmt(product.originalPrice - product.price)}</span>` : ''}
      </div>

      <p class="pd-desc">Experience the perfect blend of comfort, style, and performance with the ${product.name}. Engineered for those who demand the best from their footwear, whether on the track or the street.</p>

      <div class="pd-section">
        <p class="pd-section-label">Color</p>
        <div class="pd-colors">${colorsHTML}</div>
      </div>

      <div class="pd-section">
        <p class="pd-section-label">Size <a href="#" class="pd-size-guide">Size Guide</a></p>
        <div class="pd-sizes">${sizesHTML}</div>
      </div>

      <div class="pd-section">
        <p class="pd-section-label">Quantity</p>
        <div class="pd-qty-row">
          <div class="qv-qty-wrap">
            <button class="qty-btn" id="pdDec"><ion-icon name="remove-outline"></ion-icon></button>
            <span class="qty-value" id="pdQty">1</span>
            <button class="qty-btn" id="pdInc"><ion-icon name="add-outline"></ion-icon></button>
          </div>
          <span class="pd-stock"><ion-icon name="checkmark-circle-outline"></ion-icon> In Stock</span>
        </div>
      </div>

      <div class="pd-actions">
        <button class="btn btn-primary pd-add-cart" id="pdAddCart">
          <ion-icon name="cart-outline"></ion-icon>
          <span>Add to Cart</span>
        </button>
        <button class="pd-wish-btn ${inWish ? 'wishlisted' : ''}" id="pdWishBtn">
          <ion-icon name="${inWish ? 'heart' : 'heart-outline'}"></ion-icon>
        </button>
      </div>

      <ul class="pd-features">${featuresHTML}</ul>

      <div class="pd-meta">
        <span><strong>Brand:</strong> ${product.brand}</span>
        <span><strong>SKU:</strong> FC-${String(product.id).padStart(4,'0')}</span>
        <span><strong>Availability:</strong> In Stock</span>
      </div>
    </div>
  `;

  // Qty controls
  let pdQty = 1;
  document.getElementById('pdInc').addEventListener('click', () => {
    pdQty++;
    document.getElementById('pdQty').textContent = pdQty;
  });
  document.getElementById('pdDec').addEventListener('click', () => {
    if (pdQty > 1) { pdQty--; document.getElementById('pdQty').textContent = pdQty; }
  });

  // Color swatches
  document.querySelectorAll('.pd-color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.pd-color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  // Size buttons
  document.querySelectorAll('.pd-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pd-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  document.getElementById('pdAddCart').addEventListener('click', () => {
    for (let i = 0; i < pdQty; i++) {
      addToCart({ id: String(product.id), name: product.name, price: product.price, img: product.img });
    }
    closeProductDetail();
    openDrawer('cartDrawer');
  });

  // Wishlist toggle
  const wishBtn = document.getElementById('pdWishBtn');
  wishBtn.addEventListener('click', () => {
    toggleWishlist({ id: String(product.id), name: product.name, price: product.price, img: product.img });
    const isNow = !!state.wishlist.find(i => i.id === String(product.id));
    wishBtn.classList.toggle('wishlisted', isNow);
    wishBtn.querySelector('ion-icon').setAttribute('name', isNow ? 'heart' : 'heart-outline');
  });

  productDetailOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeProductDetail() {
  productDetailOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

document.getElementById('productDetailCloseBtn').addEventListener('click', closeProductDetail);
productDetailOverlay.addEventListener('click', e => {
  if (e.target === productDetailOverlay) closeProductDetail();
});

/* ============================================================
   PRODUCT FILTER
   ============================================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const productItems = document.querySelectorAll('#productList .product-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    productItems.forEach(item => {
      const match = filter === 'all' || item.dataset.brand === filter;
      item.style.display = match ? '' : 'none';
      // Animate in
      if (match) {
        item.style.animation = 'none';
        item.offsetHeight; // reflow
        item.style.animation = 'fadeInUp 0.4s ease forwards';
      }
    });
  });
});

/* ============================================================
   SEARCH
   ============================================================ */
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

document.getElementById('searchOpenBtn').addEventListener('click', () => {
  searchOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
  setTimeout(() => searchInput.focus(), 100);
});

document.getElementById('searchCloseBtn').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => {
  if (e.target === searchOverlay) closeSearch();
});

function closeSearch() {
  searchOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
  searchInput.value = '';
  searchResults.innerHTML = '';
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = '';

  if (!q) return;

  const matches = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    searchResults.innerHTML = '<p class="search-no-result">No products found.</p>';
    return;
  }

  matches.forEach(p => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="search-result-info">
        <p class="search-result-name">${p.name}</p>
        <p class="search-result-meta">${p.brand} &mdash; ${p.category}</p>
        <p class="search-result-price">${fmt(p.price)}</p>
      </div>
      <div class="search-result-actions">
        <button class="btn btn-primary btn-sm" data-search-add-cart data-id="${p.id}">Add to Cart</button>
        <button class="btn btn-secondary btn-sm" data-search-quickview data-id="${p.id}">View</button>
      </div>
    `;
    searchResults.appendChild(div);
  });
});

searchResults.addEventListener('click', e => {
  const cartBtn = e.target.closest('[data-search-add-cart]');
  const viewBtn = e.target.closest('[data-search-quickview]');

  if (cartBtn) {
    const p = getProduct(cartBtn.dataset.id);
    if (p) { addToCart({ id: p.id, name: p.name, price: p.price, img: p.img }); }
  }
  if (viewBtn) {
    const p = getProduct(viewBtn.dataset.id);
    if (p) {
      closeSearch();
      openQuickView(p);
    }
  }
});

/* ============================================================
   NEWSLETTER
   ============================================================ */
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value.trim();
  if (email) {
    showToast(`Subscribed! Welcome, ${email}`);
    document.getElementById('newsletterEmail').value = '';
  }
});

/* ============================================================
   INITIAL RENDER
   ============================================================ */
updateCartNav();
updateWishlistNav();