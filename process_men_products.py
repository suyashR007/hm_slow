import json
import os
import re
import urllib.request
import hashlib
from difflib import SequenceMatcher

def gather_candidate_images():
    candidates = []
    seen_urls = set()

    def add_cand(name, url, source):
        if not url or not url.startswith('http'):
            return
        clean_url = url.split('?')[0]
        if clean_url in seen_urls:
            return
        seen_urls.add(clean_url)
        candidates.append({'name': name, 'url': clean_url, 'source': source})

    # Source 1: scraped_images_map.json
    if os.path.exists('scraped_images_map.json'):
        try:
            with open('scraped_images_map.json', 'r', encoding='utf-8') as f:
                for x in json.load(f):
                    add_cand(x.get('name', ''), x.get('image', ''), 'scraped_images_map')
        except Exception as e:
            print(f"Warning reading scraped_images_map.json: {e}")

    # Source 2: new_men_dump.html (JSON-LD)
    if os.path.exists('new_men_dump.html'):
        try:
            with open('new_men_dump.html', 'r', encoding='utf-8') as f:
                content = f.read()
                m = re.search(r'<script id="product-list-carousel-schema"[^>]*>(.*?)</script>', content, re.DOTALL)
                if m:
                    data = json.loads(m.group(1))
                    for el in data.get('itemListElement', []):
                        item = el.get('item', {})
                        name = item.get('name', '')
                        imgs = item.get('image', [])
                        if isinstance(imgs, str):
                            imgs = [imgs]
                        for img in imgs:
                            add_cand(name, img, 'new_men_dump')
        except Exception as e:
            print(f"Warning reading new_men_dump.html: {e}")

    # Source 3: update_images_from_dump.py (HTML dump)
    if os.path.exists('update_images_from_dump.py'):
        try:
            with open('update_images_from_dump.py', 'r', encoding='utf-8') as f:
                content = f.read()
                articles = re.findall(r'<article.*?title="([^"]+)".*?(?:srcset|src)="([^"]+)"', content, re.DOTALL)
                for title, src in articles:
                    url = src.split(' ')[0]
                    add_cand(title, url, 'update_images_from_dump')
        except Exception as e:
            print(f"Warning reading update_images_from_dump.py: {e}")

    print(f"Loaded {len(candidates)} unique candidate H&M images.")
    return candidates

def detect_item_type(name, category=''):
    text = (name + ' ' + (category or '')).lower()
    if 'hoodie' in text:
        return 'hoodie'
    if 'polo' in text:
        return 'polo'
    if 'sweatshirt' in text:
        return 'sweatshirt'
    if 't-shirt' in text or 'tshirt' in text or 'tee' in text or 'vest' in text:
        return 'tshirt'
    if 'blazer' in text:
        return 'blazer'
    if 'jacket' in text or 'parka' in text or 'bomber' in text or 'coat' in text:
        return 'jacket'
    if 'jeans' in text:
        return 'jeans'
    if 'shorts' in text or 'sweatshorts' in text:
        return 'shorts'
    if 'cardigan' in text or 'sweater' in text or 'knit' in text:
        return 'knitwear'
    if 'shirt' in text:
        return 'shirt'
    if 'trousers' in text or 'chinos' in text or 'cargo' in text or 'pants' in text or 'joggers' in text or 'sweatpants' in text or 'track' in text:
        return 'trousers'
    if 'sunglasses' in text or 'cap' in text or 'bag' in text or 'necklace' in text or 'ring' in text or 'gloves' in text:
        return 'accessories'
    return 'other'

def score_match(prod_name, prod_cat, cand_name):
    p_name = prod_name.lower().strip()
    c_name = cand_name.lower().strip()
    p_type = detect_item_type(prod_name, prod_cat)
    c_type = detect_item_type(cand_name, '')

    if p_name == c_name:
        return 30.0

    p_tokens = set(re.findall(r'\w+', p_name))
    c_tokens = set(re.findall(r'\w+', c_name))
    common = p_tokens.intersection(c_tokens)

    score = len(common) * 4.0 + SequenceMatcher(None, p_name, c_name).ratio() * 3.0

    if p_type != 'other' and p_type == c_type:
        score += 10.0
    elif p_type != 'other' and c_type != 'other' and p_type != c_type:
        score -= 30.0

    return score

def download_image_with_fallbacks(clean_url, target_path):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    # Try different resolution formats
    variants = [
        f"{clean_url}?imwidth=1536",
        f"{clean_url}?imwidth=2160",
        clean_url
    ]
    last_err = None
    for u in variants:
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
                if len(data) >= 1000:
                    with open(target_path, 'wb') as f:
                        f.write(data)
                    return len(data)
        except Exception as e:
            last_err = e
    raise ValueError(f"Failed to download {clean_url}: {last_err}")

def normalize_category_for_db(name, cat_str):
    c = (cat_str or '').strip().capitalize()
    t = detect_item_type(name, cat_str)
    if t == 'tshirt' or t == 'polo':
        return 'Top'
    if t == 'shirt':
        return 'Shirt'
    if t == 'trousers' or t == 'shorts':
        return 'Trousers'
    if t == 'jeans':
        return 'Jeans'
    if t == 'jacket' or t == 'blazer':
        return 'Jacket'
    if t == 'sweatshirt' or t == 'hoodie':
        return 'Sweatshirt'
    if t == 'knitwear':
        return 'Knitwear'
    if t == 'accessories':
        return 'Accessories'
    return c if c else 'Other'

def sync_frontend_data(products_data):
    js_path = 'js/products-data.js'
    raw_json = json.dumps(products_data, indent=2)
    js_content = f"// Auto-generated from data/products.json\nwindow.productsData = {raw_json};\n"
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Synchronized frontend data to {js_path}")

def process_men_products():
    target_path = 'data/products.json'
    men_img_dir = 'images/products/men'
    os.makedirs(men_img_dir, exist_ok=True)

    # 1. Load existing products.json
    with open(target_path, 'r', encoding='utf-8') as f:
        full_data = json.load(f)

    existing_men = full_data.get('products', {}).get('men', [])

    # 2. Load candidate requests
    requests_path = 'data/new_men_requests.json'
    requests_data = []
    if os.path.exists(requests_path):
        with open(requests_path, 'r', encoding='utf-8') as f:
            requests_data = json.load(f)

    # 3. Deduplicate and merge products
    seen_names = {}
    combined_products = []

    for p in existing_men:
        norm_name = p['name'].strip().lower()
        if norm_name not in seen_names:
            seen_names[norm_name] = p
            combined_products.append(p)

    added_from_requests = 0
    for r in requests_data:
        r_name = r['name'].strip()
        r_cat = r.get('category', '')
        if r_name == 'Cotton Jersey T-shirt' and 'Sweatpants' in r_cat:
            r_name = 'Relaxed Fit Sweatpants'
        elif r_name == 'Regular Fit Crew-Neck T-shirt' and 'Vest' in r_cat:
            r_name = 'Regular Fit Cotton Vest'
        elif r_name == 'Regular Fit Chino Trousers' and 'Sweater' in r_cat:
            r_name = 'Regular Fit Knit Sweater'
        elif r_name == 'Regular Fit Linen Shirt' and 'Shorts' in r_cat:
            r_name = 'Regular Fit Cargo Shorts'
        elif r_name == 'Regular Fit Polo Shirt' and 'Shirt' in r_cat and 'Oxford' in r.get('description', ''):
            r_name = 'Regular Fit Oxford Shirt'

        norm_name = r_name.strip().lower()
        if norm_name not in seen_names:
            new_id = str(1300000000 + len(combined_products) * 1000 + 1)
            new_prod = {
                "id": new_id,
                "name": r_name,
                "brand": "H&M",
                "price": r.get('price', 'Rs. 1,999.00'),
                "category": normalize_category_for_db(r_name, r_cat),
                "description": r.get('description', ''),
                "composition": [r.get('fabric_details', 'Cotton 100%')],
                "colors": ["Black", "Navy blue", "Grey", "White"],
                "image": f"../images/products/men/{new_id}.jpg",
                "image_list": [f"../images/products/men/{new_id}.jpg"],
                "nice_to_know": r.get("other_details", "Regular fit"),
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"]
            }
            seen_names[norm_name] = new_prod
            combined_products.append(new_prod)
            added_from_requests += 1

    print(f"Total unique Men products after deduplication: {len(combined_products)} (Added {added_from_requests} new)")

    # 4. Gather candidate images
    candidates = gather_candidate_images()

    # 5. Smartly match every product to a UNIQUE candidate image and download
    used_cand_indices = set()
    used_image_hashes = {} # md5_hash -> product_name

    for p in combined_products:
        p_id = str(p['id'])
        img_rel = f"../images/products/men/{p_id}.jpg"
        p['image'] = img_rel
        p['image_list'] = [img_rel]
        p['category'] = normalize_category_for_db(p['name'], p.get('category', ''))

    print("\nMatching and downloading unique images for all men products...")
    
    for i, p in enumerate(combined_products):
        p_id = str(p['id'])
        local_filename = f"{p_id}.jpg"
        local_filepath = os.path.join(men_img_dir, local_filename)

        # Rank candidates for this product
        ranked = []
        for idx, c in enumerate(candidates):
            if idx in used_cand_indices:
                continue
            s = score_match(p['name'], p.get('category'), c['name'])
            ranked.append((s, idx, c))

        ranked.sort(key=lambda x: x[0], reverse=True)

        success = False
        for s, idx, c in ranked:
            try:
                temp_path = local_filepath + '.tmp'
                download_image_with_fallbacks(c['url'], temp_path)
                
                with open(temp_path, 'rb') as fp:
                    h = hashlib.md5(fp.read()).hexdigest()

                # Ensure this image hash isn't already used by another product
                if h in used_image_hashes:
                    # Hash collision with another image, skip this candidate
                    os.remove(temp_path)
                    continue

                # Valid distinct image
                os.replace(temp_path, local_filepath)
                used_cand_indices.add(idx)
                used_image_hashes[h] = p['name']
                success = True
                break
            except Exception:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                continue

        if not success:
            print(f"Warning: Could not find distinct download for '{p['name']}'")

    # 6. Update products.json
    full_data['products']['men'] = combined_products
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(full_data, f, indent=2)

    print(f"\nSaved {len(combined_products)} deduplicated men products to {target_path}")

    # 7. Sync with js/products-data.js
    sync_frontend_data(full_data)
    print("Process complete.")

if __name__ == '__main__':
    process_men_products()
