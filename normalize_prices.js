const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data/products.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

function formatPrice(price) {
    if (typeof price === 'string') {
        // "Rs. 2,799.00" -> 2799
        // "1299" -> 1299
        let num = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return price;
        return num;
    }
    return price;
}

// Transform all products
for (const category in data.products) {
    data.products[category] = data.products[category].map(p => {
        // Normalize price to number for consistency, or standard string.
        // User provided "Rs. 2,799.00". Let's use that format.
        let num = formatPrice(p.price);
        p.price = `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        if (p.originalPrice) {
            let orig = formatPrice(p.originalPrice);
            p.originalPrice = `Rs. ${orig.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        }

        // Ensure image_list exists
        if (!p.image_list) {
            p.image_list = p.image ? [p.image] : [];
        }

        // Ensure art_no
        if (!p.art_no) p.art_no = p.id;

        return p;
    });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Prices normalized.');
