import json
import os
import re
from difflib import SequenceMatcher
import random

# 1. Gather all candidate images
candidates = [] 
seen_urls = set()

def add_candidate(name, url):
    if url and url not in seen_urls:
        if '?' in url: url = url.split('?')[0]
        # Clean up URL
        if not url.startswith('http'): return
        
        seen_urls.add(url)
        candidates.append({'name': name, 'url': url, 'used': False})

# Parse Dump
if os.path.exists('new_kids_dump.html'):
    try:
        with open('new_kids_dump.html', 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Method 1: JSON-LD
            ld_regex = r'<script[^>]*id="product-list-carousel-schema"[^>]*>(.*?)</script>'
            ld_match = re.search(ld_regex, content, re.DOTALL)
            if ld_match:
                try:
                    data_ld = json.loads(ld_match.group(1))
                    items = data_ld.get('itemListElement', [])
                    for item in items:
                        prod = item.get('item', {})
                        imgs = prod.get('image', [])
                        if isinstance(imgs, str): imgs = [imgs]
                        if imgs:
                            add_candidate(prod.get('name', ''), imgs[0])
                except: pass
            
            # Method 2: Article tags (often contains items not in the carousel)
            articles = re.findall(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
            for art in articles:
                title = re.search(r'title=\"([^\"]+)\"', art)
                img = re.search(r'src=\"(https://image.hm.com[^\"]+)\"', art) or re.search(r'data-src=\"(https://image.hm.com[^\"]+)\"', art)
                if title and img:
                    add_candidate(title.group(1), img.group(1))
    except Exception as e:
        print(f"Error reading dump: {e}")

print(f"Total candidate unique images: {len(candidates)}")

# Categorization
CATEGORIES = {
    'dress': ['dress', 'frock'],
    'top': ['top', 'shirt', 'blouse', 'sweatshirt', 'hoodie', 'cardigan', 'sweater', 'jumper', 'tee', 'polo'],
    'bottom': ['jeans', 'trousers', 'shorts', 'joggers', 'skort', 'skirt', 'leggings', 'pants'],
    'jacket': ['jacket', 'coat', 'blazer', 'vest'],
    'accessory': ['cap', 'hat', 'bag', 'tie', 'earmuffs', 'glove', 'scarf', 'belt'],
    'nightwear': ['pyjama', 'nightwear', 'robe'],
    'set': ['set', 'outfit', 'piece', 'suit']
}

def get_category(name):
    name = name.lower()
    for cat, keywords in CATEGORIES.items():
        if any(k in name for k in keywords):
            return cat
    return 'other'

# Scoring with Penalties
def calculate_score(prod_name, cand_name):
    p_lower = prod_name.lower()
    c_lower = cand_name.lower()
    
    # 1. Token overlap
    p_tokens = set(re.findall(r'\w+', p_lower))
    c_tokens = set(re.findall(r'\w+', c_lower))
    
    # Important keywords bonus
    important = ['denim', 'muslin', 'cardigan', 'polo', 'jacket', 'hoodie', 'dress', 'jeans', 'skirt', 'short', 'shirt']
    bonus = 0
    for w in important:
        if w in p_tokens and w in c_tokens:
            bonus += 0.3
    
    # Penalty for gender mismatch keywords (boy vs girl hints)
    # Heuristic: blouse/skirt/dress -> girl. shirt/polo -> neutral/boy.
    girl_words = ['blouse', 'skirt', 'dress', 'frilled', 'peplum', 'tulle']
    boy_words = ['shirt', 'polo', 'cargo', 'flannel']
    
    p_is_girl = any(w in p_lower for w in girl_words)
    c_is_girl = any(w in c_lower for w in girl_words)
    p_is_boy = any(w in p_lower for w in boy_words)
    c_is_boy = any(w in c_lower for w in boy_words)
    
    if (p_is_girl and c_is_boy) or (p_is_boy and c_is_girl):
        bonus -= 0.5

    common = p_tokens.intersection(c_tokens)
    base_score = len(common) / max(len(p_tokens), 1)
    
    return base_score + bonus

# Load Products
with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reset images for ALL kids products to ensure we redistribute uniquely
target_products = data['products']['kids']
# But keep local files if they are valid? 
# The user wants to REASSIGN images because of duplicates. So we should clear assignments map.
# However, we don't want to re-download if we assign the SAME image.

# Let's do a fresh pass.
for p in target_products:
    p['_temp_assigned'] = False

# Sort products to prioritize "hard" naming ones? 
# No, let's process them.

# Resolve
assignments = 0

# Randomize candidates slightly to avoid deterministic clumping if scores differ slightly?
# No, deterministic is better for debugging.

# Pass 1: Strict Unique Match
for p in target_products:
    p_name = p['name']
    p_cat = get_category(p_name)
    
    best_cand = None
    best_score = -1.0
    
    for c in candidates:
        if c['used']: continue
        
        c_name = c['name']
        c_cat = get_category(c_name)
        
        # Must match category
        if p_cat != 'other' and c_cat != 'other' and p_cat != c_cat:
            continue
            
        score = calculate_score(p_name, c_name)
        
        if score > best_score:
            best_score = score
            best_cand = c
            
    if best_score > 0.4:
        best_cand['used'] = True
        p['image'] = best_cand['url']
        p['image_list'] = [best_cand['url']]
        p['_temp_assigned'] = True
        assignments += 1
        print(f"Assigned (Unique): '{p_name}' -> '{best_cand['name']}' (Score: {best_score:.2f})")

# Pass 2: Relaxed Match (Reuse allowed if necessary, but prioritize unused)
# For items that didn't get an image in Pass 1
for p in target_products:
    if p.get('_temp_assigned'): continue
    
    p_name = p['name']
    p_cat = get_category(p_name)
    
    # Try looking for UNUSED candidates of "other" or mismatched category? No, stick to category.
    # Try looking for USED candidates of same category (Reusing)
    
    best_cand = None
    best_score = -1.0
    
    for c in candidates:
        c_name = c['name']
        c_cat = get_category(c_name)
        
        if p_cat != 'other' and c_cat != 'other' and p_cat != c_cat: continue
        
        score = calculate_score(p_name, c_name)
        
        # Penalize used
        if c['used']:
            score -= 0.2
            
        if score > best_score:
            best_score = score
            best_cand = c
            
    if best_score > 0.3:
        p['image'] = best_cand['url']
        p['image_list'] = [best_cand['url']]
        best_cand['used'] = True # Mark used again
        p['_temp_assigned'] = True
        assignments += 1
        print(f"Assigned (Relaxed): '{p_name}' -> '{best_cand['name']}' (Score: {best_score:.2f})")
    else:
        print(f"FAILED to assign: '{p_name}'")

# Cleanup
for p in target_products:
    if '_temp_assigned' in p: del p['_temp_assigned']

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
