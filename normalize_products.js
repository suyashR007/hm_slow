const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data/products.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

function normalizePrice(price) {
    // Convert all to string "Rs. X,XXX.00" format or keep as raw number string if preferred
    // The new data has "Rs. 2,799.00". Old data has "1299".
    // Let's standardize to raw number string for logic, or formatted string for display?
    // The user provided "Rs. 2,799.00".
    // I will strip non-numeric and just keep the numeric value, or format purely.
    // Let's keep it simple: normalize to a clean string "Top value".
    // Actually, best to keep as simple digits for math, but user wants "model as new json".
    // "price": "Rs. 2,799.00"

    let str = String(price).replace(/[^0-9.]/g, '');
    let num = parseFloat(str);
    if (isNaN(num)) return price;

    // Format as Rs. X,XXX.00
    return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function transformProduct(p) {
    // Ensure image_list exists
    if (!p.image_list) {
        p.image_list = p.image ? [p.image] : [];
    }

    // Ensure id matches art_no if art_no exists, or vice versa
    if (p.art_no && !p.id) p.id = p.art_no;
    if (p.id && !p.art_no) p.art_no = p.id;

    // Normalize Price
    // p.price = normalizePrice(p.price);

    // Ensure category is capitalized if we want consistency? User data had "Jackets" (Title case). Old data "jackets" (lower).
    // Let's keep existing consistency or title case it.

    return p;
}

for (const category in data.products) {
    data.products[category] = data.products[category].map(transformProduct);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Products normalized.');
