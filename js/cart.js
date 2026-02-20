/* H&M Cart Logic */

// Default items (pre-populated cart for demo)
const DEFAULT_CART_ITEMS = [
    {
        id: 'cart-001',
        artNo: '1318123001',
        name: 'Polo shirt',
        brand: 'H&M',
        price: 1499,
        color: 'Black',
        size: 'M',
        quantity: 1,
        image: 'https://image.hm.com/assets/hm/bc/51/bc510cf06c1b51ecba1fa8d9539b873a9acff867.jpg?imwidth=264',
        link: 'product.html'
    },
    {
        id: 'cart-002',
        artNo: '1306119007',
        name: 'Short-sleeved microfibre body',
        brand: 'H&M',
        price: 699,
        color: 'Dark dusty pink',
        size: 'S',
        quantity: 1,
        image: 'https://image.hm.com/assets/hm/7f/9e/7f9e3a8efa426ee31be352f8a8f12b4bc0636f3c.jpg?imwidth=264',
        link: 'product.html'
    }
];

const DELIVERY_FEE = 149;

// Recommendation products
// Recommendation products
let RECO_PRODUCTS = [];

if (typeof window.productsData !== 'undefined' && window.productsData.products) {
    try {
        // Flatten all categories
        const allProducts = Object.values(window.productsData.products).flat();

        // Shuffle and pick 6
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        RECO_PRODUCTS = shuffled.slice(0, 6).map(p => ({
            name: p.name,
            price: p.price,
            image: p.image,
            badge: p.badges && p.badges.length ? p.badges[0] : '',
            link: `product.html?id=${p.id}`
        }));
    } catch (e) {
        console.error('Error selecting random products:', e);
    }
}

// Fallback if data not available
if (RECO_PRODUCTS.length === 0) {
    RECO_PRODUCTS = [
        {
            name: 'Loose Fit Boxy-style t-shirt',
            price: 'Rs.1,499.00',
            image: 'https://image.hm.com/assets/hm/da/b0/dab03dbdbff49edb6e3c0b523c3b9ae4f6e19bb2.jpg?imwidth=362',
            badge: 'New Arrival',
            link: 'product.html'
        }
    ];
}

// ---- State ----
function getCart() {
    try {
        const stored = localStorage.getItem('hm_cart');
        if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    // First visit - seed with defaults
    localStorage.setItem('hm_cart', JSON.stringify(DEFAULT_CART_ITEMS));
    return [...DEFAULT_CART_ITEMS];
}

function saveCart(items) {
    localStorage.setItem('hm_cart', JSON.stringify(items));
}

// ---- Format helpers ----
function formatPrice(amount) {
    return 'Rs. ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---- Render ----
function renderCart() {
    const items = getCart();
    const listEl = document.getElementById('cart-item-list');
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');
    const titleEl = document.querySelector('.cart-page h1');

    if (!items.length) {
        if (contentEl) contentEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (titleEl) titleEl.textContent = 'Shopping bag';
        updateSidebar(items);
        updateHeaderBadge(items);
        return;
    }

    if (contentEl) contentEl.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';
    if (titleEl) titleEl.textContent = 'Shopping bag';

    listEl.innerHTML = items.map((item, idx) => `
        <li class="cart-item" data-index="${idx}">
            <div class="cart-item-image-wrap">
                <a href="${item.link}">
                    <img class="cart-item-image" src="${item.image}" alt="${item.name}">
                </a>
                <button class="cart-item-fav" aria-label="Save as favourite">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#fff" d="m8 13.99 6.217-6.217a3.528 3.528 0 0 0-4.99-4.99L8.001 4.01 6.773 2.784a3.528 3.528 0 1 0-4.99 4.99L8 13.988Z"></path>
                        <path fill="#000" d="M8.697 2.253a4.278 4.278 0 0 1 6.05 6.05L8 15.05 1.253 8.304a4.278 4.278 0 0 1 6.05-6.05L8 2.948l.696-.696Zm4.99 1.06a2.778 2.778 0 0 0-3.93 0L8.003 5.07 6.243 3.315a2.779 2.779 0 0 0-3.93 3.928L8 12.928l5.686-5.686a2.778 2.778 0 0 0 0-3.928Z"></path>
                    </svg>
                </button>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-brand">${item.brand}</div>
                <h2 class="cart-item-name"><a href="${item.link}">${item.name}</a></h2>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-meta">
                    <dl>
                        <div class="meta-row"><dt>Art no:</dt><dd>${item.artNo}</dd></div>
                        <div class="meta-row"><dt>Colour</dt><dd>${item.color}</dd></div>
                        <div class="meta-row"><dt>Size</dt><dd>${item.size}</dd></div>
                        <div class="meta-row"><dt>Quantity</dt><dd>${item.quantity}</dd></div>
                        <div class="meta-row meta-total"><dt>Total</dt><dd>${formatPrice(item.price * item.quantity)}</dd></div>
                    </dl>
                </div>
                <div class="cart-quantity-controls">
                    <button class="qty-btn qty-delete" data-action="delete" data-index="${idx}" aria-label="Remove item">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 17V9.5h1.5V17H9ZM15 17V9.5h-1.5V17H15Z M7.75 2v2.75H2v1.5h1.75V22h16.5V6.25H22v-1.5h-5.75V2h-8.5Zm1.5 1.5v1.25h5.5V3.5h-5.5Zm9.5 2.75H5.25V20.5h13.5V6.25Z"></path></svg>
                    </button>
                    <input class="qty-input" type="number" min="1" max="20" value="${item.quantity}" data-index="${idx}" aria-label="Quantity">
                    <button class="qty-btn qty-add" data-action="add" data-index="${idx}" aria-label="Increase quantity">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 11.25V2h-1.5v9.25H2v1.5h9.25V22h1.5v-9.25H22v-1.5h-9.25Z"></path></svg>
                    </button>
                </div>
            </div>
        </li>
    `).join('');

    updateSidebar(items);
    updateHeaderBadge(items);
    attachItemListeners();
}

function updateSidebar(items) {
    const orderValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryFee = items.length ? DELIVERY_FEE : 0;
    const total = orderValue + deliveryFee;

    const ovEl = document.getElementById('order-value');
    const dfEl = document.getElementById('delivery-fee');
    const totEl = document.getElementById('order-total');

    if (ovEl) ovEl.textContent = formatPrice(orderValue);
    if (dfEl) dfEl.textContent = formatPrice(deliveryFee);
    if (totEl) totEl.textContent = formatPrice(total);
}

function updateHeaderBadge(items) {
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    const bagText = document.querySelector('.cart-bag-text');
    if (badge) badge.textContent = totalQty;
    if (bagText) bagText.textContent = `Shopping bag (${totalQty})`;
}

function attachItemListeners() {
    // Delete buttons
    document.querySelectorAll('.qty-btn.qty-delete').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            const items = getCart();
            items.splice(idx, 1);
            saveCart(items);
            renderCart();
        });
    });

    // Add buttons
    document.querySelectorAll('.qty-btn.qty-add').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            const items = getCart();
            if (items[idx].quantity < 20) {
                items[idx].quantity++;
                saveCart(items);
                renderCart();
            }
        });
    });

    // Input change
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function () {
            const idx = parseInt(this.dataset.index);
            let val = parseInt(this.value) || 1;
            if (val < 1) val = 1;
            if (val > 20) val = 20;
            const items = getCart();
            items[idx].quantity = val;
            saveCart(items);
            renderCart();
        });
    });
}

// ---- Recommendations ----
function renderRecommendations() {
    const container = document.getElementById('reco-list');
    if (!container) return;

    container.innerHTML = RECO_PRODUCTS.map(p => `
        <li class="reco-card">
            <div class="reco-card-image-wrap">
                <a href="${p.link}">
                    <img class="reco-card-image" src="${p.image}" alt="${p.name}">
                </a>
                <button class="reco-card-fav" aria-label="Save ${p.name} to favourites">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#fff" d="m8 13.99 6.217-6.217a3.528 3.528 0 0 0-4.99-4.99L8.001 4.01 6.773 2.784a3.528 3.528 0 1 0-4.99 4.99L8 13.988Z"></path>
                        <path fill="#000" d="M8.697 2.253a4.278 4.278 0 0 1 6.05 6.05L8 15.05 1.253 8.304a4.278 4.278 0 0 1 6.05-6.05L8 2.948l.696-.696Zm4.99 1.06a2.778 2.778 0 0 0-3.93 0L8.003 5.07 6.243 3.315a2.779 2.779 0 0 0-3.93 3.928L8 12.928l5.686-5.686a2.778 2.778 0 0 0 0-3.928Z"></path>
                    </svg>
                </button>
            </div>
            <div class="reco-card-name"><a href="${p.link}">${p.name}</a></div>
            <div class="reco-card-price">${p.price}</div>
            ${p.badge ? `<div class="reco-card-badge">${p.badge}</div>` : ''}
        </li>
    `).join('');

    // Carousel nav
    const scrollEl = document.querySelector('.reco-scroll');
    const prevBtn = document.getElementById('reco-prev');
    const nextBtn = document.getElementById('reco-next');

    if (prevBtn && nextBtn && scrollEl) {
        prevBtn.addEventListener('click', () => {
            scrollEl.scrollBy({ left: -240, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            scrollEl.scrollBy({ left: 240, behavior: 'smooth' });
        });
        scrollEl.addEventListener('scroll', () => {
            prevBtn.disabled = scrollEl.scrollLeft <= 5;
            nextBtn.disabled = scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 5;
        });
        // Initial state
        prevBtn.disabled = true;
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    renderRecommendations();
});
