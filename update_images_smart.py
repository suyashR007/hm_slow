import json
import os
import re

# 1. Parse the HTML dump for images
html_dump_path = 'new_men_dump.html'
image_map = {} # Name -> Image URL

if os.path.exists(html_dump_path):
    with open(html_dump_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Read dump file: {len(content)} bytes")

    # Strategy 1: JSON-LD Schema (Most Reliable)
    # Look for <script id="product-list-carousel-schema" ...>...</script>
    ld_regex = r'<script[^>]*id="product-list-carousel-schema"[^>]*>(.*?)</script>'
    ld_match = re.search(ld_regex, content, re.DOTALL)
    if ld_match:
        try:
            json_str = ld_match.group(1)
            data_ld = json.loads(json_str)
            items = data_ld.get('itemListElement', [])
            print(f"Found {len(items)} items in JSON-LD schema")
            for item in items:
                prod = item.get('item', {})
                name = prod.get('name')
                images = prod.get('image', [])
                # Images can be a list or string
                img_url = None
                if isinstance(images, list) and images:
                    img_url = images[0]
                elif isinstance(images, str):
                    img_url = images
                
                if name and img_url:
                    clean_name = name.strip().lower()
                    image_map[clean_name] = img_url
        except Exception as e:
            print(f"Error parsing JSON-LD: {e}")

    # Strategy 2: HTML Article tags (Fallback/Augment)
    # Split by article to keep context
    articles = re.split(r'<article', content)
    print(f"Found {len(articles)-1} HTML articles in dump")

    for art in articles[1:]: # Skip first split part
        # Extract Title
        title_match = re.search(r'title="([^"]+)"', art)
        if not title_match:
            continue
        title = title_match.group(1)
        clean_name = title.strip().lower()

        # If we already have it from JSON, skip or overwrite? JSON is likely better quality.
        if clean_name in image_map:
            continue

        # Extract Image URL
        # Look for srcset first
        srcset_match = re.search(r'srcset="([^"]+)"', art)
        if srcset_match:
            # Take the last URL in the comma-separated list (usually largest)
            srcset = srcset_match.group(1)
            urls = [u.strip().split(' ')[0] for u in srcset.split(',')]
            if urls:
                image_url = urls[-1] # Largest
        else:
            # Fallback to src
            src_match = re.search(r'src="([^"]+)"', art)
            if src_match:
                image_url = src_match.group(1)
            else:
                continue

        # Clean URL (remove query params if needed)
        if '?' in image_url:
            image_url = image_url.split('?')[0]
            
        image_map[clean_name] = image_url

print(f"Total mapped unique images: {len(image_map)}")
# Debug: print sample keys
# print("Sample keys:", list(image_map.keys())[:5])

# 2. Update Products
json_path = 'data/products.json'
updated_count = 0

if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    # Locate men's products
    men_products = []
    if isinstance(all_data, dict) and 'products' in all_data:
        products_map = all_data['products']
        # flexible key finding
        found_key = None
        for k in products_map.keys():
            if k.lower() == 'men':
                found_key = k
                break
        
        if found_key:
            men_products = products_map[found_key]
        else:
            print("No 'men' category found in products.json")
    
    # Update logic
    for p in men_products:
        p_name = p.get('name', '').strip().lower()
        if p_name in image_map:
            old_img = p.get('image', '')
            new_img = image_map[p_name]
            
            # Update if different or if old is a placeholder
            if old_img != new_img:
                p['image'] = new_img
                # Also update image_list if present
                if 'image_list' in p:
                     # Keep other images if they exist? Or replace? 
                     # Usually the first image in image_list should be the main image
                     # Let's just prepend or reset. Reset is safer if we want high quality.
                     p['image_list'] = [new_img] 
                updated_count += 1
                # print(f"Updated: {p.get('name')}")

    # Save
    if updated_count > 0:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=4)
        print(f"Saved products.json with {updated_count} updated images.")
    else:
        print("No matches found to update.")

else:
    print("products.json not found.")
