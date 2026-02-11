import json

def generate_html():
    with open('data/products.json', 'r') as f:
        data = json.load(f)
    
    products = data['products']['women'][0:12] # First 12 items
    
    html = '<div class="product-grid">\n'
    
    for p in products:
        price = f"Rs.{p['price']}"
        html += f'''
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="{p['image']}" alt="{p['name']}" class="product-image">
                        <div class="product-actions">
                            <button class="product-action-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">{p['name']}</h3>
                        <div class="product-price">
                            <span class="price-current">{price}</span>
                        </div>
                        <div class="product-colors" style="margin-top: 5px; display: flex; gap: 5px;">
                            {''.join([f'<span style="width: 12px; height: 12px; border-radius: 50%; background-color: {c}; border: 1px solid #ccc; display: inline-block;"></span>' for c in p.get("colors", [])])}
                        </div>
                    </div>
                </div>'''
    
    html += '\n            </div>'
    print(html)

if __name__ == "__main__":
    generate_html()
