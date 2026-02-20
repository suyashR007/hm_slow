/**
 * H&M Wishlist Module
 * Manages favourites via localStorage so items persist across pages.
 *
 * API:
 *   Wishlist.add(product)        – add a product object
 *   Wishlist.remove(productId)   – remove by id
 *   Wishlist.toggle(product)     – add if missing, remove if present → returns true if added
 *   Wishlist.has(productId)      – check if in wishlist
 *   Wishlist.getAll()            – return array of saved products
 *   Wishlist.count()             – number of items
 *   Wishlist.clear()             – empty the wishlist
 *   Wishlist.updateHeaderBadge() – refresh the heart badge count in the nav
 *   Wishlist.bindHeartButtons(containerEl) – attach click handlers to .wishlist-btn inside container
 */
const Wishlist = (() => {
    const STORAGE_KEY = 'hm_wishlist';

    // ── Persistence ──────────────────────────────────────
    function _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* corrupt data – reset */ }
        return [];
    }

    function _save(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // ── Public API ───────────────────────────────────────
    function getAll() {
        return _load();
    }

    function count() {
        return _load().length;
    }

    function has(productId) {
        return _load().some(p => p.id === productId);
    }

    function add(product) {
        if (!product || !product.id) return;
        const items = _load();
        if (items.some(p => p.id === product.id)) return; // already exists
        items.push({
            id: product.id,
            name: product.name,
            brand: product.brand || 'H&M',
            price: product.price,
            originalPrice: product.originalPrice || null,
            image: (product.image_list && product.image_list.length > 0) ? product.image_list[0] : product.image,
            category: product.category || '',
            colors: product.colors || [],
            art_no: product.art_no || product.id
        });
        _save(items);
        updateHeaderBadge();
    }

    function remove(productId) {
        let items = _load();
        items = items.filter(p => p.id !== productId);
        _save(items);
        updateHeaderBadge();
    }

    /**
     * Toggle – returns true if the item was ADDED, false if REMOVED.
     */
    function toggle(product) {
        if (has(product.id)) {
            remove(product.id);
            return false;
        }
        add(product);
        return true;
    }

    function clear() {
        _save([]);
        updateHeaderBadge();
    }

    // ── Header badge ─────────────────────────────────────
    function updateHeaderBadge() {
        const n = count();
        // Try multiple selectors for various page layouts
        document.querySelectorAll('.wishlist-count, #wishlist-count').forEach(el => {
            el.textContent = n;
            el.style.display = n > 0 ? '' : 'none';
        });
    }

    // ── Heart button helper ──────────────────────────────
    // Expects buttons with class .wishlist-btn and data-product-id
    // Product data is attached via data attributes or looked up from productsData.
    function _findProduct(productId) {
        if (!window.productsData || !window.productsData.products) return null;
        const allCats = window.productsData.products;
        for (const key of Object.keys(allCats)) {
            const found = allCats[key].find(p => p.id == productId);
            if (found) return found;
        }
        return null;
    }

    function bindHeartButtons(containerEl) {
        if (!containerEl) containerEl = document;
        const buttons = containerEl.querySelectorAll('.wishlist-btn');
        // console.log(`Found ${buttons.length} wishlist buttons to bind.`);

        buttons.forEach(btn => {
            // Prevent double binding
            if (btn.dataset.wishlistBound === 'true') return;
            btn.dataset.wishlistBound = 'true';

            const pid = btn.dataset.productId;
            // Set initial state
            if (pid && has(pid)) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const id = btn.dataset.productId;
                if (!id) {
                    console.warn('Wishlist button missing data-product-id');
                    return;
                }

                let product = _findProduct(id);
                if (!product) {
                    // Fallback to data attributes on the button itself if available
                    if (btn.dataset.name && btn.dataset.price && btn.dataset.image) {
                        product = {
                            id: id,
                            name: btn.dataset.name,
                            price: btn.dataset.price,
                            image: btn.dataset.image,
                            // Minimal product object
                        };
                        console.log(`Using fallback data for product ${id}`);
                    } else {
                        console.warn(`Product ID ${id} not found in productsData and no fallback data on button.`);
                        return;
                    }
                }

                const added = toggle(product);
                btn.classList.toggle('active', added);

                // Small pop animation
                btn.classList.add('pop');
                setTimeout(() => btn.classList.remove('pop'), 400);
            });
        });
    }

    // On load – always update the badge
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateHeaderBadge);
    } else {
        updateHeaderBadge();
    }

    return {
        add,
        remove,
        toggle,
        has,
        getAll,
        count: () => _load().length,
        clear: () => _save([]),
        updateHeaderBadge,
        updateCount: updateHeaderBadge, // Alias for external use
        bindHeartButtons
    };
})();
