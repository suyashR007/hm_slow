const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data', 'products.json');
const jsPath = path.join(__dirname, 'js', 'products-data.js');

const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const jsContent = 'window.productsData = ' + jsonContent + ';';
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('products-data.js rebuilt successfully!');
