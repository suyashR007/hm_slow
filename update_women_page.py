import json
import re

def update_page():
    # Read products
    with open('data/products.json', 'r') as f:
        data = json.load(f)
    
    products = data['products']['women'][0:12] # First 12 items
    
    # Generate Grid HTML
    grid_html = '<div class="product-grid">\n'
    for p in products:
        price = f"Rs.{p['price']}"
        # Map colors to valid CSS
        color_map = {
            "light-beige": "#F5F5DC",
            "dark-brown": "#654321",
            "red": "#FF0000",
            "dark-dusty-pink": "#C68E95",
            "denim-blue": "#1560BD",
            "pale-yellow": "#FDFFB6",
            "pink": "#FFC0CB",
            "brown": "#A52A2A",
            "beige": "#F5F5DC",
            "cream": "#FFFDD0",
            "black": "#000000",
            "white": "#FFFFFF",
            "gray": "#808080",
            "grey": "#808080",
            "navy": "#000080",
            "olive": "#808000",
            "blue": "#0000FF",
            "green": "#008000",
            "yellow": "#FFFF00",
            "multi-color": "linear-gradient(45deg, red, yellow, green, blue)"
        }
        
        colors_html = ""
        if "colors" in p:
            colors_html = '<div class="product-colors" style="margin-top: 5px; display: flex; gap: 5px;">'
            for c in p["colors"]:
                css_color = color_map.get(c, c)
                if "gradient" in css_color:
                     colors_html += f'<span style="width: 12px; height: 12px; border-radius: 50%; background: {css_color}; border: 1px solid #ccc; display: inline-block;"></span>'
                else:
                     colors_html += f'<span style="width: 12px; height: 12px; border-radius: 50%; background-color: {css_color}; border: 1px solid #ccc; display: inline-block;"></span>'
            colors_html += '</div>'

        badges_html = ""
        if "badges" in p:
             badges_html = '<div class="product-badges">'
             for b in p["badges"]:
                 badges_html += f'<span class="badge">{b}</span>'
             badges_html += '</div>'

        grid_html += f'''
                    <div class="product-card" onclick="window.location.href=\\'product.html?id={p['id']}\\'">
                        <div class="product-image-container">
                            <img src="{p['image']}" alt="{p['name']}" class="product-image">
                            {badges_html}
                            <div class="product-actions">
                                <button class="product-action-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                                <button class="product-action-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="product-info">
                            <p class="product-brand">{p['brand']}</p>
                            <h3 class="product-name">{p['name']}</h3>
                            <div class="product-price">
                                <span class="price-current">{price}</span>
                            </div>
                            {colors_html}
                        </div>
                    </div>'''
    grid_html += '\n                </div>'

    # Read HTML file
    with open('pages/women.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the grid
    # Pattern: <div class="product-grid"> ... </div> (but simpler to just replace the whole block if I can identify it)
    # The snippet showed lines 202-322. I can use regex or just standard string replacement if I match start/end tags.
    # Regex is risky if tags are nested.
    # But I know the start is <div class="product-grid"> and the end is </div> before <!-- Pagination -->
    
    start_marker = '<!-- Products -->'
    end_marker = '<!-- Pagination -->'
    
    pattern = re.compile(f'({re.escape(start_marker)}).*?({re.escape(end_marker)})', re.DOTALL)
    
    # Check if match found
    if pattern.search(content):
        new_content = pattern.sub(f'\\1\n                {grid_html}\n                \\2', content)
        with open('pages/women.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated women.html")
    else:
        print("Could not find product grid markers")

if __name__ == "__main__":
    update_page()
