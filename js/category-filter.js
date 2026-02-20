/**
 * Category Filter Module
 * Reusable filter/sort logic for H&M category pages (women, men, kids, etc.)
 * 
 * Usage:
 *   CategoryFilter.init({
 *     categoryKey: 'women',       // key in productsData.products
 *     gridId: 'women-product-grid' // DOM id of the product grid
 *   });
 */
const CategoryFilter = (() => {
    let allProducts = [];
    let filteredProducts = [];
    let gridEl = null;
    let categoryKey = '';

    // Current filter state
    const filters = {
        categories: [],
        sizes: [],
        colors: [],
        minPrice: null,
        maxPrice: null,
        sort: 'featured'
    };

    // ── Helpers ──────────────────────────────────────────

    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        return parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    function colorNameToHex(name) {
        const map = {
            'black': '#000000',
            'white': '#FFFFFF',
            'red': '#FF0000',
            'blue': '#0000FF',
            'green': '#008000',
            'yellow': '#FFD700',
            'purple': '#800080',
            'pink': '#FFC0CB',
            'brown': '#A52A2A',
            'grey': '#808080',
            'gray': '#808080',
            'beige': '#F5F5DC',
            'cream': '#FFFDD0',
            'light-beige': '#F5F5DC',
            'light-blue': '#ADD8E6',
            'light-green': '#90EE90',
            'dark-brown': '#654321',
            'dark-grey': '#404040',
            'dark-dusty-pink': '#C68E95',
            'denim-blue': '#1560BD',
            'denim blue': '#1560BD',
            'light denim blue': '#6FA3D6',
            'pale-yellow': '#FDFFB6',
            'multi-color': 'linear-gradient(45deg, red, blue, green)',
            'burgundy': '#800020',
            'dark brown': '#654321',
            'dark grey': '#404040',
        };
        const lower = name.toLowerCase().trim();
        return map[lower] || lower;
    }

    // Map product category strings to our filter category labels
    function normalizeCategoryForFilter(cat) {
        if (!cat) return '';
        const lower = cat.toLowerCase().trim();

        // Women's filter mappings
        const catMap = {
            'top': 'tops & t-shirts',
            'tops': 'tops & t-shirts',
            't-shirts & tops': 'tops & t-shirts',
            'blouse': 'tops & t-shirts',
            'blouses': 'tops & t-shirts',

            'dress': 'dresses',
            'dresses': 'dresses',

            'jeans': 'jeans & trousers',
            'pants': 'jeans & trousers',

            'skirt': 'skirts',
            'skirts': 'skirts',

            'jacket': 'jackets & coats',
            'jackets': 'jackets & coats',
            'jackets & coats': 'jackets & coats',
            'coat': 'jackets & coats',
            'coats': 'jackets & coats',

            'knitwear': 'knitwear',
            'jumper': 'knitwear',
            'cardigan': 'knitwear',
            'sweater': 'knitwear',

            'waistcoat': 'tops & t-shirts',

            'accessories': 'accessories',
            'shoes': 'accessories',
            'sunglasses': 'accessories',

            // Men-specific
            't-shirt': 't-shirts & tops',
            't-shirts & tanks': 't-shirts & tops',
            'polo shirt': 't-shirts & tops',
            'polo': 't-shirts & tops',

            'shirt': 'shirts',
            'shirts': 'shirts',

            'trousers': 'trousers',
            'formal trousers': 'trousers',
            'cargo trousers': 'trousers',
            'chinos': 'trousers',
            'shorts': 'jeans & trousers',

            'hoodie': 'hoodies & sweatshirts',
            'hoodies': 'hoodies & sweatshirts',
            'sweatshirt': 'hoodies & sweatshirts',
            'hoodies & sweatshirts': 'hoodies & sweatshirts',

            'jacket': 'jackets & coats',
            'blazer': 'jackets & coats',
            'jackets & coats': 'jackets & coats',

            'jeans': 'jeans & trousers',

            'sportswear': 'sportswear',
            'lingerie': 'lingerie',
        };

        return catMap[lower] || lower;
    }


    // ── Filtering ──────────────────────────────────────────

    function applyFilters() {
        filteredProducts = allProducts.filter(product => {
            // Category filter
            if (filters.categories.length > 0) {
                const prodCat = normalizeCategoryForFilter(product.category);
                if (!filters.categories.some(fc => prodCat === fc)) {
                    return false;
                }
            }

            // Size filter
            if (filters.sizes.length > 0 && product.sizes) {
                const hasSizeMatch = product.sizes.some(s =>
                    filters.sizes.includes(s.toUpperCase())
                );
                if (!hasSizeMatch) return false;
            } else if (filters.sizes.length > 0 && !product.sizes) {
                // Product has no sizes defined – still show it (e.g. accessories)
            }

            // Color filter
            if (filters.colors.length > 0 && product.colors) {
                const hasColorMatch = product.colors.some(pc => {
                    const pcLower = pc.toLowerCase().trim();
                    return filters.colors.some(fc => pcLower.includes(fc));
                });
                if (!hasColorMatch) return false;
            } else if (filters.colors.length > 0 && !product.colors) {
                return false;
            }

            // Price filter
            const price = parsePrice(product.price);
            if (filters.minPrice !== null && price < filters.minPrice) return false;
            if (filters.maxPrice !== null && price > filters.maxPrice) return false;

            return true;
        });

        // Sorting
        applySort();

        // Render
        renderProducts();
        updateCount();
    }

    function applySort() {
        switch (filters.sort) {
            case 'price-low-high':
                filteredProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case 'price-high-low':
                filteredProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case 'newest':
                // reverse order (newest assumed last in data)
                filteredProducts.reverse();
                break;
            case 'featured':
            default:
                // keep original order
                break;
        }
    }

    // ── Rendering ──────────────────────────────────────────

    function renderProducts() {
        if (!gridEl) return;
        gridEl.innerHTML = '';

        if (filteredProducts.length === 0) {
            gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" style="margin: 0 auto 16px;">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <h3 style="font-size: 1.1rem; color: #333; margin-bottom: 8px;">No products found</h3>
          <p style="color: #666; font-size: 0.9rem;">Try adjusting your filters to find what you're looking for.</p>
        </div>`;
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            // card.className = 'product-card group'; // Use generic container, not 'a' tag wrapper for everything to allow button clicks
            // Actually, we can use a div wrapper.
            card.className = 'group block relative';
            card.setAttribute('data-category', normalizeCategoryForFilter(product.category));

            const image = (product.image_list && product.image_list.length > 0) ? product.image_list[0] : product.image;

            // Render price
            let priceHtml = `<p class="text-[13px] text-black">${product.price}</p>`;
            if (product.originalPrice) {
                priceHtml = `
                    <div class="flex items-center gap-2">
                        <p class="text-[13px] text-[#e50010]">${product.price}</p>
                        <p class="text-[11px] text-gray-500 line-through">${product.originalPrice}</p>
                    </div>
                 `;
            }

            // Color swatches
            let colorHtml = '';
            if (product.colors && product.colors.length > 0) {
                const maxColors = 4;
                const showColors = product.colors.slice(0, maxColors);
                const moreCount = product.colors.length - maxColors;

                const dots = showColors.map(c => {
                    const bg = colorNameToHex(c);
                    return `<span class="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block mr-1" style="background-color: ${bg};" title="${c}"></span>`;
                }).join('');

                const more = moreCount > 0 ? `<span class="text-[10px] text-gray-500">+${moreCount}</span>` : '';
                colorHtml = `<div class="flex items-center mt-1">${dots}${more}</div>`;
            }

            // Check wishlist state
            const inWishlist = (typeof Wishlist !== 'undefined' && Wishlist.has(product.id)) ? ' active' : '';

            card.innerHTML = `
                <div class="aspect-[2/3] w-full overflow-hidden bg-[#f4f4f4] mb-3 relative">
                    <a href="product.html?id=${product.id}" class="block h-full">
                        <img src="${image}" alt="${product.name}" 
                             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                    </a>
                    <button class="wishlist-btn${inWishlist} absolute bottom-2 right-2 hover:scale-110 transition-transform z-10" 
                            data-product-id="${product.id}" aria-label="Add to favourites">
                        <svg class="heart-outline w-4 h-4 text-black" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                           <path d="M8.697 2.253a4.278 4.278 0 0 1 6.05 6.05L8 15.05 1.253 8.304a4.278 4.278 0 0 1 6.05-6.05L8 2.948l.696-.696Zm4.99 1.06a2.778 2.778 0 0 0-3.93 0L8.003 5.07 6.243 3.315a2.779 2.779 0 0 0-3.93 3.928L8 12.928l5.686-5.686a2.778 2.778 0 0 0 0-3.928Z"></path>
                        </svg>
                        <svg class="heart-fill w-4 h-4 text-[#e50010]" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                           <path d="m8 13.99 6.217-6.217a3.528 3.528 0 0 0-4.99-4.99L8.001 4.01 6.773 2.784a3.528 3.528 0 1 0-4.99 4.99L8 13.988Z"></path>
                        </svg>
                    </button>
                </div>
                <div class="text-left space-y-0.5">
                    <a href="product.html?id=${product.id}" class="no-underline">
                        <h3 class="text-[13px] text-black font-normal uppercase hover:underline truncate">${product.name}</h3>
                    </a>
                    ${priceHtml}
                    ${colorHtml.replace(/rounded-full/g, 'rounded-sm')}
                </div>
            `;
            gridEl.appendChild(card);
        });

        // Bind wishlist heart buttons
        if (typeof Wishlist !== 'undefined') {
            Wishlist.bindHeartButtons(gridEl);
        }
    }

    function updateCount() {
        const countElem = document.getElementById('filter-product-count');
        if (countElem) {
            countElem.textContent = filteredProducts.length;
        }
    }

    // ── Active filter tags ──────────────────────────────

    function renderActiveFilters() {
        const container = document.getElementById('active-filters');
        if (!container) return;

        const tags = [];

        filters.categories.forEach(c => tags.push({ type: 'category', value: c, label: c }));
        filters.sizes.forEach(s => tags.push({ type: 'size', value: s, label: `Size: ${s}` }));
        filters.colors.forEach(c => tags.push({ type: 'color', value: c, label: `Color: ${c}` }));
        if (filters.minPrice !== null) tags.push({ type: 'minPrice', value: null, label: `Min: ₹${filters.minPrice}` });
        if (filters.maxPrice !== null) tags.push({ type: 'maxPrice', value: null, label: `Max: ₹${filters.maxPrice}` });

        if (tags.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = tags.map(t =>
            `<span class="filter-tag" data-type="${t.type}" data-value="${t.value || ''}">${t.label} <button class="filter-tag-remove" aria-label="Remove filter">&times;</button></span>`
        ).join('') + `<button class="filter-clear-all" id="clear-all-filters">Clear all</button>`;

        // Bind tag remove
        container.querySelectorAll('.filter-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.closest('.filter-tag');
                const type = tag.dataset.type;
                const value = tag.dataset.value;
                removeFilter(type, value);
            });
        });

        const clearAll = document.getElementById('clear-all-filters');
        if (clearAll) {
            clearAll.addEventListener('click', () => {
                resetAllFilters();
            });
        }
    }

    function removeFilter(type, value) {
        switch (type) {
            case 'category':
                filters.categories = filters.categories.filter(c => c !== value);
                break;
            case 'size':
                filters.sizes = filters.sizes.filter(s => s !== value);
                break;
            case 'color':
                filters.colors = filters.colors.filter(c => c !== value);
                break;
            case 'minPrice':
                filters.minPrice = null;
                break;
            case 'maxPrice':
                filters.maxPrice = null;
                break;
        }
        // Uncheck the corresponding checkbox
        syncCheckboxes();
        applyFilters();
        renderActiveFilters();
    }

    function resetAllFilters() {
        filters.categories = [];
        filters.sizes = [];
        filters.colors = [];
        filters.minPrice = null;
        filters.maxPrice = null;
        // Reset price inputs
        const minInput = document.getElementById('filter-min-price');
        const maxInput = document.getElementById('filter-max-price');
        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';
        syncCheckboxes();
        applyFilters();
        renderActiveFilters();
    }

    function syncCheckboxes() {
        // Uncheck all then re-check active ones
        document.querySelectorAll('[data-filter-type]').forEach(cb => {
            cb.checked = false;
        });
        filters.categories.forEach(c => {
            const cb = document.querySelector(`[data-filter-type="category"][data-filter-value="${c}"]`);
            if (cb) cb.checked = true;
        });
        filters.sizes.forEach(s => {
            const cb = document.querySelector(`[data-filter-type="size"][data-filter-value="${s}"]`);
            if (cb) cb.checked = true;
        });
        filters.colors.forEach(c => {
            const cb = document.querySelector(`[data-filter-type="color"][data-filter-value="${c}"]`);
            if (cb) cb.checked = true;
        });
    }

    // ── Binding ──────────────────────────────────────────

    function bindFilters() {
        // Category checkboxes
        document.querySelectorAll('[data-filter-type="category"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const val = cb.dataset.filterValue;
                if (cb.checked) {
                    if (!filters.categories.includes(val)) filters.categories.push(val);
                } else {
                    filters.categories = filters.categories.filter(c => c !== val);
                }
                applyFilters();
                renderActiveFilters();
            });
        });

        // Size checkboxes
        document.querySelectorAll('[data-filter-type="size"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const val = cb.dataset.filterValue;
                if (cb.checked) {
                    if (!filters.sizes.includes(val)) filters.sizes.push(val);
                } else {
                    filters.sizes = filters.sizes.filter(s => s !== val);
                }
                applyFilters();
                renderActiveFilters();
            });
        });

        // Color checkboxes
        document.querySelectorAll('[data-filter-type="color"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const val = cb.dataset.filterValue;
                if (cb.checked) {
                    if (!filters.colors.includes(val)) filters.colors.push(val);
                } else {
                    filters.colors = filters.colors.filter(c => c !== val);
                }
                // CSS handles visual :checked state via input:checked + label
                applyFilters();
                renderActiveFilters();
            });
        });

        // Price inputs
        const minInput = document.getElementById('filter-min-price');
        const maxInput = document.getElementById('filter-max-price');
        const applyBtn = document.getElementById('filter-apply-price');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                filters.minPrice = minInput && minInput.value ? parseFloat(minInput.value) : null;
                filters.maxPrice = maxInput && maxInput.value ? parseFloat(maxInput.value) : null;
                applyFilters();
                renderActiveFilters();
            });
        }

        // Also apply on Enter key in price inputs
        [minInput, maxInput].forEach(input => {
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (applyBtn) applyBtn.click();
                    }
                });
            }
        });

        // Sort dropdown
        const sortSelect = document.getElementById('filter-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                filters.sort = sortSelect.value;
                applyFilters();
            });
        }

        // ── Accordion toggles ──────────────────────────────
        document.querySelectorAll('.filter-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.filter-section');
                if (section) {
                    section.classList.toggle('open');
                    header.setAttribute('aria-expanded', section.classList.contains('open'));
                }
            });
        });

        // ── Mobile filter drawer ───────────────────────────
        const mobileBtn = document.getElementById('mobile-filter-btn');
        const mobileClose = document.getElementById('mobile-filter-close');
        const sidebar = document.getElementById('filters-sidebar');
        const overlay = document.getElementById('filter-overlay');

        function openMobileFilters() {
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileFilters() {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        if (mobileBtn) mobileBtn.addEventListener('click', openMobileFilters);
        if (mobileClose) mobileClose.addEventListener('click', closeMobileFilters);
        if (overlay) overlay.addEventListener('click', closeMobileFilters);
    }

    // ── Init ──────────────────────────────────────────

    function init(options) {
        categoryKey = options.categoryKey || '';
        gridEl = document.getElementById(options.gridId);
        if (!gridEl || !window.productsData) return;

        allProducts = window.productsData.products[categoryKey] || [];
        filteredProducts = [...allProducts];

        bindFilters();
        applyFilters();
        renderActiveFilters();
    }

    return { init };
})();
