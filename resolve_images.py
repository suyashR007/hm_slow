import json
import os
import re
from difflib import SequenceMatcher

# 1. Gather all candidate images
candidates = [] # list of {'url': str, 'name': str}
seen_urls = set()

def add_candidate(name, url):
    if url and url not in seen_urls:
        # Clean URL
        if '?' in url:
            url = url.split('?')[0]
        
        # Blacklist
        blacklist = [
            'https://image.hm.com/assets/hm/2a/3b/2a3b043321ad879bad9716616421427c320d36b8.jpg'
        ]
        if url in blacklist:
            return

        seen_urls.add(url)
        candidates.append({'name': name, 'url': url})

# Source A: scraped_images_map.json
if os.path.exists('scraped_images_map.json'):
    with open('scraped_images_map.json', 'r', encoding='utf-8') as f:
        scraped = json.load(f)
        for item in scraped:
            add_candidate(item.get('name', ''), item.get('image', ''))
            # Also add colors images if available? 
            # The structure is "image": "url". Colors is just a list of strings.

# Source B: new_men_dump.html (JSON-LD)
if os.path.exists('new_men_dump.html'):
    with open('new_men_dump.html', 'r', encoding='utf-8') as f:
        content = f.read()
        ld_regex = r'<script[^>]*id="product-list-carousel-schema"[^>]*>(.*?)</script>'
        ld_match = re.search(ld_regex, content, re.DOTALL)
        if ld_match:
            try:
                data_ld = json.loads(ld_match.group(1))
                items = data_ld.get('itemListElement', [])
                for item in items:
                    prod = item.get('item', {})
                    name = prod.get('name', '')
                    images = prod.get('image', [])
                    url = None
                    if isinstance(images, list) and images:
                        url = images[0]
                    elif isinstance(images, str):
                        url = images
                    add_candidate(name, url)
            except:
                pass

print(f"Total candidate unique images: {len(candidates)}")

# 2. Identify products needing images
with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

men_products = data['products']['men']
local_img_dir = 'images/products/men'

# Track used URLs to avoid repeats (even if candidates has duplicates with different names, we filter by URL)
# Actually, candidates are unique by URL.
# But we need to check if any EXISTING successful products are using these URLs?
# We converted existing products to local paths, so we don't know their original URL easily.
# But we can assume if it's local, it's "taken".

# We need to assign images to products that DON'T have a valid local image.
products_to_update = []
satisfied_count = 0

for p in men_products:
    img_val = p.get('image', '')
    is_satisfied = False
    
    if img_val and img_val.startswith('../images/products/men/'):
        # Check if file exists
        fname = os.path.basename(img_val)
        if os.path.exists(os.path.join(local_img_dir, fname)):
            is_satisfied = True
            
    if is_satisfied:
        satisfied_count += 1
    else:
        products_to_update.append(p)

print(f"Products satisfied: {satisfied_count}")
print(f"Products needing images: {len(products_to_update)}")

# 3. Match and Assign
# Strategy: 
# a. Exact Name Match
# b. Fuzzy Name Match
# c. Keyword Match
# d. Random/Next available

# Helper for fuzzy match
def similar(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

assigned_count = 0
used_candidate_indices = set()

# Pass 1: Exact Match (Case insensitive)
for p in products_to_update:
    if p in [x['product'] for x in getattr(products_to_update, 'assigned', [])]: continue # tracking assigned
    
    p_name = p['name'].lower().strip()
    
    best_idx = -1
    for i, c in enumerate(candidates):
        if i in used_candidate_indices: continue
        c_name = c['name'].lower().strip()
        if c_name == p_name:
            best_idx = i
            break
    
    if best_idx != -1:
        p['image'] = candidates[best_idx]['url']
        p['image_list'] = [candidates[best_idx]['url']]
        used_candidate_indices.add(best_idx)
        p['_assigned'] = True
        assigned_count += 1
        # print(f"Exact match: {p['name']}")

# Pass 2: Fuzzy / Keyword Match
for p in products_to_update:
    if p.get('_assigned'): continue
    
    p_name = p['name'].lower()
    
    best_idx = -1
    best_score = 0.0
    
    for i, c in enumerate(candidates):
        if i in used_candidate_indices: continue
        c_name = c['name'].lower()
        
        # Keyword bonus
        score = similar(p_name, c_name)
        
        # Boost if category words appear in both (e.g. "shirt", "jeans", "trousers")
        keywords = ['shirt', 'jeans', 'trousers', 'shorts', 'jacket', 'hoodie', 'sweatshirt', 'chinos', 'polo', 'cardigan', 'blazer', 'vest']
        for kw in keywords:
            if kw in p_name and kw in c_name:
                score += 0.3 # Significant boost
                break
        
        if score > best_score:
            best_score = score
            best_idx = i
            
    # Threshold for "good enough"
    if best_score > 0.5 and best_idx != -1:
        p['image'] = candidates[best_idx]['url']
        p['image_list'] = [candidates[best_idx]['url']]
        used_candidate_indices.add(best_idx)
        p['_assigned'] = True
        assigned_count += 1
        # print(f"Fuzzy match ({best_score:.2f}): {p['name']} <- {candidates[best_idx]['name']}")

# Pass 3: Fill remaining with whatever is left (Sequential)
for p in products_to_update:
    if p.get('_assigned'): continue
    
    # Just find next unused
    found = False
    for i, c in enumerate(candidates):
        if i not in used_candidate_indices:
            p['image'] = c['url']
            p['image_list'] = [c['url']]
            used_candidate_indices.add(i)
            p['_assigned'] = True
            assigned_count += 1
            found = True
            # print(f"Fallback assign: {p['name']} <- {c['name']}")
            break
            
    if not found:
        print(f"Warning: Ran out of images for {p['name']}")

# Cleanup and Save
for p in products_to_update:
    if '_assigned' in p:
        del p['_assigned']

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print(f"Assigned images to {assigned_count} products.")
