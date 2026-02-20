document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        // Use global window.productsData set by products-data.js
        if (window.productsData && window.productsData.products) {
            const data = window.productsData;
            let product = null;
            // Search in all categories
            for (const category in data.products) {
                // Loose equality for ID matching (string vs number)
                const found = data.products[category].find(p => p.id == productId || p.art_no == productId);
                if (found) {
                    product = found;
                    break;
                }
            }

            if (product) {
                renderProduct(product);
            } else {
                document.getElementById('product-loading').innerHTML = '<p>Product not found.</p>';
            }
        } else {
            // Fallback to fetch if global data is missing (e.g., script load failure)
            fetch('../data/products.json')
                .then(response => response.json())
                .then(data => {
                    let product = null;
                    for (const category in data.products) {
                        const found = data.products[category].find(p => p.id == productId || p.art_no == productId);
                        if (found) {
                            product = found;
                            break;
                        }
                    }
                    if (product) {
                        renderProduct(product);
                    } else {
                        document.getElementById('product-loading').innerHTML = '<p>Product not found.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching product data:', error);
                    document.getElementById('product-loading').innerHTML = '<p>Error loading product details. Please try refreshing.</p>';
                });
        }
    } else {
        document.getElementById('product-loading').innerHTML = '<p>No product specified.</p>';
    }
});

function renderProduct(product) {
    if (!product) return;

    // Hide loading, show content
    const loadingElem = document.getElementById('product-loading');
    const contentElem = document.getElementById('product-content');
    if (loadingElem) loadingElem.classList.add('hidden');
    if (contentElem) contentElem.classList.remove('hidden');

    // Update Text Content
    document.title = `${product.name} - H&M`;
    const breadTitle = document.getElementById('breadcrumb-title');
    if (breadTitle) breadTitle.textContent = product.name;

    const breadCategory = document.getElementById('breadcrumb-category');
    if (breadCategory) breadCategory.textContent = product.category || 'Product';

    const prodTitle = document.getElementById('product-title');
    if (prodTitle) prodTitle.textContent = product.name;

    const prodCode = document.getElementById('product-code');
    if (prodCode) prodCode.textContent = `Product Code: ${product.id}`;

    const prodDesc = document.getElementById('product-description');
    if (prodDesc) prodDesc.textContent = product.description || 'No description available.';

    const longDesc = document.getElementById('long-description');
    if (longDesc) longDesc.textContent = product.description || 'No description available.';

    // Price
    const priceElement = document.getElementById('product-price');
    if (priceElement) {
        priceElement.textContent = product.price.toString().startsWith('Rs') ? product.price : `Rs. ${product.price}`;
        // Reset classes
        priceElement.classList.remove('sale');
    }

    if (product.originalPrice) {
        const originalPriceElem = document.getElementById('product-original-price');
        if (originalPriceElem) {
            originalPriceElem.textContent = product.originalPrice.toString().startsWith('Rs') ? product.originalPrice : `Rs. ${product.originalPrice}`;
            originalPriceElem.classList.remove('hidden');
        }
        // Add sale class to current price if original price exists
        if (priceElement) {
            priceElement.classList.add('sale');
        }
    }

    if (product.discount) {
        const discountElem = document.getElementById('product-discount');
        if (discountElem) {
            discountElem.textContent = `${product.discount}% OFF`;
            discountElem.classList.remove('hidden');
        }
    }

    // Images - H&M Style Grid
    const imageContainer = document.getElementById('image-container');
    const images = product.image_list || (product.image ? [product.image] : []);

    if (imageContainer && images.length > 0) {
        imageContainer.innerHTML = '';

        // Handle single image layout
        if (images.length === 1) {
            imageContainer.classList.add('single-image');
        } else {
            imageContainer.classList.remove('single-image');
        }

        images.forEach(imgSrc => {
            const imgWrapper = document.createElement('div');
            // imgWrapper.className = 'w-full'; // CSS handles grid
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = product.name;
            // img.className = 'w-full object-cover'; // CSS handles this
            imgWrapper.appendChild(img);
            imageContainer.appendChild(imgWrapper);
        });
    }

    // Badges - (Optional, depends if we kept the container)
    const badgeContainer = document.getElementById('badge-container');
    if (badgeContainer) {
        badgeContainer.innerHTML = '';
        if (product.badges) {
            product.badges.forEach(badge => {
                const span = document.createElement('span');
                span.className = 'bg-gray-100 text-xs px-2 py-1 uppercase tracking-wide mr-2';
                span.textContent = badge;
                badgeContainer.appendChild(span);
            });
        }
    }

    // Colors
    const colorContainer = document.getElementById('color-options');
    const selectedColorName = document.getElementById('selected-color-name');

    if (colorContainer) {
        colorContainer.innerHTML = '';
        // Limit to single color option as requested
        const colors = (product.colors && product.colors.length > 0) ? [product.colors[0]] : ['black'];

        // Update label if exists
        if (selectedColorName && colors.length > 0) {
            // If product has colors, show first color name, else keep blank
            if (product.colors && product.colors.length > 0) {
                selectedColorName.textContent = colors[0].charAt(0).toUpperCase() + colors[0].slice(1);
            } else {
                selectedColorName.textContent = ''; // Blank if defaulted to 'black'
            }
        }

        colors.forEach((color, index) => {
            const btn = document.createElement('div');
            btn.className = `color-option ${index === 0 ? 'selected' : ''}`;

            // Use product image for the first color (current product), fallback to color
            if (index === 0 && product.image) {
                btn.style.backgroundImage = `url('${product.image}')`;
            } else {
                btn.style.backgroundColor = color === 'multi-color' ? '#eee' : color;
                if (color === 'multi-color') btn.style.background = 'linear-gradient(45deg, red, blue)';
            }

            btn.title = color;
            btn.onclick = () => {
                Array.from(colorContainer.children).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (selectedColorName) selectedColorName.textContent = color.charAt(0).toUpperCase() + color.slice(1);
            };
            colorContainer.appendChild(btn);
        });
    }

    // Sizes
    const sizeContainer = document.getElementById('size-options');
    if (sizeContainer) {
        sizeContainer.innerHTML = '';
        const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
        sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.className = 'size-option';
            btn.textContent = size;

            // Mock disabled state for some sizes randomly if desired, or just logic
            if (Math.random() > 0.8) {
                btn.classList.add('disabled');
                btn.disabled = true;
            }

            btn.onclick = () => {
                if (btn.disabled) return;
                Array.from(sizeContainer.children).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                // Clear error
                const errorMsg = document.getElementById('size-error-msg');
                if (errorMsg) {
                    errorMsg.classList.remove('show');
                }
            };
            sizeContainer.appendChild(btn);
        });
    }

    // Add to Bag functionality
    const addToBagBtn = document.getElementById('add-to-bag-btn');
    if (addToBagBtn) {
        addToBagBtn.onclick = () => {
            // Get selected size
            const selectedSize = document.querySelector('#size-options .size-option.selected');

            // Validation
            if (!selectedSize) {
                const sizeContainer = document.getElementById('size-options');
                if (sizeContainer) {
                    // Add error styling
                    // We might need a wrapper or just set border on container if it has no padding issues
                    // Or iterate buttons to show error?
                    // Let's add an error message text if not present
                    let errorMsg = document.getElementById('size-error-msg');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.id = 'size-error-msg';
                        errorMsg.className = 'size-error-message';
                        errorMsg.textContent = 'Please select a size';
                        sizeContainer.parentNode.insertBefore(errorMsg, sizeContainer.nextSibling);
                    }

                    errorMsg.classList.add('show');

                    // Optional: Scroll to size selector
                    sizeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const size = selectedSize.textContent;

            // Get selected color
            const selectedColor = document.getElementById('selected-color-name');
            const color = selectedColor ? selectedColor.textContent : 'Default';

            // Get quantity
            const qtyInput = document.getElementById('quantity-input');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;

            // Parse price to number (handles "Rs. 1,299.00" format)
            let priceNum = 0;
            if (typeof product.price === 'number') {
                priceNum = product.price;
            } else {
                // Strip currency prefix (Rs., Rs, ₹) then commas, then parse
                const cleaned = String(product.price).replace(/^[^\d]*/, '').replace(/,/g, '');
                priceNum = parseFloat(cleaned) || 0;
            }

            // Build the cart item in the format cart.js expects
            const cartItem = {
                id: product.id || product.art_no || ('prod-' + Date.now()),
                artNo: product.art_no || product.id || '',
                name: product.name || 'Product',
                brand: product.brand || 'H&M',
                price: priceNum,
                color: color,
                size: size,
                quantity: qty,
                image: (product.image_list && product.image_list[0]) || product.image || '',
                link: 'product.html?id=' + (product.id || product.art_no || '')
            };

            // Add to the unified hm_cart in localStorage
            let cartItems = [];
            try {
                cartItems = JSON.parse(localStorage.getItem('hm_cart')) || [];
            } catch (e) { cartItems = []; }

            // Check if same product with same size and color exists
            const existingIdx = cartItems.findIndex(item =>
                item.id == cartItem.id && item.size === cartItem.size && item.color === cartItem.color
            );

            if (existingIdx >= 0) {
                cartItems[existingIdx].quantity += qty;
            } else {
                cartItems.push(cartItem);
            }

            localStorage.setItem('hm_cart', JSON.stringify(cartItems));

            // Also update main.js cart instance if available
            if (window.cart) {
                window.cart.items = cartItems;
                window.cart.updateCartCount();
            }

            // Trigger Notification
            showNotification({
                name: product.name,
                price: product.price,
                image: (product.image_list && product.image_list[0]) || product.image || '',
                color: color,
                size: size,
                quantity: qty
            });

            // Update button momentarily (optional, keeping for feedback)
            const originalText = addToBagBtn.innerHTML;
            addToBagBtn.innerHTML = '\u2713 Added to bag';
            addToBagBtn.style.backgroundColor = '#4caf50';

            setTimeout(() => {
                addToBagBtn.innerHTML = originalText;
                addToBagBtn.style.backgroundColor = ''; // Reset to default
            }, 3000);
        };
    }

    // Populate Accordions
    // Description
    const longDescText = document.getElementById('long-description-text');
    if (longDescText) {
        longDescText.textContent = product.description || 'No description available.';
    }

    const descList = document.getElementById('description-list');
    if (descList) {
        descList.innerHTML = '';
        const details = [
            { label: 'Fit', value: product.fit || 'Regular fit' },
            { label: 'Composition', value: Array.isArray(product.composition) ? product.composition.join(', ') : product.composition },
            { label: 'Art. No.', value: product.art_no },
            { label: 'Category', value: product.category }
        ];

        details.forEach(item => {
            if (item.value) {
                const dt = document.createElement('dt');
                dt.className = 'font-semibold float-left clear-left mr-1';
                dt.textContent = item.label + ':';
                const dd = document.createElement('dd');
                dd.className = 'mb-1';
                dd.textContent = item.value;
                descList.appendChild(dt);
                descList.appendChild(dd);
            }
        });

        // Clear fix for float
        const clearfix = document.createElement('div');
        clearfix.className = 'clear-both';
        descList.appendChild(clearfix);
    }

    // Materials / Composition / Details
    const matsList = document.getElementById('materials-list');
    if (matsList) {
        matsList.innerHTML = '';
        let content = '';

        // Material Explanations
        if (product.material_explanations && product.material_explanations.length > 0) {
            content += '<h4 class="font-semibold mb-2">Materials</h4>';
            product.material_explanations.forEach(mat => {
                content += `<div class="mb-2"><span class="font-medium">${mat.name}</span>: ${mat.description}</div>`;
            });
            content += '<hr class="my-4 border-gray-200">';
        }

        // Production / Regulatory Info
        const regulatoryFields = [
            { key: 'net_quantity', label: 'Net Quantity' },
            { key: 'country_of_production', label: 'Country of Production' },
            { key: 'manufactured_by', label: 'Manufactured By' },
            { key: 'marketed_by', label: 'Marketed By' },
            { key: 'date_of_manufacture', label: 'Date of Manufacture' },
            { key: 'date_of_import', label: 'Date of Import' },
            { key: 'customer_service', label: 'Customer Service' }
        ];

        let hasRegInfo = false;
        let regContent = '<h4 class="font-semibold mb-2">Product Details</h4><div class="text-xs space-y-1">';

        regulatoryFields.forEach(field => {
            if (product[field.key]) {
                regContent += `<div><span class="font-medium">${field.label}:</span> ${product[field.key]}</div>`;
                hasRegInfo = true;
            }
        });
        regContent += '</div>';

        if (hasRegInfo) {
            content += regContent;
        }

        if (!content) {
            // Fallback if no extended info
            if (product.composition) {
                content = `<p><strong>Composition:</strong> ${Array.isArray(product.composition) ? product.composition.join(', ') : product.composition}</p>`;
            } else {
                content = '<p class="text-sm text-gray-600">Material information not available for this product.</p>';
            }
        }

        matsList.innerHTML = content;
    }

    // ── Wishlist heart button ────────────────────────────
    const wishlistBtn = document.querySelector('.add-to-wishlist-icon');
    if (wishlistBtn && typeof Wishlist !== 'undefined') {
        // Set initial state
        const isInWishlist = Wishlist.has(product.id);
        _setWishlistIcon(wishlistBtn, isInWishlist);

        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = Wishlist.toggle(product);
            _setWishlistIcon(wishlistBtn, added);

            // Pop animation
            wishlistBtn.style.transform = 'scale(1.3)';
            setTimeout(() => { wishlistBtn.style.transform = ''; }, 250);
        });
    }

    // Call Others Also Bought
    renderOthersBought(product);
}

function _setWishlistIcon(btn, filled) {
    if (filled) {
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#e50010" stroke="#e50010" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>`;
        btn.setAttribute('aria-label', 'Remove from wishlist');
    } else {
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>`;
        btn.setAttribute('aria-label', 'Add to wishlist');
    }
}

function toggleAccordion(id) {
    const content = document.getElementById(`accordion-${id}`);
    const button = document.querySelector(`button[onclick="toggleAccordion('${id}')"]`);

    if (content && button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
            button.setAttribute('aria-expanded', 'true');
            content.classList.add('open');
        } else {
            button.setAttribute('aria-expanded', 'false');
            content.classList.remove('open');
        }
    }
}

function updateQuantity(change) {
    const input = document.getElementById('quantity-input');
    if (input) {
        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        input.value = val;
    }
}

function showNotification(product) {
    const notification = document.getElementById('cart-notification');
    if (!notification) return;

    // Populate data
    document.getElementById('notification-img').src = product.image;
    document.getElementById('notification-title').textContent = product.name;

    // Format price
    const priceText = typeof product.price === 'number' ? `Rs. ${product.price}` : product.price;
    document.getElementById('notification-price').textContent = priceText;

    document.getElementById('notification-color').textContent = product.color;
    document.getElementById('notification-size').textContent = product.size;
    document.getElementById('notification-qty').textContent = product.quantity;

    // Show
    notification.classList.add('show');

    // Auto hide after 5 seconds
    if (window.notificationTimeout) clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const notification = document.getElementById('cart-notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// ── Others Also Bought Logic ──────────────────────────────

function renderOthersBought(currentProduct) {
    const grid = document.getElementById('others-bought-grid');
    if (!grid || !window.productsData) return;

    // Collect all products except current
    let candidates = [];
    const all = window.productsData.products;
    Object.keys(all).forEach(cat => {
        all[cat].forEach(p => {
            if (p.id != currentProduct.id && p.art_no != currentProduct.art_no) {
                candidates.push(p);
            }
        });
    });

    // Shuffle and pick 4
    candidates.sort(() => 0.5 - Math.random());
    const selected = candidates.slice(0, 4);

    grid.innerHTML = '';

    selected.forEach(product => {
        // Construct Card
        const card = document.createElement('div');
        card.className = 'group block relative';

        // Image
        const image = (product.image_list && product.image_list.length > 0) ? product.image_list[0] : product.image;

        // Wishlist State
        const inWishlist = (typeof Wishlist !== 'undefined' && Wishlist.has(product.id));
        const heartIcon = inWishlist ?
            `<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="heart-fill w-4 h-4" style="color: #E50010; fill: #E50010;"><path d="m8 13.99 6.217-6.217a3.528 3.528 0 0 0-4.99-4.99L8.001 4.01 6.773 2.784a3.528 3.528 0 1 0-4.99 4.99L8 13.988Z" fill="#E50010"></path></svg>`
            : `<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="heart-outline w-4 h-4 text-black"><path d="M8.697 2.253a4.278 4.278 0 0 1 6.05 6.05L8 15.05 1.253 8.304a4.278 4.278 0 0 1 6.05-6.05L8 2.948l.696-.696Zm4.99 1.06a2.778 2.778 0 0 0-3.93 0L8.003 5.07 6.243 3.315a2.779 2.779 0 0 0-3.93 3.928L8 12.928l5.686-5.686a2.778 2.778 0 0 0 0-3.928Z"></path></svg>`;

        // Colors
        let colorHtml = '';
        if (product.colors && product.colors.length > 0) {
            const maxColors = 4;
            const shownColors = product.colors.slice(0, maxColors);
            const remaining = product.colors.length - maxColors;

            const squares = shownColors.map(c => {
                const hex = _getColorHex(c);
                return `<span class="inline-block w-2.5 h-2.5 mr-1 border border-gray-300 rounded-[1px]" style="background: ${hex}"></span>`;
            }).join('');

            const plus = remaining > 0 ? `<span class="text-[10px] text-gray-500 ml-1">+${remaining}</span>` : '';
            colorHtml = `<div class="mt-2 flex items-center">${squares}${plus}</div>`;
        }

        card.innerHTML = `
            <div class="aspect-[2/3] w-full overflow-hidden bg-[#f4f4f4] relative mb-3">
                <a href="product.html?id=${product.id}" class="block h-full">
                    <img src="${image}" alt="${product.name}" width="400" height="600" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                </a>
                <button class="wishlist-btn absolute top-2 right-2 hover:scale-110 transition-transform z-10 bg-white rounded-full p-1.5 shadow-md" 
                    data-product-id="${product.id}"
                    aria-label="Toggle wishlist">
                    ${heartIcon}
                </button>
            </div>
            <div class="text-left">
                <a href="product.html?id=${product.id}" class="no-underline">
                    <h3 class="text-[13px] font-bold text-black uppercase truncate tracking-wide mb-1">${product.name}</h3>
                </a>
                <p class="text-[13px] text-black font-normal">${product.price}</p>
                <p class="text-[10px] text-hm-red font-bold mt-0.5">New Arrival</p>
                ${colorHtml}
            </div>
        `;

        grid.appendChild(card);
    });

    // Bind wishlist buttons logic
    if (typeof Wishlist !== 'undefined') {
        const buttons = grid.querySelectorAll('.wishlist-btn');
        buttons.forEach(btn => {
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Ensure no other handlers interfere

                const id = btn.dataset.productId;
                const found = selected.find(p => p.id == id);

                if (found) {
                    const added = Wishlist.toggle(found);
                    const icon = added ?
                        `<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="heart-fill w-4 h-4" style="color: #E50010; fill: #E50010;"><path d="m8 13.99 6.217-6.217a3.528 3.528 0 0 0-4.99-4.99L8.001 4.01 6.773 2.784a3.528 3.528 0 1 0-4.99 4.99L8 13.988Z" fill="#E50010"></path></svg>`
                        : `<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="heart-outline w-4 h-4 text-black"><path d="M8.697 2.253a4.278 4.278 0 0 1 6.05 6.05L8 15.05 1.253 8.304a4.278 4.278 0 0 1 6.05-6.05L8 2.948l.696-.696Zm4.99 1.06a2.778 2.778 0 0 0-3.93 0L8.003 5.07 6.243 3.315a2.779 2.779 0 0 0-3.93 3.928L8 12.928l5.686-5.686a2.778 2.778 0 0 0 0-3.928Z"></path></svg>`;

                    btn.innerHTML = icon;

                    // Animation
                    btn.style.transform = 'scale(1.2)';
                    setTimeout(() => { btn.style.transform = ''; }, 200);

                    // Update header count if available
                    if (window.Wishlist && window.Wishlist.updateCount) {
                        window.Wishlist.updateCount();
                    }
                }
            });
        });
    }
}

function _getColorHex(name) {
    const map = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#E50010', // H&M Red-ish
        'blue': '#0000FF',
        'green': '#008000',
        'yellow': '#FFD700',
        'beige': '#F5F5DC',
        'light-beige': '#F5F5DC',
        'dark-blue': '#00008B',
        'light-blue': '#ADD8E6',
        'grey': '#808080',
        'gray': '#808080',
        'silver': '#C0C0C0',
        'gold': '#FFD700',
        'pink': '#FFC0CB',
        'brown': '#A52A2A',
        'dark-brown': '#654321',
        'purple': '#800080',
        'orange': '#FFA500',
        'multi-color': 'linear-gradient(45deg, red, blue, green)',
        'denim-blue': '#1560BD',
        'light-denim-blue': '#6FA3D6',
        'dark-grey': '#404040',
        'light-green': '#90EE90'
    };
    return map[name.toLowerCase()] || '#cccccc';
}
