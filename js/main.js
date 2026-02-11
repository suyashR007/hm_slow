// H&M Website Replica - Main JavaScript

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileNavClose = document.getElementById('mobileNavClose');
const mainNav = document.getElementById('mainNav');
const cartCount = null; // Will be queried dynamically
const searchInput = document.querySelector('.search-input');

// Mobile Menu Toggle
if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (mobileNavClose && mainNav) {
    mobileNavClose.addEventListener('click', () => {
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mainNav && mainNav.classList.contains('active') &&
        !mainNav.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Shopping Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('hm_cart')) || [];
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item =>
            item.id === product.id &&
            item.size === product.size &&
            item.color === product.color
        );

        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                ...product,
                quantity: product.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!');
    }

    removeItem(productId, size, color) {
        this.items = this.items.filter(item =>
            !(item.id === productId && item.size === size && item.color === color)
        );
        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product removed from cart!');
    }

    updateQuantity(productId, size, color, quantity) {
        const item = this.items.find(item =>
            item.id === productId && item.size === size && item.color === color
        );

        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productId, size, color);
            } else {
                this.saveCart();
                this.updateCartCount();
            }
        }
    }

    getCartTotal() {
        return this.items.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/^[^\d]*/, '').replace(/,/g, '')) || 0;
            return total + (price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('hm_cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const badge = document.querySelector('.cart-count');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--hm-black);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Product card click handlers
document.addEventListener('click', (e) => {
    // Add to cart button
    if (e.target.closest('.product-action-btn')) {
        e.stopPropagation();
        const button = e.target.closest('.product-action-btn');
        const productCard = button.closest('.product-card');

        if (productCard) {
            // Check if it's the wishlist button (first) or cart button (second)
            const buttons = productCard.querySelectorAll('.product-action-btn');
            if (buttons[0] === button) {
                cart.showNotification('Added to wishlist!');
                return;
            }

            // Parse price to number (handles "Rs. 1,299.00" format)
            const priceText = productCard.querySelector('.price-current')?.textContent || '0';
            const priceNum = parseFloat(priceText.replace(/^[^\d]*/, '').replace(/,/g, '')) || 0;

            const product = {
                id: productCard.dataset.productId || ('card-' + Date.now()),
                artNo: productCard.dataset.productId || '',
                name: productCard.querySelector('.product-name')?.textContent || 'Product',
                brand: productCard.querySelector('.product-brand')?.textContent || 'H&M',
                price: priceNum,
                color: 'Default',
                size: 'M',
                quantity: 1,
                image: productCard.querySelector('.product-image')?.src || '',
                link: productCard.querySelector('a')?.getAttribute('href') || 'product.html'
            };

            cart.addItem(product);
        }
    }
});

// Search functionality
if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
}

function performSearch(query) {
    console.log('Searching for:', query);
    // In real app, this would perform actual search
    cart.showNotification(`Searching for "${query}"...`);
}

// Hero slider functionality - Removed for static hero
// const heroSlides = document.querySelectorAll('.hero-slide');
// ...

// Newsletter subscription
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('.newsletter-input').value;

        if (email) {
            cart.showNotification('Thank you for subscribing!');
            form.reset();
            // In real app, this would send to backend
        }
    });
});

// Quantity controls on product pages
const quantityControls = document.querySelectorAll('.flex.items-center.border button');
quantityControls.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.parentElement.querySelector('input[type="number"]');
        if (!input) return;

        let currentValue = parseInt(input.value) || 1;

        if (button.textContent === '+') {
            input.value = currentValue + 1;
        } else if (button.textContent === '-' && currentValue > 1) {
            input.value = currentValue - 1;
        }

        // Trigger change event
        input.dispatchEvent(new Event('change'));
    });
});

// Size selector functionality
const sizeButtons = document.querySelectorAll('.grid.grid-cols-6.gap-2 button');
sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove selected state from siblings
        button.parentElement.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-black', 'text-white');
            btn.classList.add('border');
        });

        // Add selected state to clicked button
        button.classList.add('bg-black', 'text-white');
        button.classList.remove('border');
    });
});

// Color selector functionality
const colorButtons = document.querySelectorAll('.grid.grid-cols-4.gap-2 input[type="checkbox"]');
colorButtons.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const colorSpan = checkbox.nextElementSibling;
        if (checkbox.checked) {
            colorSpan.style.borderColor = 'var(--hm-black)';
            colorSpan.style.borderWidth = '2px';
        } else {
            colorSpan.style.borderColor = 'var(--hm-gray-300)';
        }
    });
});

// Tab functionality for account page
const tabLinks = document.querySelectorAll('.account-nav-link');
const tabContents = document.querySelectorAll('.tab-content');

if (tabLinks.length > 0 && tabContents.length > 0) {
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const tabName = link.dataset.tab;
            if (!tabName) return;

            // Remove active state from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active state to clicked tab
            link.classList.add('active');
            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
            } else {
                field.classList.remove('border-red-500');
            }
        });

        if (!isValid) {
            e.preventDefault();
            cart.showNotification('Please fill in all required fields.');
        }
    });
});

// Image lazy loading simulation
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .img {
        transition: opacity 0.3s ease;
    }

    .img:not(.loaded) {
        opacity: 0.7;
    }

    .notification {
        font-family: var(--font-family-primary);
        font-size: var(--font-size-sm);
        box-shadow: var(--shadow-lg);
    }

    .btn-white {
        background-color: var(--hm-white);
        color: var(--hm-black);
    }

    .btn-white:hover {
        background-color: var(--hm-gray-100);
    }

    .text-white:hover {
        color: var(--hm-white) !important;
    }

    .text-white.border-white {
        border-color: var(--hm-white) !important;
        color: var(--hm-white) !important;
    }

    .text-white.border-white:hover {
        background-color: var(--hm-white) !important;
        color: var(--hm-black) !important;
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('H&M Website loaded successfully!');

    // Show welcome message for returning users
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        setTimeout(() => {
            cart.showNotification('Welcome to H&M! Enjoy 10% off your first order.');
            localStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
});

// Export cart for global access
window.cart = cart;