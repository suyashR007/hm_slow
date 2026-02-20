import json
import os
import re

# 1. Load requests
with open('data/new_kids_requests.json', 'r', encoding='utf-8') as f:
    new_requests = json.load(f)

# 2. Extract Images from HTML Dump
image_map = {} # name -> url

dump_path = 'new_kids_dump.html'
if os.path.exists(dump_path):
    with open(dump_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strategy 1: JSON-LD Schema
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

    # Strategy 2: Article Tags (Fallback)
    articles = re.findall(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
    print(f"Found {len(articles)} articles in HTML dump")
    
    for art in articles:
        # Title
        title_match = re.search(r'title=\"([^\"]+)\"', art)
        if not title_match: continue
        title = title_match.group(1)
        
        # Image
        # Try finding standard image tag
        img_match = re.search(r'src=\"(https://image.hm.com[^\"]+)\"', art)
        if not img_match:
             # Try data-src
             img_match = re.search(r'data-src=\"(https://image.hm.com[^\"]+)\"', art)
        
        # Try srcset
        if not img_match:
             srcset_match = re.search(r'srcset=\"([^\"]+)\"', art)
             if srcset_match:
                 # Get last (largest)
                 srcset = srcset_match.group(1)
                 urls = [u.strip().split(' ')[0] for u in srcset.split(',')]
                 if urls:
                     image_map[title.strip().lower()] = urls[-1]
                     continue

        if img_match:
            image_map[title.strip().lower()] = img_match.group(1)

print(f"Total unique images mapped: {len(image_map)}")

# 3. Load Main Data
json_path = 'data/products.json'
with open(json_path, 'r', encoding='utf-8') as f:
    all_data = json.load(f)

if 'products' not in all_data:
    all_data['products'] = {}

# Ensure 'kids' category exists
if 'kids' not in all_data['products']:
    all_data['products']['kids'] = []

kids_products = all_data['products']['kids']

# 4. Process Requests
added_count = 0
updated_images_count = 0

# Find max ID
max_id = 0
for p in kids_products:
    try:
        pid = int(p['id'])
        if pid > max_id: max_id = pid
    except:
        pass

# Also check other categories to avoid ID collision if IDs are unique globally?
# Assuming IDs are unique per category or just string IDs. 
# Safe to just increment from max of all?
# Let's just use max_id relative to kids for now, or ensure unique string.
# Actually, let's scan all products for max numeric id to be safe
for cat in all_data['products']:
    for p in all_data['products'][cat]:
        try:
            pid = int(p['id'])
            if pid > max_id: max_id = pid
        except:
            pass

for req in new_requests:
    req_name_clean = req['name'].strip().lower()
    
    # Try to find match in dump
    image_url = image_map.get(req_name_clean)
    
    # Fallback: Use provided link in request if valid
    if not image_url and 'image_link' in req:
        image_url = req['image_link']
    
    # Check if exists
    existing = None
    for p in kids_products:
        if p['name'].lower() == req_name_clean:
            existing = p
            break
    
    if existing:
        # Update image if better one found
        if image_url and image_url != existing.get('image'):
            existing['image'] = image_url
            updated_images_count += 1
    else:
        # Add new
        max_id += 1
        new_p = {
            "id": str(max_id),
            "name": req['name'],
            "price": req['price'],
            "cat_name": "Kids", 
            "main_category": "kids", 
            "category": req['category'],
            "image": image_url if image_url else "", # Might be empty, to be filled later? or keep broken link
            "description": req['description'],
            "color": "Various", 
            "composition": req.get('fabric_details', ''),
            "link": req['url']
        }
        kids_products.append(new_p)
        added_count += 1

print(f"Added {added_count} new kids products.")
print(f"Updated {updated_images_count} existing products with new images.")

# 5. Save
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=4)
