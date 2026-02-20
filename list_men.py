import json

with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data.get('products', {}).get('men', [])
print(f"Total men products: {len(products)}")
for p in products:
    print(p.get('name'))
