import json
import os
import re
import unicodedata

def normalize(text):
    if not text: return ""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    return text.strip()

candidates = {}

if os.path.exists('new_kids_dump.html'):
    try:
        with open('new_kids_dump.html', 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            # JSON-LD
            ld_regex = r'<script[^>]*id="product-list-carousel-schema"[^>]*>(.*?)</script>'
            ld_match = re.search(ld_regex, content, re.DOTALL)
            if ld_match:
                try:
                    data_ld = json.loads(ld_match.group(1))
                    items = data_ld.get('itemListElement', [])
                    for item in items:
                        prod = item.get('item', {})
                        name = normalize(prod.get('name', ''))
                        imgs = prod.get('image', [])
                        if isinstance(imgs, str): imgs = [imgs]
                        if imgs: candidates[name] = imgs[0]
                except: pass
            
            # Loose Parse
            matches = re.finditer(r'title=\"([^\"]+)\"', content)
            for m in matches:
                name = normalize(m.group(1))
                chunk = content[m.end():m.end()+1500] 
                img_match = re.search(r'(?:src|data-src)=\"(https://image.hm.com/[^\"]+)\"', chunk)
                if img_match:
                    candidates[name] = img_match.group(1)
    except Exception as e:
        print(f"Error reading dump: {e}")

print(f"Candidates found: {len(candidates)}")

overrides = {
    # Set 1
    'Cotton denim shirt': 'Cotton shirt', 
    'Cotton muslin resort shirt': 'Flannel shirt', 
    'Cotton cardigan': 'Cashmere-knit cardigan',
    'Cotton polo shirt': 'Zip-top polo jumper',

    # Set 2
    'Winter jacket': 'Unisex rain jacket with StormMoveTM',
    'Printed hoodie': 'Zip-through twill hoodie',
    'Printed sweatshirt': 'Printed crew-neck sweatshirt',
    'Frilled sweatshirt': 'Frilled sweatshirt',

    # Set 3
    'Appliquéd hole-knit dress': 'Collared pointelle-knit dress',
    'Denim dress': 'Flared-skirt dress',
    'Shirt dress': 'Sweatshirt dress',
    '3-piece dressy set': '2-piece T-shirt and skirt set',
    'Printed dress': 'Peplum blouse', 
    
    # Set 4
    'Matching outfit set': 'Printed sweatshorts',
    'Denim jeans': 'Loose Fit Jeans',
    'Slim Fit Jeans': 'Slim Fit Jeans',
    'Flared jeans': 'Flared leg Jeans',

    # Set 5
    'Loose-fit denim shirt': 'Cotton jersey top',
    'Appliquéd T-shirt': 'Print-motif cotton T-shirt',
    'Loose-fit pima cotton T-shirt': 'Loose-fit pima cotton T-shirt',
    'Printed cotton T-shirt': 'Printed cotton T-shirt',
    
    # General Fixes
    'Printed pyjama set': 'Cotton pyjamas', 
    'Appliquéd cap': 'Appliqued cap',
    'Motif-detail cotton cap': 'Cap',
    'Printed cotton leggings': 'Tiered cotton skort',
    'Sports top with DryMove™': 'Sports top with DryMoveTM',
    'Warming football trousers': 'Warming football trousers with ThermoMoveTM',
    'Sailor-collared cotton blouse': 'Sailor-collared cotton blouse',
    'Embroidery-detail jersey top': 'Embroidery-detail jersey top',
    '5-pack cotton jersey joggers': 'Cotton cargo joggers',
    '5-pack cotton jersey shorts': 'Printed sweatshorts', # Reuse safe
    'Cotton muslin shorts': 'Muslin shorts',
    'Linen trousers': 'Cotton twill trousers', # Reuse safe
    'Cargo trousers': 'Cotton cargo joggers', # Reuse safe
    'Knit sweater': 'Pointelle-knit top',
    'Oversized printed T-shirt': 'Printed cotton T-shirt'
}

with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

kids_products = data['products']['kids']
updates = 0

for p in kids_products:
    p_name = p['name']
    norm_p_name = normalize(p_name)
    
    # 1. Override
    target = overrides.get(p_name)
    if not target: target = overrides.get(norm_p_name, norm_p_name)
    norm_target = normalize(target)
    img_url = candidates.get(norm_target)
    
    # 2. Key Fuzzy Match (Target in Candidate)
    if not img_url:
        for cname in candidates:
            if norm_target in cname or cname in norm_target:
                img_url = candidates[cname]
                break
    
    # 3. Fallback: Token overlap
    if not img_url:
        best_score = 0
        best_c = None
        p_tokens = set(re.findall(r'\w+', norm_p_name.lower()))
        for cname in candidates:
            c_tokens = set(re.findall(r'\w+', cname.lower()))
            score = len(p_tokens.intersection(c_tokens))
            if score > best_score:
                best_score = score
                best_c = cname
        if best_score > 0:
            img_url = candidates[best_c]
            # print(f"Fallback Token Match: '{p_name}' -> '{best_c}'")

    if img_url:
        p['image'] = img_url
        p['image_list'] = [img_url]
        updates += 1
    else:
        print(f"FAILED (Final): '{p_name}'")

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print(f"Updated {updates} products.")
