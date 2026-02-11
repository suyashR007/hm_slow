const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data/products.json');
const jsPath = path.join(__dirname, 'js/products-data.js');

try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    // Verify it parses
    JSON.parse(rawData);

    const jsContent = `// Auto-generated from data/products.json
window.productsData = ${rawData};
`;
    fs.writeFileSync(jsPath, jsContent);
    console.log('Successfully converted products.json to js/products-data.js');
} catch (err) {
    console.error('Error converting data:', err);
}
