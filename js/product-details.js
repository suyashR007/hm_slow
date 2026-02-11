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
    }

    if (product.originalPrice) {
        const originalPriceElem = document.getElementById('product-original-price');
        if (originalPriceElem) {
            originalPriceElem.textContent = product.originalPrice.toString().startsWith('Rs') ? product.originalPrice : `Rs. ${product.originalPrice}`;
            originalPriceElem.classList.remove('hidden');
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
        const colors = product.colors || ['black', 'white'];

        // Update label if exists
        if (selectedColorName && colors.length > 0) {
            selectedColorName.textContent = colors[0].charAt(0).toUpperCase() + colors[0].slice(1);
        }

        colors.forEach((color, index) => {
            const btn = document.createElement('div');
            btn.className = `color-option ${index === 0 ? 'selected' : ''}`;
            btn.style.backgroundColor = color === 'multi-color' ? '#eee' : color;
            if (color === 'multi-color') btn.style.background = 'linear-gradient(45deg, red, blue)';

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
            const size = selectedSize ? selectedSize.textContent : 'M';

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

            // Update button to show "Added" permanently
            addToBagBtn.innerHTML = '\u2713 Added to bag';
            addToBagBtn.style.backgroundColor = '#4caf50';
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
}

function toggleAccordion(id) {
    const content = document.getElementById(`accordion-${id}`);
    const button = document.querySelector(`button[onclick="toggleAccordion('${id}')"]`);

    if (content && button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Close all others (optional, but good for detailed views)
        /*
        document.querySelectorAll('.accordion-content').forEach(c => {
            c.classList.remove('open');
            c.style.maxHeight = null;
        });
        document.querySelectorAll('.accordion-header').forEach(b => {
            b.setAttribute('aria-expanded', 'false');
        });
        */

        if (!isExpanded) {
            button.setAttribute('aria-expanded', 'true');
            content.classList.add('open');
            // content.style.maxHeight = content.scrollHeight + "px"; // CSS handles large max-height
        } else {
            button.setAttribute('aria-expanded', 'false');
            content.classList.remove('open');
            // content.style.maxHeight = null;
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
