import json
import os
import urllib.request
import time

# Configuration
INPUT_JSON = 'data/products.json'
OUTPUT_DIR = 'images/products/kids'
REL_PATH_PREFIX = '../images/products/kids/' # Relative to pages/kids.html (assuming equivalent structure)

# Ensure output directory exists (absolute path for saving)
abs_output_dir = os.path.abspath(OUTPUT_DIR)
if not os.path.exists(abs_output_dir):
    os.makedirs(abs_output_dir)
    print(f"Created directory: {abs_output_dir}")

# Load Data
with open(INPUT_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

kids_products = []
if 'products' in data and 'kids' in data['products']:
    kids_products = data['products']['kids']

print(f"Found {len(kids_products)} kids products to process.")

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
downloaded_count = 0
updated_count = 0

for p in kids_products:
    img_url = p.get('image', '')
    p_id = p.get('id', 'unknown')
    
    # Skip if already a local path or empty
    if not img_url or not img_url.startswith('http'):
        continue

    # Clean URL (remove query params)
    clean_url = img_url.split('?')[0]
    ext = os.path.splitext(clean_url)[1]
    if not ext:
        ext = '.jpg'
    
    filename = f"{p_id}{ext}"
    save_path = os.path.join(abs_output_dir, filename)
    rel_path = f"{REL_PATH_PREFIX}{filename}"

    # Download
    try:
        req = urllib.request.Request(img_url, headers=headers)
        with urllib.request.urlopen(req) as response, open(save_path, 'wb') as out_file:
            data_content = response.read()
            out_file.write(data_content)
        
        # Update JSON
        p['image'] = rel_path
        if 'image_list' in p:
            new_list = [rel_path]
            p['image_list'] = new_list
            
        downloaded_count += 1
        updated_count += 1
        print(f"Downloaded: {filename}")
        
    except Exception as e:
        print(f"Failed to download {img_url}: {e}")

# Save updated JSON
if updated_count > 0:
    with open(INPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print(f"Saved products.json with {updated_count} local image paths.")
else:
    print("No updates made.")
