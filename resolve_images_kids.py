import json
import os
import re
from difflib import SequenceMatcher

# 1. Gather all candidate images
candidates = []
seen_urls = set()

def add_candidate(name, url):
    if url and url not in seen_urls:
        if '?' in url: url = url.split('?')[0]
        blacklist = [
            'https://image.hm.com/assets/hm/2a/3b/2a3b043321ad879bad9716616421427c320d36b8.jpg',
            'https://image.hm.com/assets/hm/7c/8d/7c8d9c2231454805362947171578583486307208.jpg'
        ]
        if url in blacklist: return
        seen_urls.add(url)
        candidates.append({'name': name, 'url': url})

if os.path.exists('new_kids_dump.html'):
    try:
        with open('new_kids_dump.html', 'r', encoding='utf-8') as f:
            content = f.read()
            ld_regex = r'<script[^>]*id="product-list-carousel-schema"[^>]*>(.*?)</script>'
            ld_match = re.search(ld_regex, content, re.DOTALL)
            if ld_match:
                try:
                    data_ld = json.loads(ld_match.group(1))
                    items = data_ld.get('itemListElement', [])
                    for item in items:
                        prod = item.get('item', {})
                        add_candidate(prod.get('name', ''), prod.get('image', [])[0] if isinstance(prod.get('image'), list) else prod.get('image', ''))
                except: pass
            
            articles = re.findall(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
            for art in articles:
                title = re.search(r'title=\"([^\"]+)\"', art)
                img = re.search(r'src=\"(https://image.hm.com[^\"]+)\"', art) or re.search(r'data-src=\"(https://image.hm.com[^\"]+)\"', art)
                if title and img:
                    add_candidate(title.group(1), img.group(1))
    except: pass

print(f"Total candidate unique images: {len(candidates)}")

# Category Logic
CATEGORIES = {
    'dress': ['dress', 'frock'],
    'top': ['top', 'shirt', 'blouse', 'sweatshirt', 'hoodie', 'cardigan', 'sweater', 'jumper', 'tee'],
    'bottom': ['jeans', 'trousers', 'shorts', 'joggers', 'skort', 'skirt', 'leggings', 'pants'],
    'jacket': ['jacket', 'coat', 'blazer'],
    'accessory': ['cap', 'hat', 'bag', 'tie', 'earmuffs', 'glove', 'scarf', 'belt'],
    'nightwear': ['pyjama', 'nightwear', 'robe']
}

def get_category(name):
    name = name.lower()
    for cat, keywords in CATEGORIES.items():
        if any(k in name for k in keywords):
            return cat
    return 'other'

# 2. Identify products
with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Allow resetting bad URL assignments from previous run (if they are not local paths)
target_products = data['products']['kids']
local_img_dir = 'images/products/kids'
products_to_update = []
satisfied_count = 0

for p in target_products:
    img_val = p.get('image', '')
    is_satisfied = False
    # Only consider satisfied if it's a downloaded local file
    if img_val and img_val.startswith('../images/products/kids/') and os.path.exists(os.path.join(local_img_dir, os.path.basename(img_val))):
        is_satisfied = True
            
    if is_satisfied:
        satisfied_count += 1
    else:
        products_to_update.append(p)

print(f"Products satisfied: {satisfied_count}")
print(f"Products needing images: {len(products_to_update)}")

assigned_count = 0
used_candidate_indices = set()

for p in products_to_update:
    p_name = p['name']
    p_cat = get_category(p_name)
    
    best_idx = -1
    best_score = 0.0
    
    for i, c in enumerate(candidates):
        # We allow reuse if we run out, but try unique first? 
        # For now, let's reuse if needed, but penalize? 
        # Actually, let's just allow reuse for now as source is small.
        # But prefer unused.
        
        c_name = c['name']
        c_cat = get_category(c_name)
        
        # Strict Category Filter
        if p_cat != 'other' and c_cat != 'other' and p_cat != c_cat:
            continue
            
        # Match Score
        # 1. Token overlap
        p_tokens = set(re.findall(r'\w+', p_name.lower()))
        c_tokens = set(re.findall(r'\w+', c_name.lower()))
        common = p_tokens.intersection(c_tokens)
        score = len(common) / max(len(p_tokens), 1)
        
        # 2. Seq Ratio
        seq_score = SequenceMatcher(None, p_name.lower(), c_name.lower()).ratio()
        
        final_score = max(score, seq_score)
        
        # Boost if category matches perfectly (redundant but safe)
        if p_cat == c_cat and p_cat != 'other':
            final_score += 0.1
            
        if final_score > best_score:
            best_score = final_score
            best_idx = i
            
    if best_score > 0.4 and best_idx != -1:
        c_url = candidates[best_idx]['url']
        c_name = candidates[best_idx]['name']
        print(f"Match: '{p_name}' -> '{c_name}' (Score: {best_score:.2f})")
        p['image'] = c_url
        p['image_list'] = [c_url]
        assigned_count += 1
    else:
        print(f"No valid match for: '{p_name}' (Cat: {p_cat})")

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
print(f"Assigned images to {assigned_count} products.")
