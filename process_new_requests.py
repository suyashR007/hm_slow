import json
import os
import re

# 1. Load the new requests
with open('data/new_men_requests.json', 'r', encoding='utf-8') as f:
    new_requests = json.load(f)

# 2. Parse the HTML dump for images (Smart JSON-LD + Regex)
html_dump_path = 'new_men_dump.html'
image_map = {}

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

    # Strategy 2: HTML Article tags (Fallback)
    articles = re.split(r'<article', content)
    print(f"Found {len(articles)-1} HTML articles in dump")

    for art in articles[1:]: # Skip first split part
        # Extract Title
        title_match = re.search(r'title="([^"]+)"', art)
        if not title_match:
            continue
        title = title_match.group(1)
        clean_name = title.strip().lower()

        # If we already have it from JSON, skip (JSON is better)
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

        # Clean URL
        if '?' in image_url:
            image_url = image_url.split('?')[0]
            
        image_map[clean_name] = image_url

print(f"Mapped {len(image_map)} unique images.")

# 3. Load existing products
json_path = 'data/products.json'
all_products_data = {}
men_products_list = []

# Helper to find nested key
def get_men_list(data):
    if isinstance(data, dict) and 'products' in data:
        products_map = data['products']
        for k in products_map.keys():
            if k.lower() == 'men':
                return products_map[k]
        # if not found, create it
        products_map['men'] = []
        return products_map['men']
    return []

if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            all_products_data = json.load(f)
        except:
            all_products_data = {'products': {'men': []}}
else:
    all_products_data = {'products': {'men': []}}

men_products_list = get_men_list(all_products_data)

# Get max ID
max_id = 0
for p in men_products_list:
    try:
        pid = int(p.get('id', 0))
        if pid > max_id:
            max_id = pid
    except:
        pass

# 4. Process new requests
added_count = 0
updated_images_count = 0

for req in new_requests:
    req_name_clean = req['name'].strip().lower()
    
    # Check if product exists (by exact name match)
    existing_product = None
    for p in men_products_list:
        if p.get('name', '').strip().lower() == req_name_clean:
            existing_product = p
            break
    
    # Decide image
    final_image = req['image_link'] # Default from request (often placeholder)
    if req_name_clean in image_map:
        final_image = image_map[req_name_clean]
        # print(f"Found better image for: {req['name']}")
    
    if existing_product:
        # Update existing product's image if we found a match in dump
        if req_name_clean in image_map:
            if existing_product.get('image') != final_image:
                 existing_product['image'] = final_image
                 updated_images_count += 1
    else:
        # Add new
        max_id += 1
        new_p = {
            "id": str(max_id),
            "name": req['name'],
            "price": req['price'],
            "cat_name": "Men", 
            "main_category": "men", 
            "category": req['category'],
            "image": final_image,
            "description": req['description'],
            "color": "Various", 
            "composition": req.get('fabric_details', ''),
            "link": req['url']
        }
        men_products_list.append(new_p)
        added_count += 1
        if req_name_clean in image_map:
             updated_images_count += 1 # Count as updated image because we used a better one than placeholder

# 5. Save back
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(all_products_data, f, indent=4)

print(f"Process complete: Added {added_count} new products. Updated/Set images for {updated_images_count} items.")
